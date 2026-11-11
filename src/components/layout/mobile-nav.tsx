"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Phone } from "lucide-react";

import { WhatsAppIcon } from "@/components/icons/brand-icons";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { bookNowHref, contact, whatsappLink, type NavItem } from "@/config/site";
import { useI18n } from "@/i18n/client";

import { NavLinks } from "./nav-links";

/**
 * Slide-in navigation for small screens. The dialog primitive provides focus
 * trapping, Escape-to-close and returns focus to the trigger on close.
 */
export function MobileNav({ items }: { items: readonly NavItem[] }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label={t.nav.openMenu} />}
      >
        <Menu className="size-6" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side={locale === "ar" ? "left" : "right"}
        className="w-full max-w-md border-none bg-ocean-deep text-ivory [&_[data-slot=sheet-close]]:text-ivory [&_[data-slot=sheet-close]]:hover:bg-white/10"
      >
        <SheetHeader className="px-6 pt-7">
          <SheetTitle className="eyebrow text-gold-light">{t.nav.menu}</SheetTitle>
          <SheetDescription className="font-display text-xl text-white/70 italic">
            {t.meta.tagline}
          </SheetDescription>
        </SheetHeader>
        <nav aria-label={t.nav.mobile} className="flex-1 overflow-y-auto px-6">
          <MobileNavLinks items={items} onNavigate={close} />
          <LanguageSwitcher variant="list" className="mt-8 mb-4" />
        </nav>
        <SheetFooter className="gap-3 px-6 pb-8">
          <Link
            href={bookNowHref}
            onClick={close}
            className={buttonVariants({
              variant: "light",
              size: "lg",
              className: "w-full",
            })}
          >
            {t.nav.bookNow}
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${contact.phone}`}
              className={buttonVariants({
                variant: "outline-light",
                className: "w-full",
              })}
            >
              <Phone aria-hidden="true" data-icon="inline-start" />
              {t.nav.call}
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline-light",
                className: "w-full",
              })}
            >
              <WhatsAppIcon aria-hidden="true" data-icon="inline-start" />
              {t.nav.whatsapp}
              <span className="sr-only">{t.nav.opensWhatsApp}</span>
            </a>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/** Rendered only inside the open dialog, so the hook never runs at prerender. */
function MobileNavLinks({
  items,
  onNavigate,
}: {
  items: readonly NavItem[];
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  return (
    <NavLinks
      items={items}
      pathname={pathname}
      variant="mobile"
      onNavigate={onNavigate}
    />
  );
}
