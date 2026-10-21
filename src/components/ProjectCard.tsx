import type { ReactNode } from "react";
import type { Project } from "../data/projects";

/** Turn the preview mini-markup (**rose**, ==gold==) into elements. */
function renderPreviewLine(line: string): ReactNode[] {
  return line.split(/(\*\*.+?\*\*|==.+?==)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <b key={i}>{part.slice(2, -2)}</b>;
    if (part.startsWith("==") && part.endsWith("==")) return <span key={i} className="ok">{part.slice(2, -2)}</span>;
    return part;
  });
}

function Preview({ project }: { project: Project }) {
  return (
    <div className={`shot tint-${project.tint}`} aria-hidden="true">
      <div className="shot-bar">
        <i />
        <i />
        <i />
      </div>
      <div className="shot-body">
        {project.preview.map((line, i) => (
          <div key={i}>{renderPreviewLine(line)}</div>
        ))}
      </div>
    </div>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="card-content badges">
      {tags.map((t) => (
        <span key={t} className="badge badge-outline">
          {t}
        </span>
      ))}
    </div>
  );
}

type Props = {
  project: Project;
  /** "link": the whole card links to the projects page (home). "full": links in the footer (projects page). */
  variant?: "link" | "full";
};

export default function ProjectCard({ project, variant = "full" }: Props) {
  if (variant === "link") {
    return (
      <a href="/projects/" className="card">
        <Preview project={project} />
        <div className="card-header">
          <div className="pcard-head">
            <h3 className="card-title">{project.title}</h3>
            <span className="arrow" aria-hidden="true">↗</span>
          </div>
          <p className="card-description">{project.summary ?? project.description}</p>
        </div>
        <Tags tags={project.tags} />
      </a>
    );
  }

  return (
    <article className="card">
      <Preview project={project} />
      <div className="card-header">
        <div className="pcard-head">
          <h3 className="card-title">{project.title}</h3>
          <span className="year">{project.year}</span>
        </div>
        <p className="card-description">{project.description}</p>
      </div>
      <Tags tags={project.tags} />
      {project.links.length > 0 && (
        <div className="card-footer">
          {project.links.map((l, i) => (
            <a key={l.label} href={l.href} className={`btn btn-sm ${i === 0 ? "btn-secondary" : "btn-ghost"}`}>
              {l.label} ↗
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
