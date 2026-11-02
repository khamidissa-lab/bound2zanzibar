"use client";

import { useRef, useState, useTransition } from "react";
import { CircleAlert, CircleCheck, Loader2, Upload } from "lucide-react";

import { mediaChanged } from "@/app/admin/_actions/content";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MEDIA_BUCKET,
  storageFileName,
} from "@/lib/media";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Result = { name: string; ok: boolean; message: string };

const FOLDERS = [
  { value: "tours", label: "Tours" },
  { value: "destinations", label: "Destinations" },
  { value: "packages", label: "Packages" },
  { value: "guide", label: "Travel guide" },
  { value: "general", label: "General" },
];

/**
 * Uploads straight from the browser to Supabase Storage using the staff
 * member's own session. Checks here give quick feedback; the bucket's size and
 * type limits and the storage RLS policies enforce the same rules server-side.
 */
export function MediaUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [folder, setFolder] = useState("tours");
  const [results, setResults] = useState<Result[]>([]);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();

  async function upload(files: FileList) {
    setUploading(true);
    setResults([]);
    const supabase = createSupabaseBrowserClient();
    const next: Result[] = [];

    for (const file of Array.from(files)) {
      if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        next.push({
          name: file.name,
          ok: false,
          message: "Use JPEG, PNG, WebP or AVIF.",
        });
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        next.push({
          name: file.name,
          ok: false,
          message: "Larger than 5 MB — please resize it.",
        });
        continue;
      }
      const prefix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const path = `${folder}/${storageFileName(file.name, prefix)}`;
      const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });
      next.push(
        error
          ? { name: file.name, ok: false, message: "Upload failed. Please try again." }
          : { name: file.name, ok: true, message: `Uploaded as ${path}` },
      );
    }

    setResults(next);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (next.some((r) => r.ok)) startTransition(() => mediaChanged());
  }

  return (
    <section
      aria-labelledby="upload-heading"
      className="rounded-2xl border bg-card p-5 sm:p-6"
    >
      <h2 id="upload-heading" className="font-display text-xl">
        Upload images
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        JPEG, PNG, WebP or AVIF, up to 5 MB each. Only upload photos you own or are
        licensed to use.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-[12rem_1fr] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="media-folder">Folder</Label>
          <select
            id="media-folder"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {FOLDERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            ref={inputRef}
            id="media-files"
            type="file"
            multiple
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            className="sr-only"
            onChange={(e) => e.target.files?.length && upload(e.target.files)}
          />
          <Button
            type="button"
            size="lg"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2
                className="animate-spin"
                aria-hidden="true"
                data-icon="inline-start"
              />
            ) : (
              <Upload aria-hidden="true" data-icon="inline-start" />
            )}
            {uploading ? "Uploading…" : "Choose images"}
          </Button>
        </div>
      </div>
      {results.length > 0 ? (
        <ul className="mt-4 space-y-1.5 text-sm" aria-live="polite">
          {results.map((r, i) => (
            <li
              key={`${r.name}-${i}`}
              className={
                r.ok ? "flex gap-2 text-ocean-deep" : "flex gap-2 text-destructive"
              }
            >
              {r.ok ? (
                <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              ) : (
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              )}
              <span>
                <span className="font-medium">{r.name}</span>: {r.message}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
