import { useEffect, useRef, useState } from "react";
import { LngLatBounds, MapLibreMap, NavigationControl, Popup, setWorkerUrl, type ExpressionSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// MapLibre renders tiles in a web worker that Vite's dependency pre-bundling separates from the main file;
// point at it explicitly (`?url` serves it in dev and copies it, hashed, into the build).
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import { effectiveTheme, onThemeChange } from "@/lib/theme";
import { cn } from "@/lib/utils";

setWorkerUrl(workerUrl);

/* Basemap: OpenFreeMap (free, no API key), tinted towards Tala Rosa. */
const STYLE = { light: "https://tiles.openfreemap.org/styles/positron", dark: "https://tiles.openfreemap.org/styles/dark" };
const TINT = {
  light: { background: "#fbf6f7", water: "#dfe8f1", park: "#e8efe9", building: "#f3eaed" },
  dark: { background: "#171014", water: "#1e2731", park: "#1f2622", building: "#241b20" },
};
const TIER = {
  light: { acclaimed: "#7a2a49", recognised: "#b04a6f", indie: "#b04a6f", ring: "#ffffff" },
  dark: { acclaimed: "#f2a3bc", recognised: "#b55f80", indie: "#f2a3bc", ring: "#171014" },
};

export type MapPoint = {
  slug: string; name: string; branch: string; tier: "acclaimed" | "recognised" | "indie";
  city: string; nb: string; lon: number; lat: number;
};

type TierFilter = "all" | MapPoint["tier"];
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

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
            features: points.map((p) => ({ type: "Feature", geometry: { type: "Point", coordinates: [p.lon, p.lat] }, properties: p })),
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
        applyFilter(m, tierRef.current);
        if (!center) {
          const b = new LngLatBounds();
          points.forEach((p) => b.extend([p.lon, p.lat]));
          m.fitBounds(b, { padding: 48, duration: 0, maxZoom: 14 });
        }
        m.on("click", "cafes", (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const p = f.properties as unknown as MapPoint;
          new Popup({ offset: 10, maxWidth: "260px" })
            .setLngLat((f.geometry as unknown as { coordinates: [number, number] }).coordinates)
            .setHTML(
              `<div style="font:14px/1.45 Figtree,sans-serif;color:#2e1d24"><b style="font:500 17px Newsreader,serif">${esc(p.name)}</b>` +
                (p.branch ? `<br><span style="color:#6b5a61">${esc(p.branch)}</span>` : "") +
                `<br><span style="color:#6b5a61">${esc([p.nb, p.city].filter(Boolean).join(", "))} · ${esc(p.tier)}</span>` +
                `<br><a href="/timpla/cafes/${esc(p.slug)}/" style="color:#b04a6f;font-weight:600">Open the receipt →</a></div>`,
            )
            .addTo(m);
        });
        m.on("mouseenter", "cafes", () => (m.getCanvas().style.cursor = "pointer"));
        m.on("mouseleave", "cafes", () => (m.getCanvas().style.cursor = ""));
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
}
