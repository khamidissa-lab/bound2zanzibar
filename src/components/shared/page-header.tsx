import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "./breadcrumbs";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  children,
}: PageHeaderProps) {
  return (
    <section className="bg-tide border-b">
      <div className="container-page py-12 sm:py-16">
        {crumbs ? <Breadcrumbs items={crumbs} className="mb-6" /> : null}
        {eyebrow ? (
          <p className="mb-3 text-sm font-semibold text-turquoise-deep">{eyebrow}</p>
        ) : null}
        <h1 className="max-w-3xl text-4xl font-medium sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
