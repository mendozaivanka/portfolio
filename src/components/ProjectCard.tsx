import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "lucide-react";
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

/** Little terminal window with the project's sample output. Decorative: the description carries the meaning. */
function Preview({ project }: { project: Project }) {
  return (
    <div className={cn("mx-3 overflow-hidden rounded-md border border-border", tintClass[project.tint])} aria-hidden="true">
      <div className="flex gap-1.5 border-b border-border/70 px-2.5 py-2">
        <i className="size-1.75 rounded-full bg-foreground/20" />
        <i className="size-1.75 rounded-full bg-foreground/20" />
        <i className="size-1.75 rounded-full bg-foreground/20" />
      </div>
      <div className="overflow-x-auto px-3.5 pt-3 pb-3.5 font-mono text-xs leading-[1.75] whitespace-pre text-foreground">
        {project.preview.map((line, i) => (
          <div key={i}>{renderPreviewLine(line)}</div>
        ))}
      </div>
    </div>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <CardContent className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <Badge key={t} variant="outline" className="h-auto max-w-full whitespace-normal">
          {t}
        </Badge>
      ))}
    </CardContent>
  );
}

type Props = {
  project: Project;
  /** "link": the whole card links to the projects page (home). "full": action buttons in the footer (projects page). */
  variant?: "link" | "full";
  /** Keeps the heading outline correct: h3 under a section h2 (home), h2 under the page h1 (projects). */
  headingLevel?: HeadingLevel;
};

export default function ProjectCard({ project, variant = "full", headingLevel = "h3" }: Props) {
  const Heading = headingLevel;
  // Placeholder links ("#" or empty) are skipped rather than scrolling the page to the top
  const links = project.links.filter((l) => l.href && l.href !== "#");

  if (variant === "link") {
    return (
      <a
        href="/projects/"
        className="group block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label={`${project.title}: see all projects`}
      >
        <Card className="h-full transition-[transform,box-shadow] group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-rosas-3 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
          <Preview project={project} />
          <CardHeader>
            <Heading className={cn(titleClass, "flex items-start justify-between gap-3")}>
              <span className="min-w-0 break-words">{project.title}</span>
              <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-strong" />
            </Heading>
            <CardDescription>{project.summary ?? project.description}</CardDescription>
          </CardHeader>
          <Tags tags={project.tags} />
        </Card>
      </a>
    );
  }

  return (
    <Card className="h-full">
      <Preview project={project} />
      <CardHeader>
        <Heading className={cn(titleClass, "flex items-baseline justify-between gap-3")}>
          <span className="min-w-0 break-words">{project.title}</span>
          <span className="shrink-0 font-mono text-xs font-normal text-muted-foreground">{project.year}</span>
        </Heading>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <Tags tags={project.tags} />
      {links.length > 0 && (
        <CardFooter className="mt-auto gap-2 border-t-0 pt-0">
          {links.map((l, i) => (
            <Button key={l.label} asChild variant={i === 0 ? "secondary" : "ghost"} size="sm">
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
