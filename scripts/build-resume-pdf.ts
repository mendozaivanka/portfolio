// Prints the /resume/ page to a PDF, so the downloadable résumé always matches src/data/cv.ts.
//
// Run after changing the CV:   npm run resume:pdf
// It builds the site, serves dist/ locally, prints /resume/ with headless Chromium and writes the PDF to the path in
// cv.profile.pdf (under public/, so it ships with the next deploy). Commit the PDF: the host's build doesn't run this.
// First time only: `npx playwright install chromium` (free, downloads a local browser).
import { createReadStream, existsSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { cv } from "../src/data/cv.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
if (!cv.profile.pdf) throw new Error("cv.profile.pdf is null: set a path like /Ivanka-Mendoza-Resume.pdf first");
const OUT = path.join(ROOT, "public", cv.profile.pdf);

if (!process.argv.includes("--no-build")) execSync("npm run build", { cwd: ROOT, stdio: "inherit" });

const TYPES: Record<string, string> = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png", ".jpg": "image/jpeg",
};
const server = createServer((req, res) => {
  let file = path.join(DIST, decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname));
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!file.startsWith(DIST) || !existsSync(file)) return void res.writeHead(404).end();
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
});
await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
const port = (server.address() as { port: number }).port;

const browser = await chromium.launch().catch((e) => {
  server.close();
  throw new Error(`No Chromium found. Run \`npx playwright install chromium\` once, then try again.\n${e}`);
});
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/resume/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
  writeFileSync(OUT, pdf);
  // Also drop it into this build's output, so `npm run preview` serves the new file straight away
  writeFileSync(path.join(DIST, cv.profile.pdf), pdf);
  console.log(`resume: wrote ${path.relative(ROOT, OUT)} (${Math.round(pdf.length / 1024)} KB)`);
} finally {
  await browser.close();
  server.close();
}
