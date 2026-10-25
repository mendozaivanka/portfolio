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
  /** Screenshot shown on the card instead of the terminal preview. */
  media?: Media;
  /** A dedicated page at /projects/<slug>/ walking through the problem, architecture and evals. */
  caseStudy?: CaseStudy;
};

export type Media = {
  /** Screenshot shown on the card, under public/. */
  poster: string;
  alt: string;
  width: number;
  height: number;
};

/** One box in the architecture diagram. */
export type DiagramNode = { label: string; tech: string; note?: string };

export type CaseStudy = {
  slug: string;
  /** One line under the title, e.g. the headline result. */
  tagline: string;
  /** What I owned on the project. */
  role: string;
  problem: { headline: string; body: string[] };
  /** Left-to-right stages; each holds one or more boxes. `loop` is the feedback path drawn back to the start. */
  architecture: { caption: string; stages: { title: string; nodes: DiagramNode[] }[]; loop?: string };
  solution: string[];
  evals: {
    /** How success was measured, step by step. */
    method: string[];
    metrics: { value: string; label: string; note: string }[];
    /** What the numbers don't show. */
    caveat?: string;
  };
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
    caseStudy: {
      slug: "anomaly-detection",
      tagline: "From a manual review queue to alerts people trust: 3.2× more real issues caught with 75% less monitoring.",
      role: "Designed and built the detection job, the data model behind it and the Tableau reporting.",
      problem: {
        headline: "The team was drowning in a manual review queue.",
        body: [
          "Product and test data arrived every day, and checking it meant someone scrolling through charts and spreadsheets looking for anything odd. Most of what got flagged was noise, and the problems that mattered were easy to miss in the pile.",
          "The review took hours that engineers would rather have spent fixing things, and how good it was depended on who was on duty.",
        ],
      },
      architecture: {
        caption: "Data is collected and cleaned into PostgreSQL, a Python job scores it, and only the flags worth a look reach people.",
        stages: [
          { title: "Collect", nodes: [{ label: "Collectors", tech: "Python · Selenium", note: "pull data from systems with no API" }] },
          { title: "Store", nodes: [{ label: "Structured tables", tech: "PostgreSQL", note: "one clean history per series" }] },
          { title: "Detect", nodes: [{ label: "Detection job", tech: "Python", note: "scores every series, flags outliers" }] },
          {
            title: "Surface",
            nodes: [
              { label: "Dashboards", tech: "Tableau", note: "trends and flagged points" },
              { label: "Alerts", tech: "Python", note: "only the flags worth a look" },
            ],
          },
        ],
        loop: "Engineers confirm or dismiss each flag, and those answers are used to tune the detection thresholds.",
      },
      solution: [
        "Replaced the daily eyeball check with a scheduled job that scores every series and flags only the points that look wrong.",
        "Put the flags where the team already looks: Tableau dashboards for the trend, alerts for what needs action now.",
        "Kept a person in the loop. Every flag gets confirmed or dismissed, so the team can see whether the detector is earning its keep.",
      ],
      evals: {
        method: [
          "Took the manual review as the baseline: what it caught, and how long it took.",
          "Ran the detector over the same periods and counted the confirmed, real issues each approach found.",
          "Measured time spent on monitoring before and after the switch.",
        ],
        metrics: [
          { value: "3.2×", label: "more real issues caught", note: "vs. manual review over the same data" },
          { value: "75%", label: "less manual monitoring", note: "time spent on routine checking" },
        ],
        caveat: "A detector that flags everything also \"catches more\". Counting only confirmed issues keeps the comparison honest.",
      },
    },
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
    caseStudy: {
      slug: "test-case-recommender",
      tagline: "A retrieval pipeline that drafts the test plan: ~90% retrieval accuracy over the team's test library.",
      role: "Built the ingestion, indexing and retrieval pipeline, and the eval set used to tune it.",
      problem: {
        headline: "Writing a test plan meant a day of searching.",
        body: [
          "The test library was large and spread across structured tables and semi-structured documents. For every change or new requirement, someone had to work out which existing cases applied.",
          "That depended on memory and search, so plans were slow to write and uneven: the cases a senior engineer would know to include were easy for anyone else to miss.",
        ],
      },
      architecture: {
        caption: "Test cases live in PostgreSQL, LlamaIndex retrieves the relevant ones for a change, and a local model served by Ollama ranks them into a draft plan.",
        stages: [
          { title: "Ingest", nodes: [{ label: "Loaders", tech: "Python", note: "structured and semi-structured test cases" }] },
          { title: "Store", nodes: [{ label: "Test library", tech: "PostgreSQL", note: "cases plus metadata" }] },
          { title: "Retrieve", nodes: [{ label: "Index + retriever", tech: "LlamaIndex", note: "finds candidate cases for a change" }] },
          { title: "Rank", nodes: [{ label: "Local LLM", tech: "Ollama", note: "orders and explains the picks" }] },
          { title: "Deliver", nodes: [{ label: "Draft test plan", tech: "Django", note: "an engineer reviews and edits" }] },
        ],
        loop: "Accepted and rejected recommendations become new labelled examples for the eval set.",
      },
      solution: [
        "Loaded the whole test library, tables and documents alike, into one PostgreSQL store with consistent metadata.",
        "Indexed it with LlamaIndex so a change description or requirement retrieves the cases that cover it.",
        "Turned test-plan writing into a review: the pipeline drafts the list and an engineer checks it.",
      ],
      evals: {
        method: [
          "Built an eval set from past changes paired with the test cases engineers actually used for them.",
          "Ran each change through the pipeline and checked whether the right cases came back.",
          "Re-ran the full set after every change to chunking, metadata or prompts, and kept only the changes that improved it.",
        ],
        metrics: [{ value: "~90%", label: "retrieval accuracy", note: "on the labelled set of past changes" }],
        caveat: "The eval set comes from plans people already wrote, so it measures agreement with past practice, not whether those plans were complete.",
      },
    },
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
    caseStudy: {
      slug: "root-cause-analysis",
      tagline: "A fine-tuned local model that reads failures and proposes a root cause: ~93% F1, and the data stays on-prem.",
      role: "Prepared the training and eval data, fine-tuned the models, iterated on prompts and served them locally.",
      problem: {
        headline: "Every failure needed someone to read the logs.",
        body: [
          "When a test failed, an engineer had to dig through logs and output to work out why. Many failures had the same handful of causes, but each one still took a person's time.",
          "The data was sensitive, so sending it to a hosted model wasn't an option.",
        ],
      },
      architecture: {
        caption: "Failure logs go into PostgreSQL, a model fine-tuned with Unsloth runs locally on Ollama, and its answer lands in the team's Django app.",
        stages: [
          { title: "Collect", nodes: [{ label: "Logs + test output", tech: "Python", note: "parsed into clean records" }] },
          { title: "Store", nodes: [{ label: "Failure history", tech: "PostgreSQL", note: "labelled past failures" }] },
          {
            title: "Model",
            nodes: [
              { label: "Fine-tune", tech: "Unsloth", note: "trained on labelled failures" },
              { label: "Serve", tech: "Ollama", note: "runs on local hardware" },
            ],
          },
          { title: "Deliver", nodes: [{ label: "Root cause + class", tech: "Django", note: "attached to the failure" }] },
        ],
        loop: "Wrong answers corrected by engineers go back into the training and eval data.",
      },
      solution: [
        "Fine-tuned small open models with Unsloth on labelled past failures, and served them with Ollama so nothing leaves the building.",
        "Combined fine-tuning with prompt work: a structured prompt that asks for the failure class first, then the likely cause.",
        "Surfaced the answer inside the Django app engineers already use, as a suggestion they can accept or correct.",
      ],
      evals: {
        method: [
          "Held back a set of labelled failures that the model never saw in training.",
          "Scored every model and prompt version on that set with precision, recall and F1.",
          "Promoted a version only if it beat the current one on F1 without a drop on any important class.",
        ],
        metrics: [{ value: "~93%", label: "F1 score", note: "on held-out labelled failures" }],
        caveat: "F1 on known failure types says little about brand-new ones, so a confident answer on something unfamiliar still goes to a person.",
      },
    },
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
    featured: true,
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
  },
  {
    title: "Timpla",
    year: 2026,
    period: "2026–",
    kind: "personal",
    categories: ["data", "automation"],
    description:
      "Philippine coffee from the province that grows it to the café that pours it. The Beans chapter maps every province's harvest since 2010 from the Philippine Statistics Authority's own counts; Shipped in shows what was imported and from where; the café map covers Metro Manila's 329 independent cafés, 108 specialty, with who roasts for whom. Free, open data only; no star ratings, just receipts.",
    summary: "Philippine coffee from the farm to the cup: every province's harvest, what was shipped in, and Metro Manila's 329 independent cafés.",
    results: ["82 provinces", "329 cafés"],
    tags: ["Data viz", "MapLibre", "PSA OpenSTAT", "Python", "Astro"],
    tint: "rosas",
    preview: [
      "**timpla** · built 2026-10-21",
      "  shops ==108== · branches 173",
      "  Benguet on menus 29% · harvest 12%",
      "  Sultan Kudarat menus 5% · harvest ==52%==",
    ],
    links: [{ label: "Open Timpla", href: "/timpla/" }],
    featured: true,
    media: {
      poster: "/projects/timpla/timpla-map-poster.jpg",
      alt: "The Timpla map of Metro Manila: café dots across Makati and Pasig, with a details card for Toby's Estate in Ortigas.",
      width: 800,
      height: 430,
    },
  },
];

