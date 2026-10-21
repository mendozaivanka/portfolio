# Tala Rosa Portfolio

Ivanka's portfolio: the **Tala** brand direction (eight-point star mark, *inabel* stripe, Newsreader + Figtree + DM Mono) re-tinted in pastel pink, with components modelled on [shadcn/ui](https://ui.shadcn.com/).

**Stack:** [Astro](https://astro.build) builds the pages, [React](https://react.dev) powers the interactive parts (theme menu, ⌘K command menu, project filters, prompt card, clock, toasts), and the result is a fully static site deployed on [Render](https://render.com).

## Run it locally

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # type-check + build to dist/
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
| Projects, filters, preview lines, links | `src/data/projects.ts` (`featured: true` shows on the home page) |
| Tools / stack, setup card, home-page highlights | `src/data/tools.ts` |
| Bio, hero copy, "how I work" cards | `src/pages/index.astro` |
| Photo | `src/assets/me.jpeg` (Astro resizes and converts it to WebP) |
| Colours (light + dark), components | `src/styles/global.css` |

## Structure

```
src/
  data/          site content (edit these)
  pages/         index, projects, tools, 404 (Astro)
  layouts/       Layout.astro: head, header, footer, theme script
  components/    *.astro = static; *.tsx = React islands
  lib/           theme + toast helpers shared by islands
  styles/        global.css (tokens + components)
public/          favicon
render.yaml      Render Blueprint (static site, caching + security headers)
```

## Palette

| Name | Role | Light |
|---|---|---|
| Kabibe | background | `#fbf6f7` |
| Lalim | text | `#2e1d24` |
| Rosas | primary | `#f4b3c6` (deep rose `#b04a6f` for links and the mark) |
| Mangga | accent | `#f6d49e` |
| Ube | support | `#ddcdf2` |
| Pandan | status | `#cfe9db` |

Dark mode uses a plum palette with the same token names.

## Deploy

Render reads `render.yaml`: push to `main` and it rebuilds (`npm ci && npm run build`) and publishes `dist/`. To set it up the first time: Render dashboard → **New → Blueprint** → pick this repo.
