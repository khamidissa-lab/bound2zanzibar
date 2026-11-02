"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { saveTourGallery } from "@/app/admin/_actions/content";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/lib/forms";
import { mediaUrl } from "@/lib/media";

import { EditorForm, SaveButton } from "./editor-controls";
import { FormMessage } from "./form-controls";

type Image = { storagePath: string; altText: string };

const input =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-ocean-deep";

export function GalleryEditor({
  tourId,
  initialImages,
  mediaPaths,
}: {
  tourId: string;
  initialImages: Image[];
  mediaPaths: string[];
}) {
  const [state, dispatch, pending] = useActionState(saveTourGallery, initialFormState);
  const [images, setImages] = useState<Image[]>(initialImages);

  const update = (index: number, patch: Partial<Image>) =>
    setImages((current) =>
      current.map((img, i) => (i === index ? { ...img, ...patch } : img)),
    );

  return (
    <section
      aria-labelledby="gallery-heading"
      className="rounded-2xl border bg-card p-5 sm:p-6"
    >
      <h2 id="gallery-heading" className="font-display text-xl">
        Gallery
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Extra photos shown on the tour page, in this order.
      </p>
      <EditorForm action={dispatch} className="mt-5 space-y-4">
        <input type="hidden" name="id" value={tourId} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
        <FormMessage state={state} />
        {mediaPaths.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            Upload photos in the media library first.
          </p>
        ) : null}
        <ul className="space-y-3">
          {images.map((img, i) => {
            const preview = mediaUrl(img.storagePath);
            return (
              <li
                key={i}
                className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[6rem_1fr_1fr_auto] sm:items-center"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin preview
                    <img src={preview} alt="" className="size-full object-cover" />
                  ) : null}
                </div>
                <select
                  aria-label={`Image ${i + 1} file`}
                  className={input}
                  value={img.storagePath}
                  onChange={(e) => update(i, { storagePath: e.target.value })}
                >
                  <option value="">Choose an image…</option>
                  {mediaPaths.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <input
                  aria-label={`Image ${i + 1} description`}
                  className={input}
                  placeholder="Describe the photo"
                  maxLength={200}
                  value={img.altText}
                  onChange={(e) => update(i, { altText: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove image ${i + 1}`}
                  onClick={() => setImages((list) => list.filter((_, j) => j !== i))}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={mediaPaths.length === 0}
            onClick={() =>
              setImages((list) => [...list, { storagePath: "", altText: "" }])
            }
          >
            <Plus aria-hidden="true" data-icon="inline-start" />
            Add image
          </Button>
          <SaveButton pending={pending}>Save gallery</SaveButton>
        </div>
      </EditorForm>
    </section>
  );
}
