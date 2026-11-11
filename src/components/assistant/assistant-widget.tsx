"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, Mail, RotateCcw, Sparkles, Square } from "lucide-react";

import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons/brand-icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { contact, socialLinks, whatsappLink } from "@/config/site";
import { useI18n } from "@/i18n/client";
import { splitLocale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages/en";
import { cn } from "@/lib/utils";
import { ASSISTANT_LIMITS, type AssistantMessage } from "@/lib/validation/assistant";

/** Suggestions for the page the visitor is on (tour/package pages get their own). */
function suggestionsFor(path: string, t: Messages): string[] {
  if (/^\/tours\/[a-z0-9-]+$/.test(path)) return t.assistant.tourSuggestions;
  if (/^\/packages\/[a-z0-9-]+$/.test(path)) return t.assistant.packageSuggestions;
  return t.assistant.suggestions;
}

const STORAGE_KEY = "b2z-assistant-chat";

/** Restores this tab's chat after a reload; ignores anything malformed. */
function loadSaved(): AssistantMessage[] {
  try {
    const data: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    if (
      Array.isArray(data) &&
      data.length % 2 === 0 &&
      data.length <= ASSISTANT_LIMITS.maxMessages &&
      data.every(
        (m, i) =>
          typeof m?.content === "string" &&
          m.content.length > 0 &&
          m.role === (i % 2 === 0 ? "user" : "assistant"),
      )
    ) {
      return data as AssistantMessage[];
    }
  } catch {
    // Storage unavailable (private mode, blocked) — start fresh.
  }
  return [];
}

function save(messages: AssistantMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Not critical: the chat just won't survive a reload.
  }
}

function errorText(
  t: Messages,
  fmt: (s: string, v: Record<string, string>) => string,
  code?: string,
): string {
  const values = { email: contact.email, phone: contact.phoneDisplay };
  if (code === "not_configured") return fmt(t.assistant.notConfigured, values);
  if (code === "rate_limited") return t.assistant.rateLimited;
  if (code === "invalid_request") return t.assistant.tooLong;
  return fmt(t.assistant.failed, values);
}

// Site paths the assistant cites (e.g. /tours/prison-island-tour), email
// addresses and Tanzanian phone numbers become links.
const PATH_PART = String.raw`\/(?:tours|packages|destinations|travel-guide)(?:\/[a-z0-9-]+)?(?![\w/-])|\/(?:book|contact|safari|about)(?![\w/-])`;
const EMAIL_PART = String.raw`[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}`;
const PHONE_PART = String.raw`\+255(?:[ -]?\d){9}`;
const LINK_RE = new RegExp(`(${PATH_PART}|${EMAIL_PART}|${PHONE_PART})`, "g");
const linkClass =
  "font-medium text-turquoise-deep underline underline-offset-2 hover:text-ocean-deep";

function linkify(text: string, onNavigate: () => void): ReactNode[] {
  return text.split(LINK_RE).map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    if (part.startsWith("/")) {
      return (
        <Link key={i} href={part} onClick={onNavigate} className={linkClass}>
          {part}
        </Link>
      );
    }
    const href = part.includes("@")
      ? `mailto:${part}`
      : `tel:+${part.replace(/\D/g, "")}`;
    return (
      <a key={i} href={href} dir="ltr" className={`${linkClass} break-all`}>
        {part}
      </a>
    );
  });
}

const instagram = socialLinks.find((s) => s.label === "Instagram" && s.href);

/** Direct routes to the team, shown under the panel title. */
function ContactRow({ t }: { t: Messages }) {
  const items = [
    {
      key: "whatsapp",
      label: t.nav.whatsapp,
      href: whatsappLink(),
      icon: WhatsAppIcon,
      external: t.nav.opensWhatsApp,
    },
    {
      key: "email",
      label: t.footer.email,
      href: `mailto:${contact.email}`,
      icon: Mail,
      external: null,
    },
    ...(instagram?.href
      ? [
          {
            key: "instagram",
            label: "Instagram",
            href: instagram.href,
            icon: InstagramIcon,
            external: t.nav.instagramNewTab,
          },
        ]
      : []),
  ];
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-xs text-muted-foreground">{t.assistant.talkToTeam}</span>
      <ul className="flex flex-wrap gap-2">
        {items.map(({ key, label, href, icon: Icon, external }) => (
          <li key={key}>
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center gap-1.5 rounded-full border border-turquoise/40 bg-white px-3 py-1.5 text-xs font-medium text-ocean-deep transition hover:border-turquoise-deep hover:bg-turquoise-deep hover:text-white"
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {label}
              {external ? <span className="sr-only"> {external}</span> : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MessageText({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const clean = text.replace(/\*\*(.+?)\*\*/g, "$1");
  return (
    <div className="space-y-2 whitespace-pre-wrap">
      {clean.split(/\n{2,}/).map((para, i) => (
        <p key={i}>{linkify(para, onNavigate)}</p>
      ))}
    </div>
  );
}

export function AssistantWidget() {
  const { t, fmt, locale } = useI18n();
  const a = t.assistant;
  const pathname = splitLocale(usePathname() ?? "/").path;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, pending]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Restore after mount so server and client render the same empty panel first.
  useEffect(() => {
    const saved = loadSaved();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off restore from browser storage
    if (saved.length > 0) setMessages(saved);
  }, []);

  useEffect(() => {
    if (!pending) save(messages);
  }, [messages, pending]);

  async function ask(question: string) {
    const text = question.trim().slice(0, ASSISTANT_LIMITS.maxMessageChars);
    if (!text || pending) return;
    const history: AssistantMessage[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setInput("");
    setError(null);
    setPending(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let answer = "";
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, page: pathname, locale }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(errorText(t, fmt, data?.error));
        setMessages(messages);
        setInput(text);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      setMessages([...history, { role: "assistant", content: "" }]);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: answer }]);
      }
      if (!answer.trim()) {
        setMessages(messages);
        setError(errorText(t, fmt));
      }
    } catch {
      if (controller.signal.aborted) {
        // "New chat" already cleared everything.
        if ((controller.signal.reason as { reset?: boolean } | undefined)?.reset) return;
        // Stopped by the visitor: keep a partial answer, otherwise undo the turn.
        if (answer.trim()) {
          setMessages([...history, { role: "assistant", content: answer }]);
        } else {
          setMessages(messages);
          setInput(text);
        }
      } else {
        setError(errorText(t, fmt));
        setMessages(messages);
        setInput(text);
      }
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  function stop() {
    abortRef.current?.abort();
  }

  function reset() {
    abortRef.current?.abort({ reset: true });
    setMessages([]);
    setInput("");
    setError(null);
    setPending(false);
  }

  const atLimit = messages.length >= ASSISTANT_LIMITS.maxMessages - 1;
  const waitingForFirstToken = pending && messages.at(-1)?.role === "user";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="fixed end-4 bottom-4 z-40 flex items-center gap-2 border border-gold/60 bg-ocean-deep py-3 pr-5 pl-4 text-[0.72rem] font-semibold tracking-[0.14em] text-ivory uppercase shadow-card transition hover:bg-ocean focus-visible:ring-4 focus-visible:ring-gold focus-visible:outline-none sm:end-6 sm:bottom-6"
          />
        }
      >
        <Sparkles className="size-4 text-gold-light" aria-hidden="true" />
        {a.open}
      </SheetTrigger>
      <SheetContent
        side={locale === "ar" ? "left" : "right"}
        className="w-full gap-0 bg-warm-white p-0 sm:max-w-md data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-5 pt-5 pb-4">
          <SheetTitle className="flex items-center gap-2 font-display text-xl text-ocean-deep">
            <Sparkles className="size-5 text-gold-deep" aria-hidden="true" />
            {a.title}
          </SheetTitle>
          <SheetDescription className="text-xs leading-relaxed">
            {a.description}
          </SheetDescription>
          <ContactRow t={t} />
        </SheetHeader>

        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-busy={pending}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-5 text-sm leading-relaxed"
        >
          {messages.length === 0 ? (
            <div className="space-y-3">
              <p className="text-ocean-deep">{a.welcome}</p>
              <ul className="flex flex-col gap-2" aria-label={a.suggested}>
                {suggestionsFor(pathname, t).map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => void ask(s)}
                      className="w-full rounded-2xl border border-turquoise/40 bg-white px-4 py-2.5 text-start text-ocean-deep transition hover:border-turquoise hover:bg-turquoise-soft"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[90%] rounded-2xl px-4 py-3",
                  m.role === "user"
                    ? "ms-auto rounded-ee-md bg-ocean-deep text-white"
                    : "rounded-es-md border border-border bg-white text-ink",
                )}
              >
                <span className="sr-only">{m.role === "user" ? a.you : a.assistant}</span>
                {m.role === "user" ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <MessageText text={m.content} onNavigate={() => setOpen(false)} />
                )}
              </div>
            ))
          )}
          {waitingForFirstToken ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <span className="flex gap-1" aria-hidden="true">
                <span className="size-1.5 animate-bounce rounded-full bg-turquoise [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-turquoise [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-turquoise" />
              </span>
              {a.thinking}
            </p>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="rounded-2xl bg-sand-soft px-4 py-3 text-ocean-deep"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="border-t border-border bg-white px-4 pt-3 pb-4">
          {atLimit ? (
            <p className="mb-2 text-xs text-muted-foreground">{a.atLimit}</p>
          ) : null}
          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <label htmlFor="assistant-input" className="sr-only">
              {a.yourQuestion}
            </label>
            <textarea
              id="assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void ask(input);
                }
              }}
              rows={1}
              maxLength={ASSISTANT_LIMITS.maxMessageChars}
              disabled={atLimit}
              placeholder={a.placeholder}
              className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-warm-white px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted-foreground focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25 disabled:opacity-60"
            />
            {pending ? (
              <Button
                type="button"
                size="icon"
                aria-label={a.stop}
                onClick={stop}
                className="size-11 shrink-0 bg-ocean-deep text-white hover:bg-ocean"
              >
                <Square className="size-4 fill-current" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                aria-label={a.send}
                disabled={!input.trim() || atLimit}
                className="size-11 shrink-0 bg-turquoise-deep text-white hover:bg-ocean-deep"
              >
                <ArrowUp className="size-5" aria-hidden="true" />
              </Button>
            )}
          </form>
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={reset}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-ocean-deep"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              {a.newChat}
            </button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
