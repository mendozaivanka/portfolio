import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { getMode, onThemeChange, setMode, type ThemeMode } from "../lib/theme";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

const OPTIONS = [
  { mode: "light", label: "Light", Icon: SunIcon },
  { mode: "dark", label: "Dark", Icon: MoonIcon },
  { mode: "system", label: "System", Icon: MonitorIcon },
] as const satisfies readonly { mode: ThemeMode; label: string; Icon: unknown }[];

/** shadcn-style mode toggle: an icon button that opens a Light / Dark / System menu. */
export default function ThemeMenu() {
  const [open, setOpen] = useState(false);
  const [mode, setModeState] = useState<ThemeMode>("system");
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setModeState(getMode());
    return onThemeChange(setModeState);
  }, []);

  useEffect(() => {
    if (!open) return;
    const current = OPTIONS.findIndex((o) => o.mode === getMode());
    itemRefs.current[Math.max(current, 0)]?.focus();

    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onMenuKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[next]?.focus();
  }

  function choose(m: ThemeMode) {
    setMode(m);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div className="menu-wrap" ref={wrapRef}>
      <button
        ref={buttonRef}
        className="btn btn-ghost btn-icon"
        type="button"
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="themeMenu"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Which icon shows is decided by CSS, so it's right before hydration too */}
        <SunIcon className="i-sun" size={17} />
        <MoonIcon className="i-moon" size={17} />
      </button>
      <div className="menu" id="themeMenu" role="menu" aria-label="Theme" hidden={!open} onKeyDown={onMenuKeyDown}>
        {OPTIONS.map(({ mode: m, label, Icon }, i) => (
          <button
            key={m}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            type="button"
            role="menuitemradio"
            aria-checked={mode === m}
            onClick={() => choose(m)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
