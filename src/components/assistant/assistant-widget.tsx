"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, RotateCcw, Sparkles, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { contact } from "@/config/site";
import { cn } from "@/lib/utils";
import { ASSISTANT_LIMITS, type AssistantMessage } from "@/lib/validation/assistant";

const GENERAL_SUGGESTIONS = [
  "Which tours suit a family with young kids?",
  "What should I bring for snorkelling at Mnemba?",
  "Can I do a safari from Zanzibar in one day?",
  "How does booking work?",
];

/** Suggestions for the page the visitor is on (tour/package pages get their own). */
function suggestionsFor(pathname: string): string[] {
  if (/^\/tours\/[a-z0-9-]+$/.test(pathname)) {
    return [
      "What's included in this tour?",
      "What should I bring for this tour?",
      "Is this tour suitable for children?",
      "How do I book this tour?",
    ];
  }
  if (/^\/packages\/[a-z0-9-]+$/.test(pathname)) {
    return [
      "What does this package include?",
      "Can this package be adjusted?",
      "What isn't included in the price?",
      "How do I book this package?",
    ];
  }
  return GENERAL_SUGGESTIONS;
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

const ERRORS: Record<string, string> = {
  not_configured: `Our AI assistant isn't switched on yet. Please contact our team at ${contact.email} or ${contact.phoneDisplay}.`,
  rate_limited:
    "You've sent a lot of questions in a short time. Please wait a minute and try again.",
  invalid_request: "That conversation is too long. Start a new chat and ask again.",
};
const GENERIC_ERROR = `Sorry, the assistant isn't available right now. Please contact us at ${contact.email}.`;

// Site paths the assistant cites (e.g. /tours/prison-island-tour) become links.
const PATH_RE =
  /(\/(?:tours|packages|destinations|travel-guide)(?:\/[a-z0-9-]+)?|\/(?:book|contact|safari|about))(?![\w/-])/g;

function linkify(text: string, onNavigate: () => void): ReactNode[] {
  return text.split(PATH_RE).map((part, i) =>
    i % 2 === 1 ? (
      <Link
        key={i}
        href={part}
        onClick={onNavigate}
        className="font-medium text-turquoise-deep underline underline-offset-2 hover:text-ocean-deep"
      >
        {part}
      </Link>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
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
  const pathname = usePathname();
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
        body: JSON.stringify({ messages: history, page: pathname }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(ERRORS[data?.error ?? ""] ?? GENERIC_ERROR);
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
        setError(GENERIC_ERROR);
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
        setError(GENERIC_ERROR);
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
            className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-ocean-deep py-3 pr-5 pl-4 text-sm font-medium text-white shadow-lg ring-2 ring-white/70 transition hover:bg-ocean focus-visible:ring-4 focus-visible:ring-gold focus-visible:outline-none sm:right-6 sm:bottom-6"
          />
        }
      >
        <Sparkles className="size-4 text-gold-light" aria-hidden="true" />
        Ask AI
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-warm-white p-0 sm:max-w-md data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-5 pt-5 pb-4">
          <SheetTitle className="flex items-center gap-2 font-display text-xl text-ocean-deep">
            <Sparkles className="size-5 text-gold-deep" aria-hidden="true" />
            Ask our AI assistant
          </SheetTitle>
          <SheetDescription className="text-xs leading-relaxed">
            Answers use the information on this website and can contain mistakes. Our team
            confirms every price and booking. Please don&apos;t share payment details
            here.
          </SheetDescription>
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
              <p className="text-ocean-deep">
                Jambo! Ask me about our Zanzibar tours, safaris and packages — what to
                expect, what&apos;s included, prices and how booking works.
              </p>
              <ul className="flex flex-col gap-2" aria-label="Suggested questions">
                {suggestionsFor(pathname).map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => void ask(s)}
                      className="w-full rounded-2xl border border-turquoise/40 bg-white px-4 py-2.5 text-left text-ocean-deep transition hover:border-turquoise hover:bg-turquoise-soft"
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
                    ? "ml-auto rounded-br-md bg-ocean-deep text-white"
                    : "rounded-bl-md border border-border bg-white text-ink",
                )}
              >
                <span className="sr-only">
                  {m.role === "user" ? "You:" : "Assistant:"}
                </span>
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
              Thinking…
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
            <p className="mb-2 text-xs text-muted-foreground">
              This chat is getting long — start a new one to keep asking.
            </p>
          ) : null}
          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <label htmlFor="assistant-input" className="sr-only">
              Your question
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
              placeholder="Ask about tours, prices, what to bring…"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-warm-white px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted-foreground focus-visible:border-turquoise focus-visible:ring-2 focus-visible:ring-turquoise/30 disabled:opacity-60"
            />
            {pending ? (
              <Button
                type="button"
                size="icon"
                aria-label="Stop answer"
                onClick={stop}
                className="size-11 shrink-0 bg-ocean-deep text-white hover:bg-ocean"
              >
                <Square className="size-4 fill-current" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                aria-label="Send question"
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
              New chat
            </button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
