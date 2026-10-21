import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import StarMark from "./StarMark";

type Props = {
  prompts: string[];
  /** Pass rate (%) per prompt version, v1 first. */
  passRates: number[];
};

const W = 240;
const H = 64;
const PAD = 6;

/** The Tala "sample app" card: a rotating prompt plus an eval sparkline with a version toggle. */
export default function PromptGardenCard({ prompts, passRates }: Props) {
  const latest = passRates.length;
  const base = Math.min(3, latest); // deltas are shown relative to v3 (or the earliest available)
  const [version, setVersion] = useState(latest);
  const [promptIndex, setPromptIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);

  // Rotate the prompt line every 5s with a short fade. Pauses on hover/focus (WCAG 2.2.2)
  // and never starts for visitors who prefer reduced motion.
  useEffect(() => {
    if (prompts.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let fadeTimer: number | undefined;
    const id = window.setInterval(() => {
      setFading(true);
      fadeTimer = window.setTimeout(() => {
        setPromptIndex((i) => (i + 1) % prompts.length);
        setFading(false);
      }, 300);
    }, 5000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(fadeTimer);
    };
  }, [prompts.length, paused]);

  const chart = useMemo(() => {
    if (latest === 0) return null;
    const min = Math.min(...passRates) - 4;
    const max = Math.max(...passRates) + 2; // never equal to min, so no division by zero
    const step = latest > 1 ? (W - 2 * PAD) / (latest - 1) : 0;
    const points = passRates.map((v, i) => [PAD + i * step, H - PAD - ((v - min) / (max - min)) * (H - 2 * PAD)]);
    const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const area = `M${points[0][0]},${H - PAD} L${line.replace(/ /g, " L")} L${points[points.length - 1][0]},${H - PAD} Z`;
    return { points, line, area };
  }, [passRates, latest]);

  if (!chart || prompts.length === 0) return null;

  const rate = passRates[version - 1];
  const diff = rate - passRates[base - 1];
  const [cx, cy] = chart.points[version - 1];
  const versions = base === latest ? [latest] : [base, latest];

  return (
    <Card
      className="gap-0 py-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 font-serif text-[15px] font-semibold">
          <StarMark size={18} />
          Prompt Garden
        </div>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={`v${version}`}
          onValueChange={(v) => v && setVersion(Number(v.slice(1)))}
          aria-label="Prompt version"
          className="no-js:hidden"
        >
          {versions.map((v) => (
            <ToggleGroupItem key={v} value={`v${v}`} className="px-3 font-mono text-xs">
              v{v}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid gap-3.5 p-4">
        <div>
          <span className="label-mono">Currently prompting</span>
          <p
            className="mt-1 min-h-[2.75rem] rounded-md bg-muted px-3 py-2.5 font-mono text-[13px] leading-normal break-words transition-opacity duration-300 before:text-primary-strong before:content-['›_']"
            style={{ opacity: fading ? 0 : 1 }}
            aria-live="off"
          >
            {prompts[promptIndex]}
          </p>
        </div>

        <div className="grid items-end gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <div className="text-xs text-muted-foreground">Eval pass rate</div>
            <div className="font-serif text-4xl leading-[1.1] tabular-nums">
              {rate}
              <small className="text-base text-muted-foreground">%</small>
            </div>
            <div className="font-mono text-xs text-gold-ink">{diff ? `${diff > 0 ? "+" : ""}${diff} pts since v${base}` : "baseline"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Pass rate by prompt version</div>
            <svg
              className="block h-16 w-full"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              role="img"
              aria-label={`Pass rate from ${passRates[0]}% at v1 to ${passRates[latest - 1]}% at v${latest}`}
            >
              <line x1="0" x2={W} y1={H - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
              <path d={chart.area} fill="var(--rosas-2)" opacity=".6" />
              <polyline
                points={chart.line}
                fill="none"
                stroke="var(--rosas-5)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
              />
              <circle cx={cx} cy={cy} r="3.5" fill="var(--gold)" stroke="var(--rosas-5)" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
}
