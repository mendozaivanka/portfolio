// Exports every piece of site content as JSON, in the exact shape the data layer expects.
// Use it to seed a database or CMS, or to serve as-is for DATA_SOURCE=http (the folder layout matches
// the http source's URLs: projects, cv, tools, timpla/shops, ...).
//
// Run: npm run data:export            (writes data-export/)
//      npm run data:export -- out/dir
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { projects } from "../src/data/projects.ts";
import { cv } from "../src/data/cv.ts";
import { setup, toolGroups, toolboxHighlights } from "../src/data/tools.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.resolve(ROOT, process.argv[2] ?? "data-export");
const TIMPLA = path.join(ROOT, "src", "data", "timpla");

const resources: Record<string, unknown> = {
  projects,
  cv,
  tools: { setup, toolGroups, toolboxHighlights },
};
for (const [url, file] of [
  ["timpla/shops", "shops"], ["timpla/independents", "directory"], ["timpla/points", "points"],
  ["timpla/meta", "meta"], ["timpla/timeline", "timeline"], ["timpla/provenance", "provenance"],
  ["timpla/ncr", "ncr"], ["timpla/osm-layer", "osm_layer"],
]) resources[url] = JSON.parse(readFileSync(path.join(TIMPLA, `${file}.json`), "utf8"));

for (const [url, data] of Object.entries(resources)) {
  const file = path.join(OUT, url);
  mkdirSync(path.dirname(file), { recursive: true });
  // No extension, so a plain static file server answers the same URLs the http source requests
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}
console.log(`exported ${Object.keys(resources).length} resources → ${path.relative(ROOT, OUT)}/`);
