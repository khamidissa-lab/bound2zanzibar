"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { initialFormState, type FormState } from "@/lib/forms";

import { FormMessage } from "./form-controls";
import { EditorForm, SaveButton } from "./editor-controls";

export type PriceRowValue = {
  market: "resident" | "east_african" | "international";
  customerType: "adult" | "child" | "group";
  currency: string;
  amount: string;
  unitLabel: string;
  isIllustrative: boolean;
  isActive: boolean;
};

const MARKETS = [
  { value: "international", label: "International" },
  { value: "resident", label: "Tanzania resident" },
  { value: "east_african", label: "East African" },
] as const;

const TYPES = [
  { value: "adult", label: "Adult" },
  { value: "child", label: "Child" },
  { value: "group", label: "Group" },
] as const;

const cell =
  "h-10 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-ocean-deep";

/**
 * Market prices for one tour or package. Each row is one market × traveller
 * type × currency. Prices are native: nothing is converted between currencies.
 */
export function PriceEditor({
  itemId,
  action,
  initialRows,
  currencies,
  canEdit,
  defaultUnit,
}: {
  itemId: string;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initialRows: PriceRowValue[];
  currencies: string[];
  canEdit: boolean;
  defaultUnit: string;
}) {
  const [state, dispatch, pending] = useActionState(action, initialFormState);
  const [rows, setRows] = useState<PriceRowValue[]>(initialRows);

  const update = (index: number, patch: Partial<PriceRowValue>) =>
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );

  const addRow = () =>
    setRows((current) => [
      ...current,
      {
        market: "international",
        customerType: "adult",
        currency: currencies[0] ?? "USD",
        amount: "",
        unitLabel: defaultUnit,
        isIllustrative: false,
        isActive: true,
      },
    ]);

  return (
    <section
      aria-labelledby="prices-heading"
      className="rounded-2xl border bg-card p-5 sm:p-6"
    >
      <h2 id="prices-heading" className="font-display text-xl">
        Prices
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Set a native price for each market. Visitors see the price for the market they
        choose; currencies are never converted.
        {!canEdit ? " Only admins can change prices." : null}
      </p>

      <EditorForm action={dispatch} className="mt-5 space-y-4">
        <input type="hidden" name="id" value={itemId} />
        <input type="hidden" name="prices" value={JSON.stringify(rows)} />
        <FormMessage state={state} />

        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No prices yet. The website will show “Price on request”.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="pb-2 font-medium">Market</th>
                  <th className="pb-2 font-medium">Traveller</th>
                  <th className="pb-2 font-medium">Currency</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Unit</th>
                  <th className="pb-2 font-medium">Sample?</th>
                  <th className="pb-2 font-medium">Active</th>
                  <th className="pb-2">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="align-middle">
                    <td className="py-1.5 pr-2">
                      <select
                        aria-label={`Row ${i + 1} market`}
                        className={cell}
                        disabled={!canEdit}
                        value={row.market}
                        onChange={(e) =>
                          update(i, { market: e.target.value as PriceRowValue["market"] })
                        }
                      >
                        {MARKETS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5 pr-2">
                      <select
                        aria-label={`Row ${i + 1} traveller type`}
                        className={cell}
                        disabled={!canEdit}
                        value={row.customerType}
                        onChange={(e) =>
                          update(i, {
                            customerType: e.target.value as PriceRowValue["customerType"],
                          })
                        }
                      >
                        {TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5 pr-2">
                      <select
                        aria-label={`Row ${i + 1} currency`}
                        className={cell}
                        disabled={!canEdit}
                        value={row.currency}
                        onChange={(e) => update(i, { currency: e.target.value })}
                      >
                        {currencies.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        aria-label={`Row ${i + 1} amount`}
                        className={cell}
                        disabled={!canEdit}
                        inputMode="decimal"
                        value={row.amount}
                        onChange={(e) => update(i, { amount: e.target.value })}
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        aria-label={`Row ${i + 1} unit`}
                        className={cell}
                        disabled={!canEdit}
                        value={row.unitLabel}
                        onChange={(e) => update(i, { unitLabel: e.target.value })}
                      />
                    </td>
                    <td className="py-1.5 pr-2 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Row ${i + 1} is an illustrative sample price`}
                        disabled={!canEdit}
                        checked={row.isIllustrative}
                        onChange={(e) => update(i, { isIllustrative: e.target.checked })}
                        className="size-4"
                      />
                    </td>
                    <td className="py-1.5 pr-2 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Row ${i + 1} is active`}
                        disabled={!canEdit}
                        checked={row.isActive}
                        onChange={(e) => update(i, { isActive: e.target.checked })}
                        className="size-4"
                      />
                    </td>
                    <td className="py-1.5">
                      {canEdit ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove row ${i + 1}`}
                          onClick={() => setRows((r) => r.filter((_, j) => j !== i))}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {canEdit ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={addRow}>
              <Plus aria-hidden="true" data-icon="inline-start" />
              Add price
            </Button>
            <SaveButton pending={pending}>Save prices</SaveButton>
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Tick “Sample?” for placeholder prices — the website then labels them as
          illustrative.
        </p>
      </EditorForm>
    </section>
  );
}
