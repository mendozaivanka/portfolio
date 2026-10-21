import shopsJson from "@/data/timpla/shops.json";
import type { BranchRow } from "@/components/timpla/BranchList";

export type Branch = {
  name: string; neighbourhood: string; city: string; address: string;
  lat: number | null; lon: number | null; coordSource: string;
};
export type Shop = {
  slug: string; name: string; tier: "acclaimed" | "recognised" | "indie"; type: string; ownership: string;
  beans: string; since: string; endorsements: number; sources: { outlet: string; url: string }[];
  signals: string[]; specialty: string; status: string; website: string; instagram: string; branches: Branch[];
};

export const shops = shopsJson as Shop[];

export const TIER_TEXT: Record<Shop["tier"], string> = {
  acclaimed: "2+ independent write-ups, or an award",
  recognised: "1 write-up, roaster pedigree, or a festival / stockist listing",
  indie: "specialty and open, no press yet",
};

/** Short "Legazpi Village, Makati" from a branch, never repeating the city. */
export const whereOf = (b: Pick<Branch, "neighbourhood" | "city">) =>
  [b.neighbourhood?.trim(), b.city].filter((x, i, a) => x && a.indexOf(x) === i && !(i === 0 && x === a[1])).join(", ");

/** Shorten long evidence strings for list rows. */
export const shortBeans = (s: string) => {
  const t = s.split(/[;(]/)[0].trim();
  return t.length > 42 ? t.slice(0, 40).trimEnd() + "…" : t;
};

/** One row per branch, best tier first, then most written-about. */
export const branchRows: BranchRow[] = shops.flatMap((s) =>
  s.branches.map((b) => ({
    slug: s.slug,
    name: s.name,
    branch: s.branches.length > 1 ? b.name : "",
    tier: s.tier,
    where: whereOf(b),
    city: b.city,
    beans: shortBeans(s.beans),
    since: s.since,
  })),
);

export const instagramUrl = (h: string) => {
  const handle = h.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*/, "").trim();
  return handle ? { handle, url: `https://www.instagram.com/${handle}/` } : null;
};
