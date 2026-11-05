import type { ReactNode } from "react";

import { SceneImage } from "@/components/media/scene-image";
import { cn } from "@/lib/utils";
import type { MediaImage } from "@/types/content";

import { Breadcrumbs, type Crumb } from "./breadcrumbs";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  /** Optional photograph set beside the title (asymmetric layout). */
  image?: MediaImage;
  /** Background: ivory (default), sand or deep ocean. */
  tone?: "ivory" | "sand" | "ocean";
  children?: ReactNode;
};

const tones = {
  ivory: "bg-ivory",
  sand: "bg-sand-soft",
  ocean: "bg-ocean-deep text-ivory",
} as const;

/** Editorial page opener used by every listing and information page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  image,
  tone = "ivory",
  children,
}: PageHeaderProps) {
  const dark = tone === "ocean";
  return (
    <section className={cn("relative overflow-hidden border-b", tones[tone])}>
      <div
        className={cn(
          "container-page grid gap-10 pt-8 pb-12 sm:pb-16",
          image && "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-16",
        )}
      >
        <div>
          {crumbs ? (
            <Breadcrumbs
              items={crumbs}
              tone={dark ? "dark" : "light"}
              className="mb-10"
            />
          ) : null}
          {eyebrow ? (
            <p
              className={cn(
                "eyebrow mb-5 flex items-center gap-3",
                dark ? "text-gold-light" : "text-gold-deep",
              )}
            >
              <span aria-hidden="true" className="h-px w-10 bg-current" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className={cn("display-xl max-w-4xl", dark && "text-ivory")}>{title}</h1>
          {description ? (
            <p
              className={cn(
                "mt-6 max-w-2xl text-lg leading-relaxed",
                dark ? "text-white/80" : "text-muted-foreground",
              )}
            >
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
        {image ? (
          <SceneImage
            image={image}
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="aspect-[16/10] lg:aspect-[4/5] lg:max-h-[30rem]"
          />
        ) : null}
      </div>
    </section>
  );
}
