// ───────── Edit these: everything personal lives here ─────────

export const site = {
  name: "Ivanka",
  role: "AI & Automation Engineer",
  description:
    "Ivanka Mendoza is an AI, automation and prompt engineer who builds RAG pipelines, agents and workflows that quietly do the busywork.",
  location: "Metro Manila",
  // IANA time zone for the header clock. Leave empty to use the visitor's own.
  timeZone: "Asia/Manila",
  email: "mendozaivanka@gmail.com",
  available: true,
};

export type Social = { name: string; href: string; note: string };

export const socials: Social[] = [
  { name: "GitHub", href: "https://github.com/mendozaivanka", note: "workflows, prompts & experiments" },
  { name: "LinkedIn", href: "https://www.linkedin.com/", note: "the professional version" },
  // { name: "X / Twitter", href: "https://x.com/", note: "half-baked AI thoughts" },
  // { name: "Upwork", href: "https://www.upwork.com/", note: "hire me for a project" },
  // { name: "Contra", href: "https://contra.com/", note: "freelance profile" },
];

/** Lines that rotate in the "Currently prompting" card. */
export const prompts = [
  "You are a calm, precise assistant…",
  "Extract every invoice line item as JSON.",
  "Think step by step, then answer in one line.",
  "If you're unsure, say so. Never guess.",
  "Classify this ticket: billing, bug, or feature?",
];

/** Eval pass rate (%) for prompt versions v1…v9, drawn as the hero sparkline. Sample data. */
export const passRates = [71, 74, 82, 80, 85, 88, 90, 93, 95];

export const nav = [
  { label: "Projects", href: "/projects/" },
  { label: "Tools", href: "/tools/" },
  { label: "CV", href: "/cv/" },
  { label: "Tala", href: "/tala/" },
  { label: "Contact", href: "/#contact" },
];
