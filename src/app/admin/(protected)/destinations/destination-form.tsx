"use client";

import { useActionState } from "react";

import { saveDestination } from "@/app/admin/_actions/content";
import { STATUS_OPTIONS } from "@/components/admin/content-list";
import {
  CheckboxField,
  EditorForm,
  FieldSet,
  SaveButton,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/editor-controls";
import { FormMessage } from "@/components/admin/form-controls";
import { ImagePicker } from "@/components/admin/image-picker";
import { toLines } from "@/lib/admin-forms";
import { initialFormState } from "@/lib/forms";
import type { Tables } from "@/lib/supabase/database.types";

export function DestinationForm({
  destination,
  mediaPaths,
}: {
  destination: Tables<"destinations"> | null;
  mediaPaths: string[];
}) {
  const [state, dispatch, pending] = useActionState(saveDestination, initialFormState);
  const e = state.fieldErrors ?? {};
  const d = destination;

  return (
    <EditorForm action={dispatch} className="space-y-6">
      {d ? <input type="hidden" name="id" value={d.id} /> : null}

      <FieldSet legend="Basics">
        <TextField
          name="name"
          label="Name"
          defaultValue={d?.name}
          maxLength={120}
          error={e.name}
        />
        <TextField
          name="slug"
          label="URL slug"
          defaultValue={d?.slug}
          maxLength={80}
          error={e.slug}
          hint="Leave empty to create it from the name."
        />
        <SelectField
          name="region"
          label="Region"
          defaultValue={d?.region ?? "zanzibar"}
          options={[
            { value: "zanzibar", label: "Zanzibar" },
            { value: "mainland", label: "Mainland Tanzania" },
          ]}
          error={e.region}
        />
        <TextAreaField
          name="shortDescription"
          label="Summary"
          defaultValue={d?.short_description}
          rows={2}
          maxLength={300}
          error={e.shortDescription}
          hint="Shown on destination cards."
          className="sm:col-span-2"
        />
        <TextAreaField
          name="description"
          label="Description"
          defaultValue={d?.description}
          rows={6}
          maxLength={10000}
          error={e.description}
          hint="Separate paragraphs with an empty line."
          className="sm:col-span-2"
        />
        <TextAreaField
          name="highlights"
          label="Highlights"
          defaultValue={toLines(d?.highlights)}
          hint="One item per line."
          error={e.highlights}
          className="sm:col-span-2"
        />
      </FieldSet>

      <FieldSet legend="Image">
        <ImagePicker
          mediaPaths={mediaPaths}
          defaultPath={d?.cover_image_path ?? null}
          defaultAlt={d?.cover_image_alt ?? null}
          error={e.coverImagePath}
        />
      </FieldSet>

      <FieldSet legend="Publishing & search">
        <SelectField
          name="status"
          label="Status"
          defaultValue={d?.status ?? "draft"}
          options={STATUS_OPTIONS}
          error={e.status}
        />
        <TextField
          name="sortOrder"
          label="Display order"
          type="number"
          min={0}
          max={1000}
          defaultValue={d?.sort_order ?? 0}
          error={e.sortOrder}
        />
        <div className="sm:col-span-2">
          <CheckboxField
            name="isFeatured"
            label="Show in “Popular destinations” on the home page"
            defaultChecked={d?.is_featured ?? false}
          />
        </div>
        <TextField
          name="seoTitle"
          label="Search title (optional)"
          defaultValue={d?.seo_title ?? ""}
          maxLength={70}
          error={e.seoTitle}
        />
        <TextField
          name="seoDescription"
          label="Search description (optional)"
          defaultValue={d?.seo_description ?? ""}
          maxLength={170}
          error={e.seoDescription}
        />
      </FieldSet>

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton pending={pending}>
          {d ? "Save destination" : "Create destination"}
        </SaveButton>
        <FormMessage state={state} />
      </div>
    </EditorForm>
  );
}
