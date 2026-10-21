/**
 * Curriculum vitae. One source of truth, rendered three ways on /cv/
 * (timeline, JSON, system prompt) and summarised on the home page.
 * Dates are ISO "YYYY-MM"; `end: null` means current.
 */

export type Role = {
  company: string;
  title: string;
  location: string;
  start: string;
  end: string | null;
  bullets: string[];
  stack?: string[];
};

export type Impact = { value: string; label: string; note: string };

export const cv = {
  profile: {
    fullName: "Ivanka Chaental Louise Mendoza",
    title: "AI & Automation Engineer",
    location: "Alabang, Muntinlupa, Philippines",
    email: "mendozaivanka@gmail.com",
    // Deliberately not published on the public site. Set it to show it on /cv/.
    phone: null as string | null,
    summary:
      "AI and Automation Engineer with experience building automated anomaly detection systems, data pipelines and LLM-powered analytics tools. Hands-on with RAG pipelines, fine-tuning local LLMs and integrating models into production workflows, with a track record of cutting manual work and improving system performance. Comfortable in front of clients, supporting analytics and reporting systems.",
    /** Path under public/, or null to hide the download button. */
    pdf: null as string | null,
  },

  impact: [
    { value: "3.2×", label: "more real issues caught", note: "automated anomaly detection vs. manual review" },
    { value: "75%", label: "less manual workload", note: "Tableau dashboards and alerting" },
    { value: "~90%", label: "retrieval accuracy", note: "RAG test-case recommender on LlamaIndex" },
    { value: "~93%", label: "F1 score", note: "fine-tuned local LLM for root-cause analysis" },
  ] satisfies Impact[],

  experience: [
    {
      company: "Genpact Services LLC",
      title: "Senior AI / Automation / Prompt Engineer",
      location: "Quezon City, Metro Manila",
      start: "2026-06",
      end: null,
      bullets: [
        "Design, develop and optimise AI/LLM solutions, workflows and multi-agent systems supporting quality assurance of enterprise AI tools for banking and capital markets.",
        "Architect enterprise AI solutions with LangChain, LlamaIndex and Hugging Face, including retrieval-augmented generation and model evaluation methods.",
        "Lead prompt engineering and optimisation across OpenAI, Anthropic, Azure OpenAI, Amazon SageMaker and Amazon Bedrock, for outputs that are accurate, safe and consistent.",
        "Partner with product, engineering and cross-functional teams to find high-impact AI opportunities and set up AI governance and responsible-AI frameworks.",
        "Mentor team members and run knowledge-sharing on AI implementation practice.",
        "Analyse datasets and test results into reporting and actionable insight for executive stakeholders.",
      ],
      stack: ["LangChain", "LlamaIndex", "Hugging Face", "OpenAI", "Anthropic", "Azure OpenAI", "SageMaker", "Bedrock"],
    },
    {
      company: "Advanced World Systems, Inc.",
      title: "Assistant Research and Development Engineer",
      location: "Alabang, Muntinlupa",
      start: "2024-07",
      end: "2026-05",
      bullets: [
        "Designed and implemented automated anomaly detection and dashboard reporting in Tableau, improving real-issue detection 3.2× and reducing manual workload by 75%.",
        "Built RAG pipelines on LlamaIndex that recommend relevant test cases with ~90% retrieval accuracy, automating test-plan creation over structured and semi-structured data.",
        "Fine-tuned local LLMs with Unsloth and Ollama for automated root-cause analysis, reaching ~93% F1 through iterative prompt engineering.",
        "Built Selenium-based ingestion pipelines that collect and transform data into structured PostgreSQL databases.",
        "Integrated AI models into a Django web application for real-time inference and automated end-user workflows.",
        "Worked closely with internal and client stakeholders to turn complex system requirements into structured, maintainable solutions.",
      ],
      stack: ["Python", "Tableau", "PostgreSQL", "LlamaIndex", "Unsloth", "Ollama", "Selenium", "Django"],
    },
    {
      company: "Advanced World Systems, Inc.",
      title: "Intern",
      location: "Alabang, Muntinlupa",
      start: "2024-01",
      end: "2024-05",
      bullets: [
        "Developed automated performance-monitoring tools for GPU and NPU utilisation in C#/.NET.",
        "Automated AI environment setup and inference workflows with Python and OpenVINO.",
        "Researched local LLM inference and NPU optimisation to support internal decisions.",
      ],
      stack: ["C#/.NET", "Python", "OpenVINO"],
    },
  ] satisfies Role[],

  education: [
    {
      school: "Saint Louis University",
      degree: "B.S. Information Technology",
      honours: "Summa Cum Laude · GWA 1.24",
      location: "Baguio, Benguet",
      start: "2020",
      end: "2024",
    },
  ],

  skills: [
    { group: "Programming", items: ["Python", "JavaScript", "C#"] },
    { group: "Data & analytics", items: ["Tableau", "PostgreSQL", "Elasticsearch", "Logstash", "Excel"] },
    { group: "AI / ML tools", items: ["Hugging Face", "LlamaIndex", "Ollama", "Unsloth", "OpenVINO"] },
    { group: "Frameworks", items: ["Django", "Flask", "Vue.js", "Selenium"] },
  ],

  certifications: [
    { name: "Fundamentals of Deep Learning", issuer: "NVIDIA" },
    { name: "Foundations of Data Science", issuer: "Google" },
    { name: "PhilNITS FE Level 2", issuer: "ITPEC" },
    { name: "JLPT N4", issuer: "Japanese Language Proficiency Test" },
  ],

  languages: [
    { name: "English", level: "Fluent" },
    { name: "Filipino", level: "Native" },
    { name: "Japanese", level: "JLPT N4 · 日本語" },
  ],
};

export type CV = typeof cv;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-06" → "Jun 2026"; "2024" → "2024"; null → "Present". */
export function formatDate(d: string | null): string {
  if (d === null) return "Present";
  const [y, m] = d.split("-");
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

/** Whole months between two "YYYY-MM" dates, inclusive of the start month. Only for finished roles,
 *  so server and client agree (no "today" involved). */
export function formatDuration(start: string, end: string): string {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  const months = (ey - sy) * 12 + (em - sm) + 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, m && `${m} mo`].filter(Boolean).join(" ");
}

/** The CV as a system prompt: the same facts, written for a model. */
export function cvAsPrompt(data: CV = cv): string {
  const p = data.profile;
  const lines: string[] = [
    `You are a helpful assistant that answers questions about ${p.fullName}, an ${p.title} based in ${p.location}.`,
    `Answer only from the facts below. If something is not covered here, say you don't know rather than guessing.`,
    ``,
    `## Summary`,
    p.summary,
    ``,
    `## Experience`,
  ];
  for (const r of data.experience) {
    lines.push(`- ${r.title}, ${r.company} (${formatDate(r.start)} → ${formatDate(r.end)}, ${r.location})`);
    for (const b of r.bullets) lines.push(`  - ${b}`);
  }
  lines.push(``, `## Education`);
  for (const e of data.education) lines.push(`- ${e.degree}, ${e.school}, ${e.start}–${e.end}. ${e.honours}.`);
  lines.push(``, `## Skills`);
  for (const s of data.skills) lines.push(`- ${s.group}: ${s.items.join(", ")}`);
  lines.push(``, `## Certifications`);
  for (const c of data.certifications) lines.push(`- ${c.name} (${c.issuer})`);
  lines.push(``, `## Languages`, data.languages.map((l) => `${l.name} (${l.level})`).join(", "));
  lines.push(``, `## Contact`, `Email: ${p.email}`);
  return lines.join("\n");
}
