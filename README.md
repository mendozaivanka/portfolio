# Tala Rosa Portfolio

Ivanka's portfolio, built on the **Tala** brand direction (eight-point star mark, *inabel* stripe, Newsreader + Figtree + DM Mono) re-tinted in pastel pink. The design system is documented, with live components and computed contrast ratios, at [`/tala/`](https://portfolio-d79q.onrender.com/tala/).

**Stack:** [Astro 7](https://astro.build) renders static pages; [React 19](https://react.dev) islands add interaction; [shadcn/ui](https://ui.shadcn.com) components (Radix base, Tailwind CSS v4) provide the UI; deployed as a static site on [Render](https://render.com).

## Run it locally

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # tokens → type-check → build to dist/
npm run preview    # serve dist/ locally
npm run check      # type-check + content validation only
```

Needs Node 22.22 or newer (`.node-version` pins 24).

## Make it yours

Everything personal is data, not markup. Edit the file, run `npm run dev`, and the build tells you if an entry is malformed (see [Content is validated](#content-is-validated)):

| What | Where |
|---|---|
| Name, role, location, time zone, email, availability, nav | `src/data/site.ts` |
| Social links | `socials` in `src/data/site.ts` |
| Rotating prompts + sparkline numbers | `prompts` / `passRates` in `src/data/site.ts` |
| Projects, filters, preview lines, links | `src/data/projects.ts` (`kind: "work"` shows employer + period and groups under "At work"; `kind: "personal"` under "Side projects"; `featured: true` shows on the home page; links with `href: "#"` are hidden) |
| Tools / stack, setup card, home-page highlights | `src/data/tools.ts` |
| CV: roles, education, skills, headline numbers (rendered as timeline, JSON and system prompt on `/cv/`) | `src/data/cv.ts` (set `profile.pdf` to a file in `public/` to show a download button; `profile.phone` is off by default) |
| Timpla café data (generated; don't hand-edit) | `src/data/timpla/*.json`, rebuilt by `npm run timpla:data` from `../cafe-data` |
| Bio, hero copy, "how I work" cards | `src/pages/index.astro` |
| Photo | `src/assets/me.jpeg` (Astro resizes and converts it to WebP) |
| **Colours, all four themes** | `src/data/tokens.ts` (see below) |

## Colour tokens

`src/data/tokens.ts` is the single source of truth. `npm run tokens` (run automatically before `dev` and `build`) generates `src/styles/tokens.css` from it, and the Tala page computes its accessibility table from the same file. **The build fails if any pair drops below its WCAG target** (4.5:1 text / 3:1 UI; 7:1 / 4.5:1 in the high-contrast themes), so a palette edit can't quietly regress.

Themes: light, dark (via `data-theme` or the OS), plus high-contrast variants (via `data-contrast="high"` or `prefers-contrast: more`).

## Adding shadcn/ui components

```sh
npx shadcn@latest add <component>
```

They land in `src/components/ui/` and pick up the Tala Rosa theme automatically through the CSS variables in `global.css`.

## Case studies, résumé PDF and the assistant

- **Case studies**: give a project a `caseStudy` in `src/data/projects.ts` (problem, architecture stages, solution,
  evals) and it gets a page at `/projects/<slug>/`, a "Read the case study" button and a line on the résumé.
- **Card media**: a project's `media` (a screenshot under `public/projects/`) replaces the terminal preview on its card.
- **Timpla on the home page**: its own section with the live map in an iframe (`/timpla/embed/`, map only, links open
  in the parent window). The iframe needs same-origin framing allowed, see `render.yaml` headers.
- **Résumé PDF**: `/resume/` is the CV laid out for A4. After changing `src/data/cv.ts`, run `npm run resume:pdf` and
  commit the PDF it writes to `public/` (path from `cv.profile.pdf`). First time: `npx playwright install chromium`.
- **"Ask about me" assistant**: knowledge is built from the CV and projects into `/assistant-knowledge.json`. With
  `PUBLIC_CHAT_API_URL` empty the widget answers offline in the browser; deploy `chat-worker/` (free Cloudflare
  Workers AI, see its README) and set the variable for real LLM answers.

## Configuration

Deployment and data settings live in the environment, not in code. Copy `.env.example` to `.env` for local
overrides; in production set them in the host's dashboard. All are optional; the defaults reproduce the live site.

| Variable | Default | What it does |
|---|---|---|
| `SITE_URL` | `https://portfolio-d79q.onrender.com` | Canonical URL for links, sitemap and social cards. Change it with a custom domain or a new host. |
| `DEPLOY_ADAPTER` | *(empty: static)* | `node`, `vercel`, `netlify` or `cloudflare` when a page must run on a server. |
| `DATA_SOURCE` | `local` | Where content comes from: `local` (files in `src/data/`) or `http` (a JSON API). |
| `DATA_API_URL` | | Base URL for `DATA_SOURCE=http`. |
| `DATA_API_TOKEN` | | Secret bearer token for that API. Dashboard only; never commit it. |

`DATA_*` are typed with Astro's [`astro:env`](https://docs.astro.build/en/guides/environment-variables/) schema in `astro.config.mjs`, so a wrong value (say `DATA_SOURCE=postgress`) stops the build with a clear message.

## The data layer

Pages never import content files directly. They ask the data layer:

```ts
import { getProjects, getCv, getShops } from "@/lib/data";
const projects = await getProjects();
```

```
src/lib/data/
  index.ts          getProjects(), getCv(), getTools(), getShops(), … picks the source, validates, caches
  schemas.ts        the shape of every piece of content (zod), tied to the TypeScript types
  sources/
    types.ts        the DataSource interface a source implements
    local.ts        DATA_SOURCE=local: the files in src/data/ (the default)
    http.ts         DATA_SOURCE=http: the same content from any JSON API
```

### Content is validated

Whatever the source, every result is checked against `schemas.ts` before a page sees it. Objects are strict, so a typo
fails the build and names the entry:

```
Invalid projects from the "local" data source:
  • projects[0] "Anomaly Detection & Reporting".tint: Invalid option: expected one of "rosas"|"ube"|"pandan"|"mangga"
  • projects[0] "Anomaly Detection & Reporting": Unrecognized key: "summmary"
```

**Adding a field** to a project (or any content): add it to the type in `src/data/projects.ts` *and* to `projectSchema`
in `schemas.ts`. `astro check` fails if the two disagree, so you can't forget one.

### Connecting a database

1. **Export the content** in the exact shape the site expects: `npm run data:export` writes `data-export/`
   (`projects`, `cv`, `tools`, `timpla/shops`, …). Use it to seed tables or a CMS.
2. **Pick a route** (all free; this project avoids paid services):
   - *Any JSON API* (Supabase's free plan exposes tables as REST; JSON files in a public GitHub repo or Gist
     also work): no code. Set
     `DATA_SOURCE=http` and `DATA_API_URL`. The API must answer the paths listed at the top of
     `src/lib/data/sources/http.ts`. Serving `data-export/` itself works: `python3 -m http.server -d data-export 8765` with `DATA_API_URL=http://localhost:8765`.
   - *A database directly* (free tiers: Supabase or Neon for Postgres, Turso for SQLite; or a SQLite file committed
     to the repo, which needs no service at all): add `src/lib/data/sources/postgres.ts` implementing
     `DataSource`, for example:

     ```ts
     import pg from "pg";                                   // npm i pg
     import { DATABASE_URL } from "astro:env/server";
     import type { DataSource } from "./types";

     const db = new pg.Pool({ connectionString: DATABASE_URL });
     const rows = async (sql: string) => (await db.query(sql)).rows;

     export const postgres: DataSource = {
       name: "postgres",
       projects: () => rows("select * from projects order by position"),
       cv: async () => (await rows("select data from cv limit 1"))[0].data,
       // …one line per method in types.ts
     };
     ```

     then register it in `SOURCES` (`src/lib/data/index.ts`), add `"postgres"` to the `DATA_SOURCE` values and a
     `DATABASE_URL` secret (`envField.string({ context: "server", access: "secret" })`) in `astro.config.mjs`.
3. **Set `DATA_SOURCE`** locally to test (`npm run build` must pass validation), then in the host's dashboard.

Free-tier caveats worth knowing: Supabase pauses a free project after a week without requests (one click in its dashboard
wakes it, and builds fail until then); Render's free Postgres expires after 30 days, so it isn't a good
home for content.

Pages don't change. The site stays static: data is read once per deploy. To show changes from the database
without redeploying, either trigger a redeploy from the database (Render deploy hook) or render a page per request
(next section).

## Changing host

The build is plain static files in `dist/`, so any static host works. What every host needs:

| Setting | Value |
|---|---|
| Build command | `npm ci && npm run build` |
| Publish / output directory | `dist` |
| Node version | 24 (`.node-version`) |
| Environment | `SITE_URL` = the new URL (plus any `DATA_*` you use) |

- **Render** (current): `render.yaml` holds the above plus cache and security headers. Deploys on every push to `main`.
All of these host a static site like this one for free:

- **Netlify / Cloudflare Pages / Vercel** (free plans): connect the repo and enter the table above; Vercel and Cloudflare detect
  Astro by themselves. Copy the headers from `render.yaml` if you want them (`netlify.toml`, `_headers`, or `vercel.json`).
- **GitHub Pages** (free for public repos): works with a custom domain. On `username.github.io/repo/` it would need a `base` path, which the
  hard-coded links don't support yet.

**When a page needs a server** (per-request database reads, form handling, auth): `npm i @astrojs/node` (or `vercel`,
`netlify`, `cloudflare`), set `DEPLOY_ADAPTER` to match, and add `export const prerender = false` to that page only.
Every other page stays static. On Render that means switching the service from Static Site to Web Service with start
command `node dist/server/entry.mjs`; Render's free web services sleep after 15 minutes idle, so the first visit after a
pause takes up to a minute. Cloudflare Pages and Netlify run server pages as free functions without that delay, so
for a free setup with server pages prefer `DEPLOY_ADAPTER=cloudflare` or `netlify`.

## Structure

```
src/
  data/          content you edit (projects, cv, tools, site, tokens) + generated Timpla JSON
  lib/data/      data layer: getters, schemas, sources (local, http)
  pages/         index, projects, tools, cv, tala, timpla/, 404 (Astro)
  layouts/       Layout.astro: head, header, footer, theme script
  components/    *.astro = static; *.tsx = React islands; ui/ = shadcn; timpla/ = café project
  lib/           theme, toast, contrast, timpla helpers
  styles/        global.css (Tailwind + shadcn theme), tokens.css (generated)
scripts/         gen-tokens.ts, build-timpla-data.ts, export-data.ts
public/          favicon, touch icon, CV PDF, robots.txt
astro.config.mjs site URL, adapter switch, env schema
render.yaml      Render Blueprint (static site, caching + security headers, env)
.env.example     every setting, documented
.github/         CI: builds every push and pull request
```

## Deploy

Every push to `main` triggers Render to run `npm ci && npm run build` and publish `dist/`. If the build fails
(type error, invalid content, contrast regression) Render keeps serving the previous version. The GitHub Actions
workflow runs the same build on pull requests, so you can check a change on a branch before merging it.
