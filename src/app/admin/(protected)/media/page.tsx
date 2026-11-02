import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/admin-states";
import { EmptyList } from "@/components/admin/content-list";
import { requireStaffPage } from "@/lib/auth/session";
import { mediaUrl } from "@/lib/media";
import { listMedia } from "@/services/admin-content";

import { MediaItemActions } from "./media-item";
import { MediaUploader } from "./media-uploader";

export const metadata: Metadata = { title: "Media" };

const formatSize = (bytes: number | null) =>
  bytes === null
    ? ""
    : bytes > 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`;

export default async function MediaPage() {
  const { allowed } = await requireStaffPage("content.manage", "/admin/media");
  if (!allowed) return <AccessDenied />;
  const media = await listMedia();

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl">Media</h1>
        <p className="mt-1 text-muted-foreground">
          Photos for tours, destinations, packages and articles. Choose them in each
          editor after uploading.
        </p>
      </div>
      <MediaUploader />
      <section aria-labelledby="library-heading">
        <h2 id="library-heading" className="font-display text-xl">
          Library ({media.length})
        </h2>
        {media.length === 0 ? (
          <EmptyList>No images yet. Upload your first photos above.</EmptyList>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {media.map((item) => (
              <li key={item.path} className="overflow-hidden rounded-2xl border bg-card">
                <div className="aspect-[4/3] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of a stored file */}
                  <img
                    src={mediaUrl(item.path) ?? ""}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex items-start justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-medium text-ocean-deep"
                      title={item.path}
                    >
                      {item.path.split("/").pop()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.folder}{" "}
                      {formatSize(item.size) && `· ${formatSize(item.size)}`}
                    </p>
                  </div>
                  <MediaItemActions path={item.path} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
