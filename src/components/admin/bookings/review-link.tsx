"use client";

import { useState } from "react";
import { Check, Copy, Mail, MessageCircle } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { whatsappLink } from "@/config/site";

/**
 * The private review link for a completed booking, with ways to send it.
 * Only the customer who receives it can leave a review for this booking.
 */
export function ReviewLink({
  url,
  customerName,
  email,
  phone,
  reference,
}: {
  url: string;
  customerName: string;
  email: string;
  phone: string;
  reference: string;
}) {
  const [copied, setCopied] = useState(false);
  const firstName = customerName.split(" ")[0];
  const message = `Hello ${firstName}, thank you for travelling with Bound to Zanzibar. We'd love to hear about your trip — you can leave a short review here: ${url}`;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Send this private link to the customer. Their review waits in Reviews until you
        publish it.
      </p>
      <p className="rounded-lg bg-muted/50 px-3 py-2 font-mono text-xs break-all text-ocean-deep">
        {url}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? (
            <Check aria-hidden="true" data-icon="inline-start" />
          ) : (
            <Copy aria-hidden="true" data-icon="inline-start" />
          )}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <a
          href={`mailto:${email}?subject=${encodeURIComponent(`How was your trip? (${reference})`)}&body=${encodeURIComponent(message)}`}
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          <Mail aria-hidden="true" data-icon="inline-start" />
          Email
        </a>
        <a
          href={whatsappLink(message, phone)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          <MessageCircle aria-hidden="true" data-icon="inline-start" />
          WhatsApp
        </a>
      </div>
      <p aria-live="polite" className="sr-only">
        {copied ? "Link copied" : ""}
      </p>
    </div>
  );
}
