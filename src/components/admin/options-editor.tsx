"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { saveTourOptions } from "@/app/admin/_actions/content";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/lib/forms";

import { EditorForm, SaveButton } from "./editor-controls";
import { FormMessage } from "./form-controls";

type Market = "resident" | "east_african" | "international";

export type OptionValue = {
  name: string;
  description: string;
  pricing: "per_person" | "per_booking";
  isActive: boolean;
  prices: { market: Market; currency: string; amount: string }[];
};

const MARKETS: { value: Market; label: string }[] = [
  { value: "international", label: "International" },
  { value: "resident", label: "Tanzania resident" },
  { value: "east_african", label: "East African" },
];

const cell =
  "h-10 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-ocean-deep";

/**
 * Priced extras visitors can add when booking this tour (for example lunch or
 * a private transfer). Prices are per market and currency, never converted;
 * an option without a price for a market shows "Price on request" there.
 */
export function OptionsEditor({
  tourId,
  initialOptions,
  currencies,
  canEdit,
}: {
  tourId: string;
  initialOptions: OptionValue[];
  currencies: string[];
  canEdit: boolean;
}) {
  const [state, dispatch, pending] = useActionState(saveTourOptions, initialFormState);
  const [options, setOptions] = useState<OptionValue[]>(initialOptions);

  const update = (i: number, patch: Partial<OptionValue>) =>
    setOptions((all) => all.map((o, j) => (j === i ? { ...o, ...patch } : o)));
  const updatePrice = (
    i: number,
    p: number,
    patch: Partial<OptionValue["prices"][number]>,
  ) =>
    update(i, {
      prices: options[i].prices.map((row, k) => (k === p ? { ...row, ...patch } : row)),
    });

  return (
    <section
      aria-labelledby="options-heading"
      className="rounded-2xl border bg-card p-5 sm:p-6"
    >
      <h2 id="options-heading" className="font-display text-xl">
        Options
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Extras visitors can add on the booking form, such as lunch or a private transfer.
        Add a price for each market you sell to; otherwise the option shows “Price on
        request” and the team quotes it.
        {!canEdit ? " Only admins can change options." : null}
      </p>

      <EditorForm action={dispatch} className="mt-5 space-y-4">
        <input type="hidden" name="id" value={tourId} />
        <input type="hidden" name="options" value={JSON.stringify(options)} />
        <FormMessage state={state} />

        {options.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No options. The booking form shows just the tour price.
          </p>
        ) : null}

        {options.map((option, i) => (
          <fieldset key={i} className="space-y-3 rounded-xl border p-4">
            <legend className="px-1 text-sm font-medium">Option {i + 1}</legend>
            <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
              <label className="text-xs text-muted-foreground">
                Name
                <input
                  className={cell}
                  disabled={!canEdit}
                  value={option.name}
                  maxLength={120}
                  onChange={(e) => update(i, { name: e.target.value })}
                />
              </label>
              <label className="text-xs text-muted-foreground">
                Priced
                <select
                  className={cell}
                  disabled={!canEdit}
                  value={option.pricing}
                  onChange={(e) =>
                    update(i, { pricing: e.target.value as OptionValue["pricing"] })
                  }
                >
                  <option value="per_person">Per person</option>
                  <option value="per_booking">Per booking</option>
                </select>
              </label>
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4"
                  disabled={!canEdit}
                  checked={option.isActive}
                  onChange={(e) => update(i, { isActive: e.target.checked })}
                />
                Active
              </label>
            </div>
            <label className="block text-xs text-muted-foreground">
              Short description (optional)
              <input
                className={cell}
                disabled={!canEdit}
                value={option.description}
                maxLength={300}
                onChange={(e) => update(i, { description: e.target.value })}
              />
            </label>

            <div className="space-y-2">
              {option.prices.map((row, p) => (
                <div key={p} className="grid grid-cols-[1.4fr_1fr_1fr_auto] gap-2">
                  <select
                    aria-label={`Option ${i + 1} price ${p + 1} market`}
                    className={cell}
                    disabled={!canEdit}
                    value={row.market}
                    onChange={(e) =>
                      updatePrice(i, p, { market: e.target.value as Market })
                    }
                  >
                    {MARKETS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label={`Option ${i + 1} price ${p + 1} currency`}
                    className={cell}
                    disabled={!canEdit}
                    value={row.currency}
                    onChange={(e) => updatePrice(i, p, { currency: e.target.value })}
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label={`Option ${i + 1} price ${p + 1} amount`}
                    className={cell}
                    disabled={!canEdit}
                    inputMode="decimal"
                    value={row.amount}
                    onChange={(e) => updatePrice(i, p, { amount: e.target.value })}
                  />
                  {canEdit ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove option ${i + 1} price ${p + 1}`}
                      onClick={() =>
                        update(i, { prices: option.prices.filter((_, k) => k !== p) })
                      }
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>

            {canEdit ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    update(i, {
                      prices: [
                        ...option.prices,
                        {
                          market: "international",
                          currency: currencies[0] ?? "USD",
                          amount: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus aria-hidden="true" data-icon="inline-start" />
                  Add price
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOptions((all) => all.filter((_, j) => j !== i))}
                >
                  <Trash2 aria-hidden="true" data-icon="inline-start" />
                  Remove option
                </Button>
              </div>
            ) : null}
          </fieldset>
        ))}

        {canEdit ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setOptions((all) => [
                  ...all,
                  {
                    name: "",
                    description: "",
                    pricing: "per_person",
                    isActive: true,
                    prices: [],
                  },
                ])
              }
            >
              <Plus aria-hidden="true" data-icon="inline-start" />
              Add option
            </Button>
            <SaveButton pending={pending}>Save options</SaveButton>
          </div>
        ) : null}
      </EditorForm>
    </section>
  );
}
