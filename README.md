# Tala Rosa Portfolio

Ivanka's portfolio, built on the **Tala** brand direction (eight-point star mark, *inabel* stripe, Newsreader + Figtree + DM Mono) re-tinted in pastel pink. The design system is documented, with live components and computed contrast ratios, at [`/tala/`](https://portfolio-d79q.onrender.com/tala/).

**Stack:** [Astro 7](https://astro.build) renders static pages; [React 19](https://react.dev) islands add interaction; [shadcn/ui](https://ui.shadcn.com) components (Radix base, Tailwind CSS v4) provide the UI; deployed as a static site on [Render](https://render.com).

## Run it locally

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # tokens → type-check → build to dist/
npm run preview    # serve dist/ locally
```

Needs Node 22.22 or newer (`.node-version` pins 24).

## Make it yours

Everything personal is data, not markup:

| What | Where |
|---|---|
| Name, role, location, time zone, email, availability, nav | `src/data/site.ts` |
| Social links | `socials` in `src/data/site.ts` |
| Rotating prompts + sparkline numbers | `prompts` / `passRates` in `src/data/site.ts` |
| Projects, filters, preview lines, links | `src/data/projects.ts` (`featured: true` shows on the home page; links with `href: "#"` are hidden) |
| Tools / stack, setup card, home-page highlights | `src/data/tools.ts` |
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

## Structure

```
src/
  data/          site content + tokens (edit these)
  pages/         index, projects, tools, tala, 404 (Astro)
  layouts/       Layout.astro: head, header, footer, theme script
  components/    *.astro = static; *.tsx = React islands; ui/ = shadcn
  lib/           theme, toast, contrast helpers
  styles/        global.css (Tailwind + shadcn theme), tokens.css (generated)
scripts/         gen-tokens.ts
public/          favicon, touch icon, robots.txt
render.yaml      Render Blueprint (static site, caching + security headers)
```

## Deploy

Every push to `main` triggers Render to run `npm ci && npm run build` and publish `dist/`. Service settings (publish path, headers, redirects) mirror `render.yaml`.
