import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories, type Category, type Project } from "@/data/projects";
import ProjectCard, { type HeadingLevel } from "./ProjectCard";

type Filter = Category | "all";

const matches = (p: Project, f: Filter) => f === "all" || p.categories.includes(f);

type Props = { projects: Project[]; headingLevel?: HeadingLevel };

/** shadcn Tabs filtering the project cards. Radix handles roving focus and arrow keys.
 *  Without JavaScript the tabs are hidden and every project is listed. */
export default function ProjectGrid({ projects, headingLevel = "h2" }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = projects.filter((p) => matches(p, filter));

  return (
    <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
      <TabsList
        aria-label="Filter projects"
        className="mb-5 h-auto max-w-full flex-wrap justify-start gap-0.5 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:[mask-image:linear-gradient(90deg,#000_calc(100%-28px),transparent)] max-sm:[scrollbar-width:none] no-js:hidden"
      >
        {categories.map((c) => (
          <TabsTrigger key={c.id} value={c.id} className="shrink-0 px-3 py-1.5">
            {c.label}
            <span className="ml-1 font-mono text-[11px] text-muted-foreground">
              {projects.filter((p) => matches(p, c.id)).length}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={filter}>
        {shown.length > 0 ? (
          <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
            {shown.map((p) => (
              <li key={p.title} className="flex">
                <ProjectCard project={p} headingLevel={headingLevel} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Nothing here yet.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}
