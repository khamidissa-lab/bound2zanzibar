"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageOff } from "lucide-react";

import { mediaUrl } from "@/lib/media";

import { SelectField, TextField } from "./editor-controls";

/**
 * Chooses an image already uploaded to the media library, with a preview and
 * the alt text that describes it for screen readers.
 */
export function ImagePicker({
  pathName = "coverImagePath",
  altName = "coverImageAlt",
  label = "Cover image",
  mediaPaths,
  defaultPath,
  defaultAlt,
  error,
}: {
  pathName?: string;
  altName?: string;
  label?: string;
  mediaPaths: string[];
  defaultPath: string | null;
  defaultAlt: string | null;
  error?: string;
}) {
  const [path, setPath] = useState(defaultPath ?? "");
  const preview = mediaUrl(path);
  const options = mediaPaths.includes(path) || !path ? mediaPaths : [path, ...mediaPaths];

  return (
    <div className="grid gap-4 sm:col-span-2 sm:grid-cols-[10rem_1fr]">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border bg-muted">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- small admin preview of a user-chosen file
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <ImageOff className="size-5" aria-hidden="true" />
            Placeholder
          </span>
        )}
      </div>
      <div className="grid gap-3">
        <SelectField
          name={pathName}
          label={label}
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="No photo yet (show placeholder illustration)"
          options={options.map((p) => ({ value: p, label: p }))}
          error={error}
          hint={
            <>
              Upload photos in the{" "}
              <Link
                href="/admin/media"
                className="text-turquoise-deep underline"
                target="_blank"
              >
                media library
              </Link>
              , then choose them here.
            </>
          }
        />
        <TextField
          name={altName}
          label="Image description (alt text)"
          defaultValue={defaultAlt ?? ""}
          maxLength={200}
          hint="Describe what the photo shows, e.g. “Dhow sailing at sunset off Stone Town”."
        />
      </div>
    </div>
  );
}
