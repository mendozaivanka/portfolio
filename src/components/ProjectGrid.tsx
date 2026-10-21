import { useRef, useState, type KeyboardEvent } from "react";
import { categories, type Category, type Project } from "../data/projects";
import ProjectCard from "./ProjectCard";

type Filter = Category | "all";

/** shadcn Tabs filtering the project cards. */
export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const matches = (p: Project, f: Filter) => f === "all" || p.categories.includes(f);
  const shown = projects.filter((p) => matches(p, filter));

  // Arrow keys move between tabs (WAI-ARIA tabs pattern)
  function onTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = categories.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : (i - 1 + n) % n;
    setFilter(categories[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <>
      <div className="tabs-list" role="tablist" aria-label="Filter projects">
        {categories.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            className="tab"
            role="tab"
            id={`tab-${c.id}`}
            aria-selected={filter === c.id}
            aria-controls="project-panel"
            tabIndex={filter === c.id ? 0 : -1}
            onClick={() => setFilter(c.id)}
            onKeyDown={(e) => onTabKeyDown(e, i)}
          >
            {c.label}
            <span className="count">{projects.filter((p) => matches(p, c.id)).length}</span>
          </button>
        ))}
      </div>

      <ul className="pgrid" role="tabpanel" id="project-panel" aria-labelledby={`tab-${filter}`}>
        {shown.map((p) => (
          <li key={p.title}>
            <ProjectCard project={p} />
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="muted">Nothing here yet.</p>}
    </>
  );
}
