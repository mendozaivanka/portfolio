export type Category = "agents" | "automation" | "rag" | "prompting" | "evals" | "data";
export type Tint = "rosas" | "ube" | "pandan" | "mangga";
export type Kind = "work" | "personal";

export type Project = {
  title: string;
  year: number;
  /** Shown instead of `year` when set, e.g. "2024–2026". */
  period?: string;
  /** "work": built on the job (internal system, described at CV level). "personal": public side project. */
  kind: Kind;
  /** Employer or client, shown on work projects. */
  org?: string;
  categories: Category[];
  /** Full description, shown on the projects page. */
  description: string;
  /** Shorter version for the home page. Falls back to `description`. */
  summary?: string;
  /** Measured results, from the CV. Shown as highlighted figures. */
  results?: string[];
  tags: string[];
  tint: Tint;
  /**
   * Lines for the little terminal preview. Leading spaces are kept.
   * Mini-markup: **text** = highlighted in rose, ==text== = highlighted in gold.
   */
  preview: string[];
  /** Public links. Empty for internal work. Entries with href "#" are hidden. */
  links: { label: string; href: string }[];
  featured?: boolean;
};

export const categories: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "agents", label: "Agents" },
  { id: "rag", label: "RAG" },
  { id: "prompting", label: "Prompting" },
  { id: "evals", label: "Evals" },
  { id: "automation", label: "Automation" },
  { id: "data", label: "Data" },
];

export const kinds: { id: Kind; label: string; note: string }[] = [
  {
    id: "work",
    label: "At work",
    note: "Built for employers and their clients. The systems are internal, so these are described at the level I can share; the numbers are the ones on my CV.",
  },
  { id: "personal", label: "Side projects", note: "Public experiments and tools." },
];

const AWS = "Advanced World Systems";
const GENPACT = "Genpact";

export const projects: Project[] = [
  {
    title: "Anomaly Detection & Reporting",
    year: 2025,
    period: "2024–2026",
    kind: "work",
    org: AWS,
    categories: ["automation", "data"],
    description:
      "Automated anomaly detection over product and test data, surfaced through Tableau dashboards and alerts instead of manual review. Real issues were caught 3.2× more often and the team's manual monitoring workload fell by 75%.",
    summary: "Automated anomaly detection with Tableau dashboards and alerts: 3.2× more real issues caught, 75% less manual monitoring.",
    results: ["3.2× detection rate", "75% less manual work"],
    tags: ["Python", "Tableau", "PostgreSQL"],
    tint: "rosas",
    preview: [
      "**›** nightly scan · 1,284 series",
      "  flagged: 17 · confirmed real: ==14==",
      "  manual review queue: 112 → ==28==",
      "  dashboard refreshed 06:00 PHT",
    ],
    links: [],
    featured: true,
  },
  {
    title: "Test-Case Recommender",
    year: 2025,
    period: "2024–2026",
    kind: "work",
    org: AWS,
    categories: ["rag", "automation"],
    description:
      "A retrieval-augmented pipeline on LlamaIndex that reads a change or requirement and recommends the relevant existing test cases, over structured and semi-structured sources. Around 90% retrieval accuracy, which turned test-plan creation from a day of searching into a review.",
    summary: "RAG over the test library on LlamaIndex: ~90% retrieval accuracy, test plans drafted automatically.",
    results: ["~90% retrieval accuracy"],
    tags: ["LlamaIndex", "RAG", "Python", "PostgreSQL"],
    tint: "pandan",
    preview: [
      "**Q:** regression plan for firmware 4.2 → 4.3",
      "**A:** 23 cases recommended",
      "  ==[1]== TC-0412 power-cycle under load",
      "  ==[2]== TC-0097 thermal throttling",
    ],
    links: [],
    featured: true,
  },
  {
    title: "Root-Cause Analysis Model",
    year: 2025,
    period: "2024–2026",
    kind: "work",
    org: AWS,
    categories: ["prompting", "evals"],
    description:
      "Fine-tuned local LLMs with Unsloth, served through Ollama, to classify failures and propose a root cause from logs and test output. Iterating on prompts and the eval set took the model to about 93% F1, and kept the data on-prem.",
    summary: "Fine-tuned local LLMs (Unsloth + Ollama) for root-cause analysis: ~93% F1, data never leaves the building.",
    results: ["~93% F1"],
    tags: ["Unsloth", "Ollama", "Prompt eng.", "Evals"],
    tint: "ube",
    preview: [
      "**$** eval run rca-v7 · 240 cases",
      "  precision 0.94 · recall 0.92 · F1 ==0.93==",
      "  top cause: sensor init timeout",
      "  served locally via ollama",
    ],
    links: [],
    featured: true,
  },
  {
    title: "Multi-Agent QA for Enterprise AI",
    year: 2026,
    period: "2026–",
    kind: "work",
    org: GENPACT,
    categories: ["agents", "evals", "prompting"],
    description:
      "Designing LLM workflows and multi-agent systems that quality-assure enterprise AI tools for banking and capital markets, across OpenAI, Anthropic, Azure OpenAI, SageMaker and Bedrock. Prompt optimisation, RAG and model-evaluation methods, plus the governance and responsible-AI frameworks around them.",
    summary: "Multi-agent systems and evals that quality-assure enterprise AI tools for banking, across five LLM platforms.",
    tags: ["LangChain", "LlamaIndex", "Anthropic", "OpenAI", "Bedrock"],
    tint: "mangga",
    preview: [
      "**›** reviewer agent · policy check",
      "  grounded: ==yes== · PII: none · tone: ok",
      "**›** judge agent · rubric v3",
      "  score 4.6/5 → approved",
    ],
    links: [],
    featured: true,
  },
  {
    title: "Data Ingestion Pipelines",
    year: 2024,
    period: "2024–2025",
    kind: "work",
    org: AWS,
    categories: ["automation", "data"],
    description:
      "Selenium-based collectors that pull data from systems without APIs, clean it and load it into structured PostgreSQL tables, feeding the dashboards and the retrieval index downstream.",
    tags: ["Selenium", "Python", "PostgreSQL"],
    tint: "rosas",
    preview: [
      "**$** ingest run · 6 sources",
      "  rows collected: 48,210",
      "  normalised → postgres ==ok==",
      "  next run in 60 min",
    ],
    links: [],
    featured: true,
  },
  {
    title: "AI Inference in a Django App",
    year: 2025,
    period: "2024–2026",
    kind: "work",
    org: AWS,
    categories: ["automation", "agents"],
    description:
      "Integrated the team's models into a Django web application so engineers get real-time inference and automated workflows inside the tool they already use, rather than a separate script.",
    tags: ["Django", "Python", "REST"],
    tint: "ube",
    preview: [
      "**POST** /api/analyse · 200",
      "  model: rca-v7 · latency ==412 ms==",
      "  result pushed to ticket #5531",
      "  workflow: auto-assign → notify",
    ],
    links: [],
  },
  {
    title: "GPU/NPU Performance Monitoring",
    year: 2024,
    period: "2024",
    kind: "work",
    org: `${AWS} (internship)`,
    categories: ["automation", "data"],
    description:
      "Automated performance-monitoring tools for GPU and NPU utilisation in C#/.NET, plus Python + OpenVINO automation for AI environment setup and inference, with research into local LLM inference and NPU optimisation.",
    tags: ["C#/.NET", "Python", "OpenVINO"],
    tint: "pandan",
    preview: [
      "**›** npu util 71% · gpu util 38%",
      "  inference: 12.4 img/s (openvino)",
      "  env setup: ==automated== · 4 min",
      "  report → weekly perf summary",
    ],
    links: [],
  },
  {
    title: "Prompt Garden",
    year: 2026,
    period: "2026–",
    kind: "personal",
    categories: ["prompting", "evals"],
    description:
      "My own tool: a versioned prompt library with side-by-side evals, so you can see whether a prompt change actually made things better before it ships. Prompts are treated like code, with a pass rate per version. The card at the top of the home page is its dashboard.",
    summary: "A versioned prompt library with side-by-side evals, so you can see whether a change actually helped. My own tool.",
    tags: ["Prompt eng.", "Evals", "TypeScript", "Claude API"],
    tint: "ube",
    preview: [
      "**summarise.prompt**  v3 → v4",
      "  accuracy    82% → ==91%==",
      "  avg tokens  412 → ==288==",
      "  regressions ==0==",
    ],
    // Add a GitHub or live link here when it's public
    links: [],
    featured: true,
  },
];
