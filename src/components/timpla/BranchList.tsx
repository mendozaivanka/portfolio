import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type BranchRow = {
  slug: string;
  name: string;
  branch: string;
  tier: "acclaimed" | "recognised" | "indie";
  where: string;
  city: string;
  beans: string;
  since: string;
};

type Tier = "all" | BranchRow["tier"];
const TIERS: { id: Tier; label: string }[] = [
  { id: "all", label: "All" },
  { id: "acclaimed", label: "Acclaimed" },
  { id: "recognised", label: "Recognised" },
  { id: "indie", label: "Indie" },
];

type Props = {
  rows: BranchRow[];
  /** Show only the first N rows (home page); the directory shows everything. */
  limit?: number;
  /** Directory mode: adds search and a city filter. */
  full?: boolean;
};

/** The branch list with tier filter (from design B, in A's typography). */
export default function BranchList({ rows, limit, full = false }: Props) {
  const [tier, setTier] = useState<Tier>("all");
  const [city, setCity] = useState("all");
  const [q, setQ] = useState("");

  const cities = useMemo(() => [...new Set(rows.map((r) => r.city).filter(Boolean))].sort(), [rows]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (tier === "all" || r.tier === tier) &&
        (city === "all" || r.city === city) &&
        (!needle || `${r.name} ${r.branch} ${r.where} ${r.beans}`.toLowerCase().includes(needle)),
    );
  }, [rows, tier, city, q]);
  // Preview mode (home page): one row per café, so a multi-branch shop doesn't fill the list
  const shown = limit
    ? filtered.filter((r, i, a) => a.findIndex((x) => x.slug === r.slug) === i).slice(0, limit)
    : filtered;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Filter by tier" className="flex flex-wrap gap-2">
          {TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tier === t.id}
              onClick={() => setTier(t.id)}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm font-medium transition-colors",
                tier === t.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {full && (
          <>
            <label className="sr-only" htmlFor="branch-city">City</label>
            <select
              id="branch-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="min-h-11 rounded-full border border-border bg-card px-4 text-sm"
            >
              <option value="all">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="branch-q">Search</label>
            <input
              id="branch-q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cafés, roasters, places"
              className="min-h-11 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-sm sm:max-w-xs"
            />
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <p className="m-0 border-b border-dashed border-border px-5 py-3 font-mono text-xs text-muted-foreground" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "branch" : "branches"}
          {limit && filtered.length > limit ? `, showing ${shown.length} cafés` : ""}
        </p>
        <ul className="m-0 list-none p-0">
          {shown.map((r) => (
            <li key={`${r.slug}-${r.branch}`} className="border-b border-dashed border-border last:border-b-0">
              <a href={`/timpla/cafes/${r.slug}/`} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-muted/60">
                <span className="tier-dot" data-tier={r.tier} title={r.tier} />
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-[19px] leading-snug">
                    {r.name}
                    {r.branch && <span className="text-muted-foreground"> · {r.branch}</span>}
                  </span>
                  <span className="block truncate text-[13px] text-muted-foreground">
                    {r.where}
                    {r.beans && ` · ${r.beans}`}
                  </span>
                </span>
                <span className="shrink-0 text-right font-mono text-xs text-muted-foreground">
                  {r.since ? <>since<br />{r.since}</> : "—"}
                </span>
              </a>
            </li>
          ))}
          {shown.length === 0 && <li className="px-5 py-6 text-muted-foreground">No branches match.</li>}
        </ul>
        {limit && (
          <a href="/timpla/cafes/" className="block border-t border-dashed border-border px-5 py-3.5 font-semibold text-primary-strong">
            See all {rows.length} branches →
          </a>
        )}
      </div>
    </div>
  );
}
