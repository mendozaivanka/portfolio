import { useEffect, useRef, useState } from "react";
import { LngLatBounds, MapLibreMap, NavigationControl, Popup, setWorkerUrl, type ExpressionSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// MapLibre renders tiles in a web worker that Vite's dependency pre-bundling separates from the main file;
// point at it explicitly (`?url` serves it in dev and copies it, hashed, into the build).
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import { effectiveTheme, onThemeChange } from "@/lib/theme";
import { cn } from "@/lib/utils";

setWorkerUrl(workerUrl);

/* Basemap: OpenFreeMap (free, no API key), tinted towards the Kape't Gatas palette. */
const STYLE = { light: "https://tiles.openfreemap.org/styles/positron", dark: "https://tiles.openfreemap.org/styles/dark" };
const TINT = {
  light: { background: "#f7f1e9", water: "#dde6ea", park: "#e7ebdf", building: "#efe5d9" },
  dark: { background: "#1a1310", water: "#1c252b", park: "#1f231b", building: "#261d17" },
};
const TIER = {
  light: { acclaimed: "#3b2016", recognised: "#8b4a26", indie: "#8b4a26", ring: "#ffffff" },
  dark: { acclaimed: "#f0c9a4", recognised: "#b9774c", indie: "#f0c9a4", ring: "#1a1310" },
};

export type MapPoint = {
  slug: string; name: string; branch: string; tier: "acclaimed" | "recognised" | "indie";
  city: string; nb: string; lon: number; lat: number; beans?: string; since?: string;
};

type TierFilter = "all" | MapPoint["tier"];
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The details card shown on hover (no link) and on click/tap (with the link). */
function cardHtml(p: MapPoint, withLink: boolean) {
  const row = (k: string, v: string) =>
    v ? `<div style="display:flex;justify-content:space-between;gap:12px"><span style="color:#6f6066">${k}</span><span style="text-align:right">${esc(v)}</span></div>` : "";
  const rule = `<div style="border-top:1.5px dashed #d9cfd2;margin:6px 0"></div>`;
  return (
    `<div style="font:13px/1.5 'DM Mono',monospace;color:#2b2226;min-width:200px">` +
    `<div style="font:500 18px/1.2 Newsreader,serif;margin-bottom:2px">${esc(p.name)}</div>` +
    (p.branch ? `<div style="font:13px Figtree,sans-serif;color:#6f6066">${esc(p.branch)}</div>` : "") +
    rule +
    row("WHERE", [p.nb, p.city].filter((x, i, a) => x && a.indexOf(x) === i).join(", ")) +
    row("SINCE", p.since || "") +
    row("BEANS", p.beans || "") +
    row("TIER", p.tier) +
    (withLink ? rule + `<a href="/timpla/cafes/${esc(p.slug)}/" style="font:600 14px Figtree,sans-serif;color:#8b4a26">Open the receipt →</a>` : "") +
    `</div>`
  );
}

export default function CafeMap({ points }: { points: MapPoint[] }) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [tier, setTier] = useState<TierFilter>("all");
  const tierRef = useRef<TierFilter>("all");
  tierRef.current = tier;

  // Build (and rebuild on theme change) the map
  useEffect(() => {
    if (!box.current) return;
    let map: MapLibreMap | null = null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const build = () => {
      const scheme = effectiveTheme();
      const center = map?.getCenter();
      const zoom = map?.getZoom();
      map?.remove();
      map = new MapLibreMap({
        container: box.current!,
        style: STYLE[scheme],
        center: center ?? [121.03, 14.57],
        zoom: zoom ?? 11,
        maxZoom: 17,
        attributionControl: { compact: true },
        cooperativeGestures: window.matchMedia("(pointer: coarse)").matches,
      });
      mapRef.current = map;
      map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
      map.on("load", () => {
        const m = map!;
        const t = TINT[scheme];
        for (const [layer, prop, value] of [
          ["background", "background-color", t.background],
          ["water", "fill-color", t.water],
          ["park", "fill-color", t.park],
          ["building", "fill-color", t.building],
        ] as const) if (m.getLayer(layer)) m.setPaintProperty(layer, prop, value);

        const c = TIER[scheme];
        m.addSource("cafes", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: points.map((p) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [p.lon, p.lat] },
              // Short label for the map; the hover card keeps the full name
              properties: { ...p, label: p.name.replace(/\s*\(.*?\)\s*/g, " ").trim() },
            })),
          },
        });
        m.addLayer({
          id: "cafes",
          type: "circle",
          source: "cafes",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 4, 15, 8],
            "circle-color": ["match", ["get", "tier"], "acclaimed", c.acclaimed, "recognised", c.recognised, c.ring],
            "circle-stroke-color": ["match", ["get", "tier"], "indie", c.indie, c.ring],
            "circle-stroke-width": ["match", ["get", "tier"], "indie", 2.2, 1.5],
          },
        });
        // Café names beside the dots. MapLibre hides labels that would collide, so more appear as you zoom in;
        // acclaimed cafés get first claim on the space.
        m.addLayer({
          id: "cafe-labels",
          type: "symbol",
          source: "cafes",
          layout: {
            "text-field": ["get", "label"],
            "text-font": ["Noto Sans Regular"],
            "text-size": ["interpolate", ["linear"], ["zoom"], 10, 11, 15, 13],
            "text-anchor": "left",
            "text-offset": [0.75, 0],
            "text-max-width": 9,
            "text-optional": true,
            "symbol-sort-key": ["match", ["get", "tier"], "acclaimed", 0, "recognised", 1, 2],
          },
          paint: {
            "text-color": scheme === "dark" ? "#f3e9df" : "#2b1d16",
            "text-halo-color": scheme === "dark" ? "#1a1310" : "#fffdf9",
            "text-halo-width": 1.6,
          },
        });
        applyFilter(m, tierRef.current);
        if (!center) {
          const b = new LngLatBounds();
          points.forEach((p) => b.extend([p.lon, p.lat]));
          m.fitBounds(b, { padding: 48, duration: 0, maxZoom: 14 });
        }
        // Hover (mouse): a light card with the details follows the pointer.
        // Click / tap (and touch screens): the card stays, with a link to the café's page.
        const hover = new Popup({ offset: 12, maxWidth: "280px", closeButton: false, closeOnClick: false });
        const coordsOf = (f: { geometry: unknown }) => (f.geometry as { coordinates: [number, number] }).coordinates;
        for (const layer of ["cafes", "cafe-labels"]) {
          m.on("mousemove", layer, (e) => {
            const f = e.features?.[0];
            if (!f) return;
            m.getCanvas().style.cursor = "pointer";
            hover.setLngLat(coordsOf(f)).setHTML(cardHtml(f.properties as unknown as MapPoint, false)).addTo(m);
          });
          m.on("mouseleave", layer, () => {
            m.getCanvas().style.cursor = "";
            hover.remove();
          });
          m.on("click", layer, (e) => {
            const f = e.features?.[0];
            if (!f) return;
            hover.remove();
            new Popup({ offset: 12, maxWidth: "280px" }).setLngLat(coordsOf(f)).setHTML(cardHtml(f.properties as unknown as MapPoint, true)).addTo(m);
          });
        }
      });
      if (reduced) map.on("load", () => map?.jumpTo({ center: map.getCenter() }));
    };

    build();
    const off = onThemeChange(build);
    return () => {
      off();
      map?.remove();
      mapRef.current = null;
    };
  }, [points]);

  // Tier filter: setFilter, no re-render of the map
  useEffect(() => {
    const m = mapRef.current;
    if (m?.getLayer("cafes")) applyFilter(m, tier);
  }, [tier]);

  const count = tier === "all" ? points.length : points.filter((p) => p.tier === tier).length;

  return (
    <div className="grid gap-3">
      <div role="group" aria-label="Filter by tier" className="flex flex-wrap items-center gap-2">
        {(["all", "acclaimed", "recognised", "indie"] as TierFilter[]).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tier === t}
            onClick={() => setTier(t)}
            className={cn(
              "min-h-11 rounded-full border px-4 text-sm font-medium capitalize transition-colors",
              tier === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
            )}
          >
            {t === "all" ? "All tiers" : t}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-muted-foreground" aria-live="polite">{count} branches on the map</span>
      </div>
      <div
        ref={box}
        className="h-[min(70dvh,640px)] min-h-[380px] overflow-hidden rounded-2xl border border-border bg-muted"
        role="region"
        aria-label="Interactive map of specialty cafés. The café directory has the same places as a list."
      />
    </div>
  );
}

function applyFilter(m: MapLibreMap, tier: TierFilter) {
  const f: ExpressionSpecification | null = tier === "all" ? null : ["==", ["get", "tier"], tier];
  m.setFilter("cafes", f);
  if (m.getLayer("cafe-labels")) m.setFilter("cafe-labels", f);
}
