// @ts-check
import { defineConfig, envField } from "astro/config";
import { loadEnv } from "vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Deployment settings come from the environment (.env locally, the host's dashboard in production),
// so moving host or domain is a settings change, not a code change. Every option is in .env.example.
const env = loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "");

/** Canonical URL: sitemap, canonical links and OG tags are built from it. */
const SITE_URL = env.SITE_URL || "https://portfolio-d79q.onrender.com";

/**
 * Empty (default): plain static files, which any static host can serve (Render, Netlify, Vercel,
 * Cloudflare Pages, GitHub Pages, S3...). Set it only when a page needs to run on a server, e.g. to read
 * a database per request; then install the matching package (`npm i @astrojs/node`) and mark that page
 * `export const prerender = false`. Every other page stays static.
 */
const ADAPTERS = {
  node: { pkg: "@astrojs/node", options: { mode: "standalone" } },
  vercel: { pkg: "@astrojs/vercel", options: {} },
  netlify: { pkg: "@astrojs/netlify", options: {} },
  cloudflare: { pkg: "@astrojs/cloudflare", options: {} },
};
/** @param {string | undefined} name */
async function loadAdapter(name) {
  if (!name) return undefined;
  const spec = ADAPTERS[/** @type {keyof typeof ADAPTERS} */ (name)];
  if (!spec) throw new Error(`DEPLOY_ADAPTER="${name}" is not one of: ${Object.keys(ADAPTERS).join(", ")}`);
  try {
    const mod = await import(/* @vite-ignore */ spec.pkg);
    return mod.default(spec.options);
  } catch (e) {
    throw new Error(`DEPLOY_ADAPTER=${name} needs ${spec.pkg}: run \`npm i ${spec.pkg}\`\n${e}`);
  }
}

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE_URL,
  output: "static",
  adapter: await loadAdapter(env.DEPLOY_ADAPTER),
  // `/projects/` style URLs work on every static host without rewrites.
  trailingSlash: "always",
  // Tanim became Timpla's Beans and Shipped-in chapters; old links keep working
  redirects: {
    "/tanim/": "/timpla/beans/",
    "/tanim/country/": "/timpla/country/",
    "/tanim/shipped/": "/timpla/shipped/",
    "/tanim/tour/": "/timpla/tour/",
    "/tanim/data/": "/timpla/data/#beans",
  },
  integrations: [react(), sitemap()],
  // Typed, validated settings for the code (import from "astro:env/server"). A wrong value fails the build.
  env: {
    schema: {
      DATA_SOURCE: envField.enum({ context: "server", access: "public", values: ["local", "http"], default: "local" }),
      DATA_API_URL: envField.string({ context: "server", access: "public", optional: true, url: true }),
      DATA_API_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
