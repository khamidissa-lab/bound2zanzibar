"use client";

import { useActionState } from "react";

import { saveArticle } from "@/app/admin/_actions/content";
import { STATUS_OPTIONS } from "@/components/admin/content-list";
import {
  EditorForm,
  FieldSet,
  SaveButton,
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/editor-controls";
import { FormMessage } from "@/components/admin/form-controls";
import { ImagePicker } from "@/components/admin/image-picker";
import { initialFormState } from "@/lib/forms";
import type { ArticleDetail, Option } from "@/services/admin-content";
import { ARTICLE_CATEGORIES, type ArticleCategory } from "@/types/content";

/** Admin labels (the admin is in English). */
const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  "zanzibar-guide": "Zanzibar travel guide",
  "things-to-do": "Things to do in Zanzibar",
  "safari-guides": "Tanzania safari guides",
  "travel-tips": "Travel tips",
  "culture-history": "Culture & history",
  "beach-islands": "Beach & island experiences",
};

export function ArticleForm({
  article,
  bodyMarkup,
  mediaPaths,
  tours,
}: {
  article: ArticleDetail | null;
  bodyMarkup: string;
  mediaPaths: string[];
  tours: Option[];
}) {
  const [state, dispatch, pending] = useActionState(saveArticle, initialFormState);
  const e = state.fieldErrors ?? {};
  const a = article;
  const selectedTours = [...(a?.blog_post_tours ?? [])]
    .sort((x, y) => x.sort_order - y.sort_order)
    .map((r) => r.tour_id);

  return (
    <EditorForm action={dispatch} className="space-y-6">
      {a ? <input type="hidden" name="id" value={a.id} /> : null}

      <FieldSet legend="Article">
        <TextField
          name="title"
          label="Title"
          defaultValue={a?.title}
          maxLength={200}
          error={e.title}
          className="sm:col-span-2"
        />
        <TextField
          name="slug"
          label="URL slug"
          defaultValue={a?.slug}
          maxLength={80}
          error={e.slug}
          hint="Leave empty to create it from the title."
        />
        <TextField
          name="tags"
          label="Tags"
          defaultValue={a?.tags.join(", ")}
          maxLength={300}
          error={e.tags}
          hint="Separate with commas, e.g. Planning, Seasons"
        />
        <TextAreaField
          name="excerpt"
          label="Excerpt"
          defaultValue={a?.excerpt}
          rows={2}
          maxLength={400}
          error={e.excerpt}
          hint="Shown on article cards and in search results."
          className="sm:col-span-2"
        />
        <TextAreaField
          name="body"
          label="Body"
          defaultValue={bodyMarkup}
          rows={18}
          maxLength={40000}
          error={e.body}
          className="sm:col-span-2"
          hint={
            <>
              Start each section with <code>## Heading</code> on its own line. Separate
              paragraphs with an empty line. Plain text only — HTML is shown as text.
            </>
          }
        />
        <TextField
          name="readingMinutes"
          label="Reading time in minutes (optional)"
          type="number"
          min={1}
          max={120}
          defaultValue={a?.reading_minutes ?? ""}
          error={e.readingMinutes}
          hint="Leave empty to estimate it automatically."
        />
      </FieldSet>

      <FieldSet legend="Journal">
        <SelectField
          name="category"
          label="Category"
          defaultValue={a?.category ?? "travel-tips"}
          options={ARTICLE_CATEGORIES.map((c) => ({
            value: c,
            label: CATEGORY_LABELS[c],
          }))}
          error={e.category}
        />
        <TextField
          name="authorName"
          label="Author name"
          defaultValue={a?.author_name ?? ""}
          maxLength={80}
          placeholder="The Bound to Zanzibar team"
          hint="Leave empty to show the team name."
          error={e.authorName}
        />
        <div className="sm:col-span-2">
          <CheckboxField
            name="isFeatured"
            label="Feature this article first on the travel guide page"
            defaultChecked={a?.is_featured ?? false}
          />
        </div>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-medium">Related tours</legend>
          <p className="mb-2 text-xs text-muted-foreground">
            Shown at the end of the article. Choose up to 12.
          </p>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
            {tours.map((tour) => (
              <CheckboxField
                key={tour.id}
                name="tourIds"
                value={tour.id}
                label={tour.name}
                defaultChecked={selectedTours.includes(tour.id)}
              />
            ))}
          </div>
          {e.tourIds ? (
            <p className="mt-1 text-sm text-destructive">{e.tourIds}</p>
          ) : null}
        </fieldset>
      </FieldSet>

      <FieldSet legend="Image">
        <ImagePicker
          mediaPaths={mediaPaths}
          defaultPath={a?.cover_image_path ?? null}
          defaultAlt={a?.cover_image_alt ?? null}
          error={e.coverImagePath}
        />
      </FieldSet>

      <FieldSet legend="Publishing & search">
        <SelectField
          name="status"
          label="Status"
          defaultValue={a?.status ?? "draft"}
          options={STATUS_OPTIONS}
          error={e.status}
          className="sm:col-span-2"
        />
        <TextField
          name="seoTitle"
          label="Search title (optional)"
          defaultValue={a?.seo_title ?? ""}
          maxLength={70}
          error={e.seoTitle}
        />
        <TextField
          name="seoDescription"
          label="Search description (optional)"
          defaultValue={a?.seo_description ?? ""}
          maxLength={170}
          error={e.seoDescription}
        />
      </FieldSet>

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton pending={pending}>{a ? "Save article" : "Create article"}</SaveButton>
        <FormMessage state={state} />
      </div>
    </EditorForm>
  );
}
