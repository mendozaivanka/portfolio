export type Category = "agents" | "automation" | "rag" | "prompting" | "evals";
export type Tint = "rosas" | "ube" | "pandan" | "mangga";

export type Project = {
  title: string;
  year: number;
  categories: Category[];
  /** Full description, shown on the projects page. */
  description: string;
  /** Shorter version for the home page. Falls back to `description`. */
  summary?: string;
  tags: string[];
  tint: Tint;
  /**
   * Lines for the little terminal preview. Leading spaces are kept.
   * Mini-markup: **text** = highlighted in rose, ==text== = highlighted in gold.
   */
  preview: string[];
  links: { label: string; href: string }[];
  featured?: boolean;
};

export const categories: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "agents", label: "Agents" },
  { id: "automation", label: "Automation" },
  { id: "rag", label: "RAG" },
  { id: "prompting", label: "Prompting" },
  { id: "evals", label: "Evals" },
];

// Sample projects: replace with your real work.
export const projects: Project[] = [
  {
    title: "Inbox Triage Agent",
    year: 2026,
    categories: ["agents", "automation"],
    description:
      "An LLM agent that sorts, tags and drafts replies for a support inbox, with a human approving each reply before it's sent. Cut first-response time by 60%.",
    summary:
      "Sorts, tags and drafts replies for a support inbox, with a human approving each one. Cut first-response time by 60%.",
    tags: ["LLM agents", "n8n", "Gmail API"],
    tint: "rosas",
    preview: [
      "**›** new email from jo@acme.co",
      "  label: ==billing== · priority: high",
      "  draft ready → waiting for approval",
      "**›** 41 emails triaged today",
    ],
    links: [
      { label: "Case study", href: "#" },
      { label: "Code", href: "#" },
    ],
    featured: true,
  },
  {
    title: "Prompt Garden",
    year: 2026,
    categories: ["prompting", "evals"],
    description:
      "A versioned prompt library with side-by-side evals, so teams can see whether a prompt change actually made things better.",
    summary: "A versioned prompt library with side-by-side evals, so teams can see whether a change actually helped.",
    tags: ["Prompt eng.", "Evals", "TypeScript"],
    tint: "ube",
    preview: [
      "**summarise.prompt**  v3 → v4",
      "  accuracy    82% → ==91%==",
      "  avg tokens  412 → ==288==",
      "  regressions ==0==",
    ],
    links: [
      { label: "Live", href: "#" },
      { label: "Code", href: "#" },
    ],
    featured: true,
  },
  {
    title: "Docs Whisperer",
    year: 2025,
    categories: ["rag", "agents"],
    description: 'A RAG assistant over internal docs that answers with citations and says "I don\'t know" when it doesn\'t.',
    tags: ["RAG", "Vector DB", "Python"],
    tint: "pandan",
    preview: [
      "**Q:** how many vacation days do I get?",
      "**A:** 25 days a year, plus public holidays.",
      "  ==[1]== handbook/time-off.md §2",
    ],
    links: [{ label: "Case study", href: "#" }],
    featured: true,
  },
  {
    title: "Lead → CRM Pipeline",
    year: 2025,
    categories: ["automation"],
    description: "Form submissions get enriched, scored by an LLM and sent to the right salesperson within seconds.",
    tags: ["Make", "Webhooks", "HubSpot"],
    tint: "mangga",
    preview: [
      "webhook **→** enrich **→** score **→** route",
      "  lead: Dana P. · score ==87==",
      "  assigned to: Sam (EMEA)",
      "  done in 3.2s",
    ],
    links: [{ label: "Case study", href: "#" }],
    featured: true,
  },
  {
    title: "Meeting Notes Bot",
    year: 2025,
    categories: ["agents", "automation"],
    description:
      "Turns call transcripts into decisions and action items, then files the tickets and posts a short summary to Slack.",
    tags: ["Claude API", "Zapier", "Slack"],
    tint: "ube",
    preview: [
      "**#** Weekly sync: Oct 14",
      "  decisions: 3 · action items: 5",
      "  tickets created in Linear ==✓==",
      "  summary posted to #team ==✓==",
    ],
    links: [{ label: "Code", href: "#" }],
  },
  {
    title: "evalkit",
    year: 2024,
    categories: ["evals", "prompting"],
    description:
      "A small CLI for running prompt evals from a YAML file, with LLM and rule-based graders and a readable HTML report.",
    tags: ["CLI", "Python", "Evals"],
    tint: "rosas",
    preview: [
      "**$** evalkit run support-bot",
      "  120 cases · 4 graders",
      "  pass ==114== · fail 6",
      "  report → evals/2026-10-18.html",
    ],
    links: [{ label: "Code", href: "#" }],
  },
];
