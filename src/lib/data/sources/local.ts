/**
 * The default source: the files in src/data/, committed to git. Edit those files to change the site.
 * Timpla's JSON is regenerated from ../cafe-data by `npm run timpla:data`.
 */
import type { DataSource } from "./types";
import { projects } from "@/data/projects";
import { cv } from "@/data/cv";
import { setup, toolGroups, toolboxHighlights } from "@/data/tools";

const json = (load: () => Promise<{ default: unknown }>) => async () => (await load()).default;

export const local: DataSource = {
  name: "local",
  projects: async () => projects,
  cv: async () => cv,
  tools: async () => ({ setup, toolGroups, toolboxHighlights }),
  timpla: {
    shops: json(() => import("@/data/timpla/shops.json")),
    independents: json(() => import("@/data/timpla/directory.json")),
    points: json(() => import("@/data/timpla/points.json")),
    meta: json(() => import("@/data/timpla/meta.json")),
    timeline: json(() => import("@/data/timpla/timeline.json")),
    provenance: json(() => import("@/data/timpla/provenance.json")),
    ncr: json(() => import("@/data/timpla/ncr.json")),
    osmLayer: json(() => import("@/data/timpla/osm_layer.json")),
  },
};
