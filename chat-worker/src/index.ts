/**
 * "Ask about me" chat worker.
 *
 * POST { messages: [{ role: "user" | "assistant", content }] }  →  { reply }
 *
 * The system prompt is the site's own /assistant-knowledge.json, so the model only knows what the portfolio says.
 * Guard rails: only the portfolio's origin may call it, conversations are trimmed, answers are short, and each
 * visitor gets a modest number of questions. When Workers AI's free daily allowance runs out, the call fails and the
 * widget quietly switches to its offline mode.
 */
interface Env {
  AI: { run(model: string, input: unknown): Promise<{ response?: string }> };
  SITE_URL: string;
  ALLOWED_ORIGINS: string;
  MODEL: string;
}

type Msg = { role: "user" | "assistant"; content: string };

const MAX_TURNS = 8;
const MAX_CHARS = 600;
const PER_VISITOR = { limit: 20, windowMs: 10 * 60_000 };

// Best effort, per worker instance: enough to stop one tab from burning the day's free quota.
const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < PER_VISITOR.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > PER_VISITOR.limit;
}

let cached: { prompt: string; at: number } | null = null;
async function systemPrompt(env: Env) {
  if (cached && Date.now() - cached.at < 3600_000) return cached.prompt;
  const res = await fetch(new URL("/assistant-knowledge.json", env.SITE_URL), { cf: { cacheTtl: 3600 } } as RequestInit);
  if (!res.ok) throw new Error(`knowledge ${res.status}`);
  const { prompt } = (await res.json()) as { prompt: string };
  cached = { prompt, at: Date.now() };
  return prompt;
}

function cors(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "content-type": "application/json" } });

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get("origin") ?? "";
    const allowed = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).includes(origin);
    if (!allowed) return new Response("Forbidden", { status: 403 });
    const headers = cors(origin);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (req.method !== "POST") return json({ error: "POST only" }, 405, headers);

    if (tooMany(req.headers.get("cf-connecting-ip") ?? "unknown"))
      return json({ error: "Too many questions for now. Try again in a few minutes." }, 429, headers);

    let messages: Msg[];
    try {
      const body = (await req.json()) as { messages?: unknown };
      if (!Array.isArray(body.messages)) throw new Error();
      messages = body.messages
        .filter((m): m is Msg => !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .slice(-MAX_TURNS)
        .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
      if (!messages.length || messages.at(-1)!.role !== "user") throw new Error();
    } catch {
      return json({ error: "Expected { messages: [...] } ending with a user message." }, 400, headers);
    }

    try {
      const prompt = await systemPrompt(env);
      const out = await env.AI.run(env.MODEL, {
        messages: [{ role: "system", content: prompt }, ...messages],
        max_tokens: 350,
        temperature: 0.3,
      });
      const reply = out.response?.trim();
      if (!reply) throw new Error("empty reply");
      return json({ reply }, 200, headers);
    } catch (e) {
      // Usually the free daily allowance is used up; the widget falls back to offline answers.
      console.error(e);
      return json({ error: "The assistant is resting. Offline answers still work." }, 503, headers);
    }
  },
};
