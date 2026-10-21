export type Swatch = "rosas" | "ube" | "pandan" | "mangga" | "langit";

export type ToolGroup = { title: string; description: string; swatch: Swatch; items: string[] };

export const setup = [
  { label: "Machine", value: "macOS" },
  { label: "Editor", value: "VS Code + Claude Code" },
  { label: "Fuel", value: "A lot of coffee" },
];

export const toolGroups: ToolGroup[] = [
  {
    title: "Core",
    description: "The languages everything else is written in.",
    swatch: "rosas",
    items: ["Python", "TypeScript", "JavaScript", "SQL", "JSON Schema"],
  },
  {
    title: "AI & LLMs",
    description: "Models, prompting and retrieval.",
    swatch: "ube",
    items: ["Claude API", "OpenAI API", "Prompt engineering", "Tool use / function calling", "MCP", "RAG", "Embeddings"],
  },
  {
    title: "Automation",
    description: "Connecting the tools teams already use.",
    swatch: "pandan",
    items: ["n8n", "Make", "Zapier", "Webhooks", "REST APIs", "Cron jobs"],
  },
  {
    title: "Evals & Observability",
    description: "Knowing whether a change actually helped.",
    swatch: "mangga",
    items: ["Custom eval sets", "LLM-as-judge", "Langfuse", "pytest"],
  },
  {
    title: "Data & Platforms",
    description: "Where the data lives and the apps run.",
    swatch: "langit",
    items: ["PostgreSQL", "pgvector", "Supabase", "Airtable", "Vercel", "Render", "Google Workspace"],
  },
  {
    title: "Software",
    description: "The apps open on my screen all day.",
    swatch: "rosas",
    items: ["VS Code", "Claude Code", "Figma", "Postman", "Notion"],
  },
  {
    title: "DevOps",
    description: "Shipping and keeping things running.",
    swatch: "ube",
    items: ["Git", "Docker", "GitHub Actions", "Linux"],
  },
];

/** Short list shown on the home page. */
export const toolboxHighlights: { label: string; swatch: Swatch }[] = [
  { label: "Prompt engineering", swatch: "rosas" },
  { label: "LLM agents", swatch: "ube" },
  { label: "RAG", swatch: "pandan" },
  { label: "Evals", swatch: "mangga" },
  { label: "Claude & OpenAI APIs", swatch: "langit" },
  { label: "n8n", swatch: "rosas" },
  { label: "Make", swatch: "ube" },
  { label: "Zapier", swatch: "pandan" },
  { label: "Python", swatch: "mangga" },
  { label: "JavaScript", swatch: "langit" },
  { label: "Vector databases", swatch: "rosas" },
  { label: "Webhooks & APIs", swatch: "ube" },
];
