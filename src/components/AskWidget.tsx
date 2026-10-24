import { useEffect, useRef, useState } from "react";
import { ArrowUpIcon, SparklesIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { search, type Knowledge } from "@/lib/assistant";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string; sources?: { title: string; href: string }[]; offline?: boolean };

type Props = {
  name: string;
  email: string;
  /** The chat worker's URL (PUBLIC_CHAT_API_URL). Empty: answer offline from the CV, in the browser. */
  apiUrl?: string;
};

/** First sentences of a paragraph, up to about `max` characters. */
function excerpt(text: string, max = 420) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const end = cut.lastIndexOf(". ");
  return end > 120 ? cut.slice(0, end + 1) : `${cut.trimEnd()}…`;
}

/**
 * "Ask about me": a small chat panel trained on nothing but the CV and projects on this site.
 * With a chat worker configured it's a real LLM conversation; without one (or once the worker's free daily quota is
 * used up) it falls back to searching the same facts in the browser, and says so.
 */
export default function AskWidget({ name, email, apiUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [online, setOnline] = useState(Boolean(apiUrl));
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load the knowledge only when someone opens the panel, so pages stay light
  useEffect(() => {
    if (!open || knowledge) return;
    fetch("/assistant-knowledge.json").then((r) => r.json()).then(setKnowledge).catch(() => {});
  }, [open, knowledge]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  function answerOffline(q: string, k: Knowledge | null): Msg {
    const hits = k ? search(k.chunks, q, { ignore: name }) : [];
    if (!hits.length)
      return {
        role: "assistant",
        offline: true,
        content: `I couldn't find that in ${name}'s CV or projects. Try asking about ${name}'s work, projects, skills or education, or email ${email}.`,
      };
    const [top, second] = hits;
    return {
      role: "assistant",
      offline: true,
      content: excerpt(top.chunk.text),
      sources: [top, second]
        .filter((h) => h && h.chunk.href && (h === top || h.score > top.score * 0.6))
        .map((h) => ({ title: h!.chunk.title, href: h!.chunk.href! })),
    };
  }

  async function ask(q: string) {
    const question = q.trim().slice(0, 600);
    if (!question || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: question }];
    setMessages(history);
    setInput("");
    setBusy(true);
    let k = knowledge;
    if (!k) k = await fetch("/assistant-knowledge.json").then((r) => r.json()).catch(() => null);
    if (k && !knowledge) setKnowledge(k);

    let reply: Msg | null = null;
    if (apiUrl && online) {
      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history.slice(-8).map(({ role, content }) => ({ role, content })) }),
          signal: AbortSignal.timeout(20_000),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { reply?: string };
        if (!data.reply) throw new Error("empty");
        reply = { role: "assistant", content: data.reply };
      } catch {
        setOnline(false); // quota used up or worker down: stay offline for the rest of the visit
      }
    }
    setMessages([...history, reply ?? answerOffline(question, k)]);
    setBusy(false);
  }

  const onSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <div className="print:hidden">
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 rounded-full shadow-lg"
          aria-haspopup="dialog"
        >
          <SparklesIcon /> Ask about {name}
        </Button>
      )}
      {open && (
        <section
          role="dialog"
          aria-label={`Ask about ${name}`}
          className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex h-[min(560px,calc(100dvh-6rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xl"
        >
          <header className="flex items-center gap-2 border-b border-border px-4 py-3">
            <SparklesIcon className="size-4 text-primary-strong" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-lg leading-tight font-medium">Ask about {name}</h2>
              <p className="text-xs text-muted-foreground">
                {online ? "AI assistant · answers only from this site" : "Offline mode · quotes from my CV and projects"}
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Close">
              <XIcon />
            </Button>
          </header>

          <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.length === 0 && (
              <div className="grid gap-3">
                <p className="text-sm text-muted-foreground">
                  Hi! I can answer questions about {name}'s work, projects, skills and how to get in touch.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(knowledge?.suggestions ?? []).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => ask(s)}
                      className="rounded-full border border-border px-3 py-1 text-left text-[13px] transition-colors hover:bg-muted"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[88%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user" ? "self-end bg-primary text-primary-foreground" : "self-start bg-muted text-foreground",
                )}
              >
                <span className="sr-only">{m.role === "user" ? "You said:" : "Assistant:"}</span>
                {m.content}
                {m.sources && m.sources.length > 0 && (
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {m.sources.map((s) => (
                      <a key={s.href + s.title} href={s.href} className="rounded-sm bg-background px-1.5 py-0.5 text-xs text-primary-strong underline-offset-2 hover:underline">
                        {s.title} →
                      </a>
                    ))}
                  </span>
                )}
              </div>
            ))}
            {busy && (
              <Badge variant="outline" className="self-start">
                thinking…
              </Badge>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-border p-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              aria-label="Your question"
              maxLength={600}
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send">
              <ArrowUpIcon />
            </Button>
          </form>
        </section>
      )}
    </div>
  );
}
