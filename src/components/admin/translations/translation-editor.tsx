"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert, CircleCheck, Loader2, Save } from "lucide-react";

import { saveTranslation } from "@/app/admin/_actions/translations";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/lib/forms";
import type { FieldKind } from "@/lib/i18n/translation-form";

/** One editable value: the English text beside the translation. */
export type EditorInput = {
  name: string;
  label: string;
  kind: Exclude<FieldKind, "items">;
  english: string;
  value: string;
};

export type EditorField =
  | (EditorInput & { group?: undefined })
  | {
      group: true;
      key: string;
      label: string;
      items: { title: string; inputs: EditorInput[] }[];
    };

const inputClass =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-ink outline-none focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25";

function Input({ input, dir }: { input: EditorInput; dir: "ltr" | "rtl" }) {
  const id = `field-${input.name}`;
  const rows =
    input.kind === "text"
      ? 0
      : Math.min(12, Math.max(3, input.english.split("\n").length + 1));
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">English</p>
        <p className="min-h-10 rounded-lg bg-muted/70 px-3 py-2 text-sm whitespace-pre-line text-ocean-deep">
          {input.english || <span className="text-muted-foreground italic">(empty)</span>}
        </p>
      </div>
      <div>
        <label
          htmlFor={id}
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Translation
        </label>
        {rows === 0 ? (
          <input
            id={id}
            name={input.name}
            defaultValue={input.value}
            dir={dir}
            className={`${inputClass} h-10`}
          />
        ) : (
          <textarea
            id={id}
            name={input.name}
            defaultValue={input.value}
            dir={dir}
            rows={rows}
            className={inputClass}
          />
        )}
        {input.kind === "list" ? (
          <p className="mt-1 text-xs text-muted-foreground">One item per line.</p>
        ) : input.kind === "paragraphs" ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Leave a blank line between paragraphs.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" data-icon="inline-start" />
      ) : (
        <Save aria-hidden="true" data-icon="inline-start" />
      )}
      {pending ? "Saving…" : "Save and mark as reviewed"}
    </Button>
  );
}

export function TranslationEditor({
  entity,
  id,
  locale,
  dir,
  fields,
}: {
  entity: string;
  id: string;
  locale: string;
  dir: "ltr" | "rtl";
  fields: EditorField[];
}) {
  const [state, action] = useActionState(saveTranslation, initialFormState);

  return (
    // key: switching language remounts the form with that language's values.
    <form key={locale} action={action} className="space-y-6">
      <input type="hidden" name="entity" value={entity} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="locale" value={locale} />

      {fields.map((field) =>
        field.group ? (
          <fieldset key={field.key} className="rounded-xl border bg-card p-5">
            <legend className="px-1 text-sm font-semibold text-ocean-deep">
              {field.label}
            </legend>
            <div className="space-y-6">
              {field.items.map((item) => (
                <div
                  key={item.title}
                  className="space-y-3 border-t pt-4 first:border-t-0 first:pt-0"
                >
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {item.title}
                  </p>
                  {item.inputs.map((input) => (
                    <div key={input.name}>
                      <p className="mb-1.5 text-sm font-medium text-ocean-deep">
                        {input.label}
                      </p>
                      <Input input={input} dir={dir} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </fieldset>
        ) : (
          <div key={field.name} className="rounded-xl border bg-card p-5">
            <p className="mb-3 text-sm font-semibold text-ocean-deep">{field.label}</p>
            <Input input={field} dir={dir} />
          </div>
        ),
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 border-t bg-background/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <SaveButton />
        {state.message ? (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={
              state.status === "error"
                ? "flex items-center gap-2 text-sm text-destructive"
                : "flex items-center gap-2 text-sm text-turquoise-deep"
            }
          >
            {state.status === "error" ? (
              <CircleAlert className="size-4" aria-hidden="true" />
            ) : (
              <CircleCheck className="size-4" aria-hidden="true" />
            )}
            {state.message}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Empty fields show the English text on the website.
          </p>
        )}
      </div>
    </form>
  );
}
