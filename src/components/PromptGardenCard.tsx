import { useEffect, useMemo, useState } from "react";
import { StarMark } from "./icons";

type Props = {
  prompts: string[];
  /** Pass rate (%) per prompt version, v1 first. */
  passRates: number[];
};

const W = 240;
const H = 64;
const PAD = 6;
const BASE_VERSION = 3; // deltas are shown relative to v3

/** The Tala "sample app" card: a rotating prompt plus an eval sparkline with a version toggle. */
export default function PromptGardenCard({ prompts, passRates }: Props) {
  const latest = passRates.length;
  const [version, setVersion] = useState(latest);
  const [promptIndex, setPromptIndex] = useState(0);
  const [fading, setFading] = useState(false);

  // Rotate the prompt line every 5s with a short fade
  useEffect(() => {
    if (prompts.length < 2) return;
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
  }, [prompts.length]);

  const { points, line, area } = useMemo(() => {
    const min = Math.min(...passRates) - 4;
    const max = Math.max(...passRates) + 2;
    const pts = passRates.map((v, i) => [
      PAD + (i * (W - 2 * PAD)) / Math.max(passRates.length - 1, 1),
      H - PAD - ((v - min) / (max - min)) * (H - 2 * PAD),
    ]);
    const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const area = `M${pts[0][0]},${H - PAD} L${line.replace(/ /g, " L")} L${pts[pts.length - 1][0]},${H - PAD} Z`;
    return { points: pts, line, area };
  }, [passRates]);

  const rate = passRates[version - 1];
  const diff = rate - passRates[BASE_VERSION - 1];
  const [cx, cy] = points[version - 1];

  return (
    <div className="card app">
      <div className="app-top">
        <div className="app-brand">
          <StarMark size={18} />
          Prompt Garden
        </div>
        <div className="seg" role="group" aria-label="Prompt version">
          {[BASE_VERSION, latest].map((v) => (
            <button key={v} type="button" aria-pressed={version === v} onClick={() => setVersion(v)}>
              v{v}
            </button>
          ))}
        </div>
      </div>
      <div className="app-body">
        <div>
          <span className="label">Currently prompting</span>
          <p className="prompt-line" style={{ opacity: fading ? 0 : 1 }}>
            {prompts[promptIndex]}
          </p>
        </div>
        <div className="metrics">
          <div className="metric">
            <div className="k">Eval pass rate</div>
            <div className="v">
              {rate}
              <small>%</small>
            </div>
            <div className="d">{diff ? `+${diff} pts since v${BASE_VERSION}` : "baseline"}</div>
          </div>
          <div className="metric">
            <div className="k">Pass rate by prompt version</div>
            <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
              <line x1="0" x2={W} y1={H - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
              <path d={area} fill="var(--s2)" opacity=".6" />
              <polyline points={line} fill="none" stroke="var(--s5)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              <circle cx={cx} cy={cy} r="3.5" fill="var(--accent)" stroke="var(--s5)" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
