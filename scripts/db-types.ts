/**
 * Generates src/lib/supabase/database.types.ts by introspecting the schema
 * produced by the migrations (applied to an in-process PGlite database), in
 * the same shape as `supabase gen types typescript`.
 *
 *   npm run db:types
 *
 * Once a hosted project exists you can switch to the official generator:
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { PGlite } from "@electric-sql/pglite";

type ColumnRow = {
  table_name: string;
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: "YES" | "NO";
  column_default: string | null;
  ordinal_position: number;
};

type FkRow = {
  constraint_name: string;
  table_name: string;
  columns: string[];
  referenced_table: string;
  referenced_columns: string[];
  is_one_to_one: boolean;
};

type FnRow = {
  name: string;
  arg_names: string[];
  arg_types: string[];
  arg_defaults: number;
  returns_set: boolean;
  return_type: string;
  table_columns: { name: string; type: string }[] | null;
};

const scalar = (udt: string, enums: Set<string>): string => {
  if (enums.has(udt)) return `Database["public"]["Enums"]["${udt}"]`;
  switch (udt) {
    case "bool":
      return "boolean";
    case "int2":
    case "int4":
    case "int8":
    case "float4":
    case "float8":
    case "numeric":
      return "number";
    case "json":
    case "jsonb":
      return "Json";
    default:
      return "string";
  }
};

const columnType = (c: { udt_name: string }, enums: Set<string>) =>
  c.udt_name.startsWith("_")
    ? `${scalar(c.udt_name.slice(1), enums)}[]`
    : scalar(c.udt_name, enums);

export async function renderDatabaseTypes(db: PGlite): Promise<string> {
  const enumRows = (
    await db.query<{ name: string; values: string[] }>(`
      select t.typname as name, array_agg(e.enumlabel order by e.enumsortorder) as values
      from pg_type t join pg_enum e on e.enumtypid = t.oid
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public' group by t.typname order by t.typname`)
  ).rows;
  const enums = new Set(enumRows.map((e) => e.name));

  const columns = (
    await db.query<ColumnRow>(`
      select c.table_name, c.column_name, c.data_type, c.udt_name, c.is_nullable,
             c.column_default, c.ordinal_position
      from information_schema.columns c
      join information_schema.tables t
        on t.table_schema = c.table_schema and t.table_name = c.table_name
      where c.table_schema = 'public' and t.table_type = 'BASE TABLE'
      order by c.table_name, c.ordinal_position`)
  ).rows;

  const fks = (
    await db.query<FkRow>(`
      select con.conname as constraint_name, rel.relname as table_name,
        array(select a.attname from unnest(con.conkey) with ordinality k(n, o)
              join pg_attribute a on a.attrelid = con.conrelid and a.attnum = k.n order by k.o) as columns,
        frel.relname as referenced_table,
        array(select a.attname from unnest(con.confkey) with ordinality k(n, o)
              join pg_attribute a on a.attrelid = con.confrelid and a.attnum = k.n order by k.o) as referenced_columns,
        exists (
          select 1 from pg_constraint u
          where u.conrelid = con.conrelid and u.contype in ('p', 'u')
            and (select array_agg(x order by x) from unnest(u.conkey) x)
              = (select array_agg(x order by x) from unnest(con.conkey) x)
        ) as is_one_to_one
      from pg_constraint con
      join pg_class rel on rel.oid = con.conrelid
      join pg_namespace n on n.oid = rel.relnamespace
      join pg_class frel on frel.oid = con.confrelid
      join pg_namespace fn on fn.oid = frel.relnamespace
      where con.contype = 'f' and n.nspname = 'public' and fn.nspname = 'public'
      order by rel.relname, con.conname`)
  ).rows;

  const fns = (
    await db.query<FnRow>(`
      select p.proname as name,
        coalesce(p.proargnames[1:p.pronargs], '{}') as arg_names,
        array(select format_type(t, null) from unnest(p.proargtypes) t) as arg_types,
        p.pronargdefaults as arg_defaults,
        p.proretset as returns_set,
        format_type(p.prorettype, null) as return_type,
        (select json_agg(json_build_object('name', p.proargnames[i], 'type', format_type(p.proallargtypes[i], null)) order by i)
           from generate_subscripts(p.proallargtypes, 1) i where p.proargmodes[i] = 't') as table_columns
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.prokind = 'f'
      order by p.proname`)
  ).rows;

  const typeName = (formatted: string) => {
    const bare = formatted.replace(/^public\./, "").replace(/\[\]$/, "");
    const udt =
      { integer: "int4", boolean: "bool", date: "date", text: "text" }[bare] ?? bare;
    const base = scalar(udt, enums);
    return formatted.endsWith("[]") ? `${base}[]` : base;
  };

  const tables = [...new Set(columns.map((c) => c.table_name))];
  const out: string[] = [];
  out.push(
    "// Generated by scripts/db-types.ts from supabase/migrations — do not edit by hand.",
    "// Regenerate with: npm run db:types",
    "",
    "export type Json =",
    "  | string",
    "  | number",
    "  | boolean",
    "  | null",
    "  | { [key: string]: Json | undefined }",
    "  | Json[];",
    "",
    "export type Database = {",
    "  __InternalSupabase: {",
    '    PostgrestVersion: "13";',
    "  };",
    "  public: {",
    "    Tables: {",
  );

  for (const table of tables) {
    const cols = columns.filter((c) => c.table_name === table);
    out.push(`      ${table}: {`, "        Row: {");
    for (const c of cols) {
      const nullable = c.is_nullable === "YES" ? " | null" : "";
      out.push(`          ${c.column_name}: ${columnType(c, enums)}${nullable};`);
    }
    out.push("        };", "        Insert: {");
    for (const c of cols) {
      const optional = c.is_nullable === "YES" || c.column_default !== null ? "?" : "";
      const nullable = c.is_nullable === "YES" ? " | null" : "";
      out.push(
        `          ${c.column_name}${optional}: ${columnType(c, enums)}${nullable};`,
      );
    }
    out.push("        };", "        Update: {");
    for (const c of cols) {
      const nullable = c.is_nullable === "YES" ? " | null" : "";
      out.push(`          ${c.column_name}?: ${columnType(c, enums)}${nullable};`);
    }
    out.push("        };", "        Relationships: [");
    for (const fk of fks.filter((f) => f.table_name === table)) {
      out.push(
        "          {",
        `            foreignKeyName: "${fk.constraint_name}";`,
        `            columns: [${fk.columns.map((x) => `"${x}"`).join(", ")}];`,
        `            isOneToOne: ${fk.is_one_to_one};`,
        `            referencedRelation: "${fk.referenced_table}";`,
        `            referencedColumns: [${fk.referenced_columns.map((x) => `"${x}"`).join(", ")}];`,
        "          },",
      );
    }
    out.push("        ];", "      };");
  }

  out.push(
    "    };",
    "    Views: {",
    "      [_ in never]: never;",
    "    };",
    "    Functions: {",
  );
  for (const fn of fns) {
    const firstDefault = fn.arg_names.length - fn.arg_defaults;
    if (fn.arg_names.length === 0) {
      out.push(`      ${fn.name}: {`, "        Args: never;");
    } else {
      out.push(`      ${fn.name}: {`, "        Args: {");
      fn.arg_names.forEach((name, i) => {
        const optional = i >= firstDefault ? "?" : "";
        out.push(`          ${name}${optional}: ${typeName(fn.arg_types[i])};`);
      });
      out.push("        };");
    }
    if (fn.table_columns) {
      out.push("        Returns: {");
      for (const col of fn.table_columns)
        out.push(`          ${col.name}: ${typeName(col.type)};`);
      out.push(`        }${fn.returns_set ? "[]" : ""};`);
    } else {
      const ret = fn.return_type === "void" ? "undefined" : typeName(fn.return_type);
      out.push(`        Returns: ${ret}${fn.returns_set ? "[]" : ""};`);
    }
    out.push("      };");
  }
  out.push("    };", "    Enums: {");
  for (const e of enumRows) {
    out.push(`      ${e.name}: ${e.values.map((v) => `"${v}"`).join(" | ")};`);
  }
  out.push(
    "    };",
    "    CompositeTypes: {",
    "      [_ in never]: never;",
    "    };",
    "  };",
    "};",
    "",
    'type PublicSchema = Database["public"];',
    "",
    'export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];',
    'export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];',
    'export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];',
    'export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];',
    "",
  );
  return out.join("\n");
}

export const DATABASE_TYPES_PATH = fileURLToPath(
  new URL("../src/lib/supabase/database.types.ts", import.meta.url),
);

async function main() {
  const { createTestDatabase } = await import("../supabase/tests/db-harness");
  const db = await createTestDatabase();
  writeFileSync(DATABASE_TYPES_PATH, await renderDatabaseTypes(db));
  await db.close();
  console.log(`Wrote ${DATABASE_TYPES_PATH}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
