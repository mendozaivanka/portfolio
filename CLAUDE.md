# tala-portfolio

Astro 7 static site + React 19 islands + shadcn/ui (Tailwind v4). Deployed on Render from `main`. README.md has the details.

- **Content** lives in `src/data/*.ts` (projects, cv, tools, site) and generated `src/data/timpla/*.json`. Pages read it
  only through `@/lib/data` (`await getProjects()` etc.), never by importing data files. New content type → add a
  schema in `src/lib/data/schemas.ts`, a method on `DataSource` (`sources/types.ts`), implement it in every source,
  and a getter in `src/lib/data/index.ts`.
- **New field** on existing content → update the TS type *and* the strict zod schema; `astro check` catches mismatches.
- **Config** comes from the environment (`.env.example` lists all): `SITE_URL`, `DEPLOY_ADAPTER`, `DATA_SOURCE`,
  `DATA_API_URL`, `DATA_API_TOKEN`, `PUBLIC_CHAT_API_URL`. Don't hard-code URLs or hosts.
- **Colours**: edit `src/data/tokens.ts` only; the build fails on WCAG contrast regressions.
- **Timpla data**: regenerate with `npm run timpla:data` (reads `../cafe-data`); don't hand-edit the JSON.
- **CV changed** → `npm run resume:pdf` and commit the regenerated PDF. The phone number stays off the public site.
- Verify with `npm run build` (type-check + content validation + build). Commit/push only when asked.
