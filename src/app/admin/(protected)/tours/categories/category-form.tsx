"use client";

import { useActionState } from "react";

import { saveCategory } from "@/app/admin/_actions/content";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  CheckboxField,
  EditorForm,
  SaveButton,
  TextField,
} from "@/components/admin/editor-controls";
import { FormMessage } from "@/components/admin/form-controls";
import { initialFormState } from "@/lib/forms";
import type { Tables } from "@/lib/supabase/database.types";

export function CategoryForm({
  category,
  canDelete,
}: {
  category: Tables<"tour_categories"> | null;
  canDelete: boolean;
}) {
  const [state, dispatch, pending] = useActionState(saveCategory, initialFormState);
  const e = state.fieldErrors ?? {};
  // Field ids must be unique per row on this page.
  const key = category?.id.slice(0, 8) ?? "new";

  return (
    <div className="rounded-2xl border bg-card p-5">
      <EditorForm action={dispatch} className="grid gap-4 sm:grid-cols-2">
        {category ? <input type="hidden" name="id" value={category.id} /> : null}
        <TextField
          name="name"
          id={`name-${key}`}
          label="Name"
          defaultValue={category?.name}
          maxLength={80}
          error={e.name}
        />
        <TextField
          name="slug"
          id={`slug-${key}`}
          label="URL slug"
          defaultValue={category?.slug}
          maxLength={80}
          error={e.slug}
          hint="Leave empty to create it from the name."
        />
        <TextField
          name="description"
          id={`description-${key}`}
          label="Description"
          defaultValue={category?.description ?? ""}
          maxLength={500}
          className="sm:col-span-2"
        />
        <TextField
          name="sortOrder"
          id={`sort-${key}`}
          label="Display order"
          type="number"
          min={0}
          max={1000}
          defaultValue={category?.sort_order ?? 0}
          error={e.sortOrder}
        />
        <div className="flex items-end pb-2">
          <CheckboxField
            id={`active-${key}`}
            name="isActive"
            value="on"
            label="Active (visible on the website)"
            defaultChecked={category?.is_active ?? true}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <SaveButton pending={pending}>{category ? "Save" : "Add category"}</SaveButton>
          <FormMessage state={state} />
        </div>
      </EditorForm>
      {category && canDelete ? (
        <div className="mt-4 border-t pt-4">
          <DeleteButton
            table="tour_categories"
            id={category.id}
            itemName={category.name}
          />
        </div>
      ) : null}
    </div>
  );
}
