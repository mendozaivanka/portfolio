import { useMemo } from "react";
import { BracesIcon, CopyIcon, DownloadIcon, PrinterIcon, RouteIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cvAsPrompt, formatDate, formatDuration, type CV } from "@/data/cv";
import { copyText } from "@/lib/toast";
import StarMark from "./StarMark";

/* ───────── Timeline: the human view ───────── */

function Timeline({ data }: { data: CV }) {
  return (
    <ol className="relative list-none p-0 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:w-px before:bg-border">
      {data.experience.map((r, i) => {
        const current = r.end === null;
        return (
          <li key={`${r.company}-${r.start}`} className="relative grid gap-3 pb-9 pl-10 last:pb-0">
            {/* Port of call: the morning star marks where you are now, a quiet dot where you've been */}
            <span className="absolute top-1 left-0 grid size-6 place-items-center rounded-full bg-background" aria-hidden="true">
              {current ? <StarMark size={24} /> : <i className="size-2.5 rounded-full border-2 border-rosas-4 bg-background" />}
            </span>
            <div className="grid gap-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
                <span className="tabular-nums">
                  {formatDate(r.start)} → {formatDate(r.end)}
                </span>
                {current ? (
                  <Badge className="bg-pandan text-foreground">
                    <span className="status-dot" aria-hidden="true" />
                    now
                  </Badge>
                ) : (
                  <span>{formatDuration(r.start, r.end!)}</span>
                )}
                <span className="hidden sm:inline">· {r.location}</span>
              </div>
              <h3 className="font-heading text-xl leading-snug font-medium">{r.title}</h3>
              <p className="text-muted-foreground">{r.company}</p>
            </div>
            <ul className="grid list-disc gap-1.5 pl-5 text-[15px] leading-relaxed marker:text-rosas-4">
              {r.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            {r.stack && (
              <div className="flex flex-wrap gap-1.5">
                {r.stack.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
            {i === data.experience.length - 1 && <span className="sr-only">Start of career</span>}
          </li>
        );
      })}
    </ol>
  );
}

/* ───────── Code views: the machine views ───────── */

function CodeBlock({ text, label }: { text: string; label: string }) {
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="absolute top-3 right-3 print:hidden"
        onClick={() => copyText(text, `Copied the ${label}`)}
        aria-label={`Copy ${label}`}
      >
        <CopyIcon /> Copy
      </Button>
      <pre className="max-h-[70vh] overflow-auto rounded-xl border border-border bg-muted p-4 pr-24 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap text-foreground">
        {text}
      </pre>
    </div>
  );
}

/* ───────── The page island ───────── */

export default function CvView({ cv }: { cv: CV }) {
  const json = useMemo(() => JSON.stringify(cv, null, 2), [cv]);
  const prompt = useMemo(() => cvAsPrompt(cv), [cv]);

  return (
    <Tabs defaultValue="timeline" className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <TabsList aria-label="CV format" className="no-js:hidden">
          <TabsTrigger value="timeline">
            <RouteIcon /> Timeline
          </TabsTrigger>
          <TabsTrigger value="json">
            <BracesIcon /> JSON
          </TabsTrigger>
          <TabsTrigger value="prompt">
            <SparklesIcon /> Prompt
          </TabsTrigger>
        </TabsList>
        <div className="flex flex-wrap gap-2">
          {cv.profile.pdf && (
            <Button asChild variant="secondary" size="sm">
              <a href={cv.profile.pdf} download>
                <DownloadIcon /> PDF
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" className="no-js:hidden" onClick={() => window.print()}>
            <PrinterIcon /> Print
          </Button>
        </div>
      </div>

      <TabsContent value="timeline">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
          <section aria-labelledby="cv-experience">
            <h2 id="cv-experience" className="label-mono mb-5">
              Experience
            </h2>
            <Timeline data={cv} />
          </section>

          <aside className="grid content-start gap-6">
            <section aria-labelledby="cv-education">
              <h2 id="cv-education" className="label-mono mb-3">
                Education
              </h2>
              {cv.education.map((e) => (
                <Card key={e.school} className="gap-1 py-4">
                  <CardHeader>
                    <h3 className="font-heading text-lg leading-snug font-medium">{e.school}</h3>
                    <p className="text-sm">{e.degree}</p>
                  </CardHeader>
                  <CardContent className="grid gap-1 text-sm text-muted-foreground">
                    <span className="text-gold-ink">{e.honours}</span>
                    <span className="font-mono text-xs">
                      {e.start}–{e.end} · {e.location}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section aria-labelledby="cv-skills" className="grid gap-3">
              <h2 id="cv-skills" className="label-mono">
                Skills
              </h2>
              {cv.skills.map((s) => (
                <div key={s.group} className="grid gap-1.5">
                  <span className="text-xs text-muted-foreground">{s.group}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {s.items.map((i) => (
                      <Badge key={i} variant="secondary">
                        {i}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <section aria-labelledby="cv-certs">
              <h2 id="cv-certs" className="label-mono mb-3">
                Certifications
              </h2>
              <ul className="grid list-none gap-2 p-0 text-sm">
                {cv.certifications.map((c) => (
                  <li key={c.name} className="grid border-t border-border pt-2 first:border-t-0 first:pt-0">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.issuer}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="cv-langs">
              <h2 id="cv-langs" className="label-mono mb-3">
                Languages
              </h2>
              <ul className="grid list-none gap-1.5 p-0 text-sm">
                {cv.languages.map((l) => (
                  <li key={l.name} className="flex justify-between gap-3">
                    <span>{l.name}</span>
                    <span className="text-muted-foreground">{l.level}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </TabsContent>

      <TabsContent value="json">
        <p className="mb-3 text-sm text-muted-foreground">
          The same CV as structured data, straight from <code className="font-mono text-xs">src/data/cv.ts</code>.
        </p>
        <CodeBlock text={json} label="JSON" />
      </TabsContent>

      <TabsContent value="prompt">
        <p className="mb-3 text-sm text-muted-foreground">
          My CV written as a system prompt. Paste it into any assistant and ask it about me; it's instructed to say so when it doesn't know.
        </p>
        <CodeBlock text={prompt} label="prompt" />
      </TabsContent>
    </Tabs>
  );
}
