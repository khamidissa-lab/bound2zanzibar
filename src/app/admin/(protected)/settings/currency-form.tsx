"use client";

import { useActionState } from "react";

import { saveCurrency } from "@/app/admin/_actions/settings";
import {
  CheckboxField,
  EditorForm,
  SaveButton,
  TextField,
} from "@/components/admin/editor-controls";
import { FormMessage } from "@/components/admin/form-controls";
import { initialFormState } from "@/lib/forms";

export type CurrencyRow = {
  code: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  /** Active tour, package and option prices in this currency. */
  prices: number;
};

export function CurrencyForm({ currency }: { currency: CurrencyRow | null }) {
  const [state, dispatch, pending] = useActionState(saveCurrency, initialFormState);
  const e = state.fieldErrors ?? {};
  const key = currency?.code ?? "new";

  return (
    <div className="rounded-xl border bg-card p-5">
      <EditorForm action={dispatch} className="grid gap-4 sm:grid-cols-[8rem_1fr_8rem]">
        {currency ? (
          <>
            <input type="hidden" name="existing" value={currency.code} />
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Code</p>
              <p className="flex h-11 items-center font-mono text-lg font-semibold text-ocean-deep">
                {currency.code}
              </p>
            </div>
          </>
        ) : (
          <TextField
            name="code"
            id={`code-${key}`}
            label="Code"
            maxLength={3}
            placeholder="EUR"
            autoCapitalize="characters"
            error={e.code}
          />
        )}
        <TextField
          name="name"
          id={`name-${key}`}
          label="Name"
          defaultValue={currency?.name}
          maxLength={60}
          placeholder="Euro"
          error={e.name}
        />
        <TextField
          name="sortOrder"
          id={`sort-${key}`}
          label="Display order"
          type="number"
          min={0}
          max={1000}
          defaultValue={currency?.sort_order ?? 0}
          error={e.sortOrder}
        />
        <div className="sm:col-span-3">
          <CheckboxField
            id={`active-${key}`}
            name="isActive"
            value="on"
            label="Active (available for prices and booking requests)"
            defaultChecked={currency?.is_active ?? true}
          />
          {currency ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Used by {currency.prices.toLocaleString("en-US")} active{" "}
              {currency.prices === 1 ? "price" : "prices"}.
              {currency.prices > 0
                ? " It can't be switched off while prices use it."
                : ""}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
          <SaveButton pending={pending}>{currency ? "Save" : "Add currency"}</SaveButton>
          <FormMessage state={state} />
        </div>
      </EditorForm>
    </div>
  );
}
