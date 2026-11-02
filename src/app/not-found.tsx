import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";

// Root-level so unmatched URLs also get the public shell.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <section className="bg-tide">
          <div className="container-page flex min-h-[60vh] flex-col justify-center py-20">
            <p className="mb-3 text-sm font-semibold text-turquoise-deep">404</p>
            <h1 className="text-4xl font-medium sm:text-5xl">
              This page drifted off course
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              The page you are looking for doesn&apos;t exist or has moved.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/" className={buttonVariants({ size: "lg" })}>
                Go to home
              </Link>
              <Link
                href="/tours"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                Browse tours
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
