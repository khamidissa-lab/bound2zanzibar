"use client";

import { useActionState } from "react";

import { saveTour } from "@/app/admin/_actions/content";
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
import { TravelStyleField } from "@/components/admin/travel-style-field";
import { toLines } from "@/lib/admin-forms";
import { serializeFaqs, serializeSteps } from "@/lib/tour-details-format";
import { parseFaqs, parseTourSteps } from "@/services/content-mappers";
import { initialFormState } from "@/lib/forms";
import type { Tables } from "@/lib/supabase/database.types";
import type { Option } from "@/services/admin-content";

const LIST_HINT = "One item per line.";

export function TourForm({
  tour,
  categories,
  destinations,
  mediaPaths,
}: {
  tour: Tables<"tours"> | null;
  categories: Option[];
  destinations: Option[];
  mediaPaths: string[];
}) {
  const [state, dispatch, pending] = useActionState(saveTour, initialFormState);
  const e = state.fieldErrors ?? {};

  return (
    <EditorForm action={dispatch} className="space-y-6">
      {tour ? <input type="hidden" name="id" value={tour.id} /> : null}

      <FieldSet legend="Basics">
        <TextField
          name="name"
          label="Tour name"
          defaultValue={tour?.name}
          required
          maxLength={160}
          error={e.name}
          className="sm:col-span-2"
        />
        <TextField
          name="slug"
          label="URL slug"
          defaultValue={tour?.slug}
          maxLength={80}
          error={e.slug}
          hint="Used in the web address (/tours/your-slug). Leave empty to create it from the name."
        />
        <TextField
          name="durationText"
          label="Duration"
          defaultValue={tour?.duration_text}
          maxLength={120}
          placeholder="e.g. Half day (approx. 3–4 hours)"
          error={e.durationText}
        />
        <SelectField
          name="length"
          label="Trip length (for filters)"
          defaultValue={tour?.length ?? ""}
          placeholder="Not set"
          options={[
            { value: "hours", label: "A few hours" },
            { value: "half_day", label: "Half day" },
            { value: "full_day", label: "Full day" },
            { value: "multi_day", label: "Several days" },
          ]}
          error={e.length}
        />
        <SelectField
          name="categoryId"
          label="Category"
          defaultValue={tour?.category_id ?? ""}
          placeholder="No category"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          error={e.categoryId}
        />
        <SelectField
          name="destinationId"
          label="Destination"
          defaultValue={tour?.destination_id ?? ""}
          placeholder="No destination"
          options={destinations.map((d) => ({ value: d.id, label: d.name }))}
          error={e.destinationId}
        />
        <TextAreaField
          name="shortDescription"
          label="Short description"
          defaultValue={tour?.short_description}
          rows={2}
          maxLength={300}
          error={e.shortDescription}
          hint="Shown on tour cards. One or two sentences."
          className="sm:col-span-2"
        />
        <TextAreaField
          name="description"
          label="Full description"
          defaultValue={tour?.description}
          rows={7}
          maxLength={10000}
          error={e.description}
          hint="Separate paragraphs with an empty line."
          className="sm:col-span-2"
        />
      </FieldSet>

      <FieldSet legend="Details">
        <TextAreaField
          name="highlights"
          label="Highlights"
          defaultValue={toLines(tour?.highlights)}
          hint={LIST_HINT}
          error={e.highlights}
        />
        <TextAreaField
          name="whatToBring"
          label="What to bring"
          defaultValue={toLines(tour?.what_to_bring)}
          hint={LIST_HINT}
          error={e.whatToBring}
        />
        <TextAreaField
          name="inclusions"
          label="Included"
          defaultValue={toLines(tour?.inclusions)}
          hint={LIST_HINT}
          error={e.inclusions}
        />
        <TextAreaField
          name="exclusions"
          label="Not included"
          defaultValue={toLines(tour?.exclusions)}
          hint={LIST_HINT}
          error={e.exclusions}
        />
        <TextAreaField
          name="meetingPoint"
          label="Meeting point & pickup"
          defaultValue={tour?.meeting_point ?? ""}
          rows={2}
          maxLength={500}
          error={e.meetingPoint}
          hint="Avoid exact times unless they are confirmed."
          className="sm:col-span-2"
        />
        <SelectField
          name="difficulty"
          label="Difficulty"
          defaultValue={tour?.difficulty ?? ""}
          placeholder="Not specified"
          options={[
            { value: "easy", label: "Easy" },
            { value: "moderate", label: "Moderate" },
            { value: "challenging", label: "Challenging" },
          ]}
          error={e.difficulty}
        />
        <TextField
          name="suitability"
          label="Suitability"
          defaultValue={tour?.suitability ?? ""}
          maxLength={300}
          placeholder="e.g. Suitable for families"
          error={e.suitability}
        />
        <TravelStyleField selected={tour?.travel_styles ?? []} error={e.travelStyles} />
      </FieldSet>

      <FieldSet
        legend="More details"
        description="Shown in the “More details” tab on the tour page and on tour cards."
      >
        <TextAreaField
          name="whatToExpect"
          label="What to expect (step by step)"
          defaultValue={serializeSteps(parseTourSteps(tour?.what_to_expect))}
          rows={7}
          error={e.whatToExpect}
          hint="One step per line, as “Title: description”, e.g. “Darajani market: See the busy spice and fish market.”"
          className="sm:col-span-2"
        />
        <TextAreaField
          name="goodToKnow"
          label="Good to know"
          defaultValue={toLines(tour?.good_to_know)}
          rows={4}
          error={e.goodToKnow}
          hint="One note per line: timing, tides, dress, accessibility…"
          className="sm:col-span-2"
        />
        <TextAreaField
          name="faqs"
          label="Tour FAQs"
          defaultValue={serializeFaqs(parseFaqs(tour?.faqs))}
          rows={7}
          error={e.faqs}
          hint="Question on the first line, answer on the next; leave an empty line between FAQs. General booking FAQs are added automatically."
          className="sm:col-span-2"
        />
      </FieldSet>

      <FieldSet legend="Image">
        <ImagePicker
          mediaPaths={mediaPaths}
          defaultPath={tour?.cover_image_path ?? null}
          defaultAlt={tour?.cover_image_alt ?? null}
          error={e.coverImagePath}
        />
      </FieldSet>

      <FieldSet legend="Publishing & search">
        <SelectField
          name="status"
          label="Status"
          defaultValue={tour?.status ?? "draft"}
          options={STATUS_OPTIONS}
          error={e.status}
        />
        <TextField
          name="sortOrder"
          label="Display order"
          type="number"
          min={0}
          max={1000}
          defaultValue={tour?.sort_order ?? 0}
          error={e.sortOrder}
          hint="Lower numbers appear first."
        />
        <div className="sm:col-span-2">
          <CheckboxField
            name="isFeatured"
            label="Feature on the home page"
            defaultChecked={tour?.is_featured ?? false}
          />
        </div>
        <TextField
          name="seoTitle"
          label="Search title (optional)"
          defaultValue={tour?.seo_title ?? ""}
          maxLength={70}
          error={e.seoTitle}
          hint="Up to 70 characters. Defaults to the tour name."
        />
        <TextField
          name="seoDescription"
          label="Search description (optional)"
          defaultValue={tour?.seo_description ?? ""}
          maxLength={170}
          error={e.seoDescription}
          hint="Up to 170 characters. Defaults to the short description."
        />
      </FieldSet>

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton pending={pending}>{tour ? "Save tour" : "Create tour"}</SaveButton>
        <FormMessage state={state} />
      </div>
    </EditorForm>
  );
}
