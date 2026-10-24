/** The assistant's knowledge, built at build time from the CV and projects. See src/lib/assistant.ts. */
import type { APIRoute } from "astro";
import { buildKnowledge } from "@/lib/assistant";
import { site, socials } from "@/data/site";
import { getCv, getProjects } from "@/lib/data";

export const GET: APIRoute = async ({ site: siteUrl }) => {
  const [cv, projects] = await Promise.all([getCv(), getProjects()]);
  const url = (siteUrl?.origin ?? "").replace(/\/$/, "");
  const knowledge = buildKnowledge(cv, projects, { ...site, url }, socials);
  return new Response(JSON.stringify(knowledge), { headers: { "content-type": "application/json" } });
};
