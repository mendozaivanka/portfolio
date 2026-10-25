import type { ReactNode } from "react";
import { ArrowRightIcon, ArrowUpRightIcon, BriefcaseBusinessIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Project, Tint } from "@/data/projects";

export type HeadingLevel = "h2" | "h3";

// Tint strengths chosen so 12px rose/gold text on them stays ≥ 4.5:1 in both themes
const tintClass: Record<Tint, string> = {
  rosas: "bg-rosas-2/35",
  ube: "bg-ube/35",
  pandan: "bg-pandan/45",
  mangga: "bg-mangga/45",
};

/*
 * Every card shares one skeleton with fixed-size slots, so a grid of them lines up:
 *   preview   (fixed height: exactly four mono lines)
 *   meta      (one line)
 *   title     (reserved for two lines)
 *   summary   (clamped to three lines on the home page; full text on the projects page)
 *   results + tags  (pinned to the bottom)
 *   links     (projects page only, when any)
 */
const PREVIEW_LINES = 4;
// No reserved second line: one-line titles would leave a gap above the description
const titleClass = "font-heading text-xl leading-snug font-medium";

/** Turn the preview mini-markup (**rose**, ==gold==) into elements. Unbalanced markers render as plain text. */
function renderPreviewLine(line: string): ReactNode[] {
  return line.split(/(\*\*.+?\*\*|==.+?==)/g).map((part, i) => {
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**"))
      return (
        <b key={i} className="font-medium text-primary-strong">
          {part.slice(2, -2)}
        </b>
      );
    if (part.length > 4 && part.startsWith("==") && part.endsWith("=="))
      return (
        <span key={i} className="text-gold-ink">
          {part.slice(2, -2)}
        </span>
      );
    return part;
  });
}

/** Little terminal window with illustrative output. Decorative: the description carries the meaning. */
function Preview({ project }: { project: Project }) {
  // Always render exactly PREVIEW_LINES rows so every preview is the same height
  const lines = [...project.preview.slice(0, PREVIEW_LINES)];
  while (lines.length < PREVIEW_LINES) lines.push("");
  return (
    <div className={cn("mx-(--card-spacing) shrink-0 overflow-hidden rounded-md border border-border", tintClass[project.tint])} aria-hidden="true">
      <WindowBar />
      <div className="overflow-x-auto px-3.5 pt-3 pb-3.5 font-mono text-xs leading-[1.75] whitespace-pre text-foreground">
        {lines.map((line, i) => (
          <div key={i} className="h-[1.75em]">
            {renderPreviewLine(line)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Window chrome shared by the terminal preview and the media frame, so both are the same height. */
function WindowBar() {
  return (
    <div className="flex gap-1.5 border-b border-border/70 px-2.5 py-2">
      <i className="size-1.75 rounded-full bg-foreground/20" />
      <i className="size-1.75 rounded-full bg-foreground/20" />
      <i className="size-1.75 rounded-full bg-foreground/20" />
    </div>
  );
}

/** A screenshot of the project, framed like the terminal preview so the cards line up. */
function MediaPreview({ project }: { project: Project }) {
  const media = project.media!;
  return (
    <figure className={cn("mx-(--card-spacing) shrink-0 overflow-hidden rounded-md border border-border", tintClass[project.tint])}>
      <WindowBar />
      <img
        className="block h-[110px] w-full object-cover object-[60%_45%]"
        src={media.poster}
        alt={media.alt}
        width={media.width}
        height={media.height}
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
}

/** Employer + period for work projects, year for personal ones. One line, always present. */
function Meta({ project }: { project: Project }) {
  return (
    <div className="flex h-5 items-center gap-x-2 overflow-hidden font-mono text-xs whitespace-nowrap text-muted-foreground">
      {project.kind === "work" && project.org ? (
        <span className="inline-flex min-w-0 items-center gap-1">
          <BriefcaseBusinessIcon className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{project.org}</span>
        </span>
      ) : (
        <span>Side project</span>
      )}
      <span aria-hidden="true">·</span>
      <span className="shrink-0 tabular-nums">{project.period ?? project.year}</span>
    </div>
  );
}

/** Results (gold) and tags (outline) together at the bottom of the card. */
function Footer({ project }: { project: Project }) {
  return (
    <CardContent className="mt-auto grid gap-2">
      {project.results && project.results.length > 0 && (
        <ul className="flex list-none flex-wrap gap-1.5 p-0" aria-label="Results">
          {project.results.map((r) => (
            <li key={r}>
              <Badge className="bg-mangga text-foreground">{r}</Badge>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <Badge key={t} variant="outline" className="h-auto max-w-full whitespace-normal">
            {t}
          </Badge>
        ))}
      </div>
    </CardContent>
  );
}

type Props = {
  project: Project;
  /** "link": the whole card links to the projects page (home). "full": everything, with links if any (projects page). */
  variant?: "link" | "full";
  /** Keeps the heading outline correct: h3 under a section h2 (home), h2 under the page h1 (projects). */
  headingLevel?: HeadingLevel;
};

export default function ProjectCard({ project, variant = "full", headingLevel = "h3" }: Props) {
  const Heading = headingLevel;
  // Placeholder links ("#" or empty) are skipped rather than scrolling the page to the top
  const links = project.links.filter((l) => l.href && l.href !== "#");
  const caseStudyHref = project.caseStudy && `/projects/${project.caseStudy.slug}/`;
  const visual = project.media ? <MediaPreview project={project} /> : <Preview project={project} />;

  if (variant === "link") {
    // Where the whole card goes: the case study, else the project's own page, else the projects list
    const target = caseStudyHref
      ? { href: caseStudyHref, label: "read the case study" }
      : links[0]?.href.startsWith("/")
        ? { href: links[0].href, label: links[0].label }
        : { href: "/projects/", label: "see all projects" };
    return (
      <a
        href={target.href}
        className="group flex h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label={`${project.title}: ${target.label}`}
      >
        <Card className="h-full w-full transition-[transform,box-shadow] group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-rosas-3 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
          {visual}
          <CardHeader>
            <Meta project={project} />
            <Heading className={cn(titleClass, "flex items-start justify-between gap-3")}>
              <span className="min-w-0 break-words">{project.title}</span>
              <ArrowUpRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-strong" />
            </Heading>
            <CardDescription className="line-clamp-3">{project.summary ?? project.description}</CardDescription>
          </CardHeader>
          <Footer project={project} />
        </Card>
      </a>
    );
  }

  return (
    <Card className="h-full w-full">
      {visual}
      <CardHeader>
        <Meta project={project} />
        <Heading className={cn(titleClass, "min-w-0 break-words")}>{project.title}</Heading>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <Footer project={project} />
      {(caseStudyHref || links.length > 0) && (
        <CardFooter className="flex-wrap gap-2 border-t-0 bg-transparent px-(--card-spacing) pt-0 pb-(--card-spacing)">
          {caseStudyHref && (
            <Button asChild variant="secondary" size="sm">
              <a href={caseStudyHref}>
                Read the case study <ArrowRightIcon />
              </a>
            </Button>
          )}
          {links.map((l, i) => (
            <Button key={l.label} asChild variant={i === 0 && !caseStudyHref ? "secondary" : "ghost"} size="sm">
              <a href={l.href} {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>
                {l.label} <ArrowUpRightIcon />
              </a>
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}
