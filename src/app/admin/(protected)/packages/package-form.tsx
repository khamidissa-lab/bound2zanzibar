"use client";

import { useActionState } from "react";

import { savePackage } from "@/app/admin/_actions/content";
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
import {
  ItineraryEditor,
  type ItineraryDayValue,
} from "@/components/admin/itinerary-editor";
import { toLines } from "@/lib/admin-forms";
import { initialFormState } from "@/lib/forms";
import type { Tables } from "@/lib/supabase/database.types";
import type { Option } from "@/services/admin-content";

export function PackageForm({
  pkg,
  itinerary,
  selectedTourIds,
  selectedDestinationIds,
  tours,
  destinations,
  mediaPaths,
}: {
  pkg: Tables<"packages"> | null;
  itinerary: ItineraryDayValue[];
  selectedTourIds: string[];
  selectedDestinationIds: string[];
  tours: Option[];
  destinations: Option[];
  mediaPaths: string[];
}) {
  const [state, dispatch, pending] = useActionState(savePackage, initialFormState);
  const e = state.fieldErrors ?? {};
  const p = pkg;

  return (
    <EditorForm action={dispatch} className="space-y-6">
      {p ? <input type="hidden" name="id" value={p.id} /> : null}

      <FieldSet legend="Basics">
        <TextField
          name="name"
          label="Package name"
          defaultValue={p?.name}
          maxLength={160}
          error={e.name}
          className="sm:col-span-2"
        />
        <TextField
          name="slug"
          label="URL slug"
          defaultValue={p?.slug}
          maxLength={80}
          error={e.slug}
          hint="Leave empty to create it from the name."
          className="sm:col-span-2"
        />
        <TextField
          name="days"
          label="Days"
          type="number"
          min={1}
          max={60}
          defaultValue={p?.days ?? 4}
          error={e.days}
        />
        <TextField
          name="nights"
          label="Nights"
          type="number"
          min={0}
          max={60}
          defaultValue={p?.nights ?? 3}
          error={e.nights}
        />
        <TextAreaField
          name="shortDescription"
          label="Summary"
          defaultValue={p?.short_description}
          rows={2}
          maxLength={300}
          error={e.shortDescription}
          className="sm:col-span-2"
        />
        <TextAreaField
          name="description"
          label="Overview"
          defaultValue={p?.description}
          rows={5}
          maxLength={10000}
          error={e.description}
          hint="Separate paragraphs with an empty line."
          className="sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <CheckboxField
            name="isSafari"
            label="Includes a mainland safari (shown on the Safari page)"
            defaultChecked={p?.is_safari ?? false}
          />
        </div>
      </FieldSet>

      <FieldSet
        legend="Day-by-day itinerary"
        description="Days are numbered in the order shown."
      >
        <ItineraryEditor initialDays={itinerary} error={e.itinerary} />
      </FieldSet>

      <FieldSet legend="Stays, transfers & meals">
        <TextAreaField
          name="accommodationDescription"
          label="Accommodation"
          defaultValue={p?.accommodation_description}
          rows={3}
          maxLength={1000}
          error={e.accommodationDescription}
        />
        <TextAreaField
          name="transfersDescription"
          label="Transfers"
          defaultValue={p?.transfers_description}
          rows={3}
          maxLength={1000}
          error={e.transfersDescription}
        />
        <TextAreaField
          name="mealsDescription"
          label="Meals"
          defaultValue={p?.meals_description}
          rows={2}
          maxLength={500}
          error={e.mealsDescription}
          className="sm:col-span-2"
        />
        <TextAreaField
          name="inclusions"
          label="Included"
          defaultValue={toLines(p?.inclusions)}
          hint="One item per line."
          error={e.inclusions}
        />
        <TextAreaField
          name="exclusions"
          label="Not included"
          defaultValue={toLines(p?.exclusions)}
          hint="One item per line."
          error={e.exclusions}
        />
        <TextAreaField
          name="terms"
          label="Terms"
          defaultValue={toLines(p?.terms)}
          rows={4}
          hint="One term per line. Final terms must be approved by the business."
          error={e.terms}
          className="sm:col-span-2"
        />
      </FieldSet>

      <FieldSet legend="Linked tours & destinations">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Experiences included</legend>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
            {tours.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tours yet.</p>
            ) : (
              tours.map((t) => (
                <CheckboxField
                  key={t.id}
                  name="tourIds"
                  value={t.id}
                  label={t.name}
                  defaultChecked={selectedTourIds.includes(t.id)}
                />
              ))
            )}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Destinations visited</legend>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
            {destinations.map((d) => (
              <CheckboxField
                key={d.id}
                name="destinationIds"
                value={d.id}
                label={d.name}
                defaultChecked={selectedDestinationIds.includes(d.id)}
              />
            ))}
          </div>
        </fieldset>
      </FieldSet>

      <FieldSet legend="Image">
        <ImagePicker
          mediaPaths={mediaPaths}
          defaultPath={p?.cover_image_path ?? null}
          defaultAlt={p?.cover_image_alt ?? null}
          error={e.coverImagePath}
        />
      </FieldSet>

      <FieldSet legend="Publishing & search">
        <SelectField
          name="status"
          label="Status"
          defaultValue={p?.status ?? "draft"}
          options={STATUS_OPTIONS}
          error={e.status}
        />
        <TextField
          name="sortOrder"
          label="Display order"
          type="number"
          min={0}
          max={1000}
          defaultValue={p?.sort_order ?? 0}
          error={e.sortOrder}
        />
        <div className="sm:col-span-2">
          <CheckboxField
            name="isFeatured"
            label="Feature on the home page"
            defaultChecked={p?.is_featured ?? false}
          />
        </div>
        <TextField
          name="seoTitle"
          label="Search title (optional)"
          defaultValue={p?.seo_title ?? ""}
          maxLength={70}
          error={e.seoTitle}
        />
        <TextField
          name="seoDescription"
          label="Search description (optional)"
          defaultValue={p?.seo_description ?? ""}
          maxLength={170}
          error={e.seoDescription}
        />
      </FieldSet>

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton pending={pending}>{p ? "Save package" : "Create package"}</SaveButton>
        <FormMessage state={state} />
      </div>
    </EditorForm>
  );
}
