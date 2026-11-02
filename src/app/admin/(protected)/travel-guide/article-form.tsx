"use client";

import { useActionState } from "react";

import { saveArticle } from "@/app/admin/_actions/content";
import { STATUS_OPTIONS } from "@/components/admin/content-list";
import {
  EditorForm,
  FieldSet,
  SaveButton,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/editor-controls";
import { FormMessage } from "@/components/admin/form-controls";
import { ImagePicker } from "@/components/admin/image-picker";
import { initialFormState } from "@/lib/forms";
import type { Tables } from "@/lib/supabase/database.types";

export function ArticleForm({
  article,
  bodyMarkup,
  mediaPaths,
}: {
  article: Tables<"blog_posts"> | null;
  bodyMarkup: string;
  mediaPaths: string[];
}) {
  const [state, dispatch, pending] = useActionState(saveArticle, initialFormState);
  const e = state.fieldErrors ?? {};
  const a = article;

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
