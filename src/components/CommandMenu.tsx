import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { setMode } from "../lib/theme";
import { copyText } from "../lib/toast";
import { ArrowUpRightIcon, CopyIcon, HashIcon, MonitorIcon, MoonIcon, PageIcon, SearchIcon, SunIcon } from "./icons";

type Command = {
  group: string;
  label: string;
  icon: ReactNode;
  href?: string;
  external?: boolean;
  run?: () => void;
};

type Props = {
  email: string;
  links: { name: string; href: string }[];
};

/** shadcn Command + Dialog: search trigger in the header, opens with ⌘K / Ctrl+K. */
export default function CommandMenu({ email, links }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const commands = useMemo<Command[]>(
    () => [
      { group: "Pages", label: "Home", icon: <PageIcon />, href: "/" },
      { group: "Pages", label: "Projects", icon: <PageIcon />, href: "/projects/" },
      { group: "Pages", label: "Tools", icon: <PageIcon />, href: "/tools/" },
      { group: "Sections", label: "About me", icon: <HashIcon />, href: "/#about" },
      { group: "Sections", label: "Contact", icon: <HashIcon />, href: "/#contact" },
      { group: "Actions", label: "Copy email address", icon: <CopyIcon strokeWidth={1.8} />, run: () => copyText(email) },
      { group: "Theme", label: "Light mode", icon: <SunIcon />, run: () => setMode("light") },
      { group: "Theme", label: "Dark mode", icon: <MoonIcon />, run: () => setMode("dark") },
      { group: "Theme", label: "Follow system theme", icon: <MonitorIcon />, run: () => setMode("system") },
      ...links.map((l) => ({ group: "Links", label: l.name, icon: <ArrowUpRightIcon />, href: l.href, external: true })),
    ],
    [email, links],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
  }, [commands, query]);

  const open = useCallback(() => {
    setQuery("");
    setActive(0);
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }, []);

  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Keep the highlighted row in view
  useEffect(() => {
    listRef.current?.querySelector(`#cmd-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function run(c: Command | undefined) {
    if (!c) return;
    close();
    if (c.run) return c.run();
    if (c.external) window.open(c.href, "_blank", "noopener");
    else if (c.href) window.location.href = c.href;
  }

  function onInputKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    }
  }

  // Render grouped rows, keeping a flat index for keyboard navigation
  const rows: ReactNode[] = [];
  let lastGroup = "";
  results.forEach((c, i) => {
    if (c.group !== lastGroup) {
      lastGroup = c.group;
      rows.push(
        <li key={`g-${c.group}`} className="cmd-group label" role="presentation">
          {c.group}
        </li>,
      );
    }
    rows.push(
      <li
        key={`${c.group}-${c.label}`}
        id={`cmd-${i}`}
        className="cmd-item"
        role="option"
        aria-selected={i === active}
        onClick={() => run(c)}
        onMouseMove={() => i !== active && setActive(i)}
      >
        {c.icon}
        {c.label}
      </li>,
    );
  });

  return (
    <>
      <button className="search-trigger" type="button" aria-label="Open command menu" onClick={open}>
        <SearchIcon size={15} />
        <span>Search…</span>
        <kbd className="kbd">⌘K</kbd>
      </button>

      <dialog
        ref={dialogRef}
        className="cmd"
        aria-label="Command menu"
        // Clicking the backdrop (the dialog element itself) closes it
        onClick={(e) => e.target === dialogRef.current && close()}
      >
        <div className="cmd-input-row">
          <SearchIcon />
          <input
            ref={inputRef}
            className="cmd-input"
            type="text"
            placeholder="Type a command or search…"
            autoComplete="off"
            role="combobox"
            aria-controls="cmdList"
            aria-expanded="true"
            aria-activedescendant={results.length ? `cmd-${active}` : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
          />
          <kbd className="kbd">esc</kbd>
        </div>
        <ul ref={listRef} className="cmd-list" id="cmdList" role="listbox">
          {results.length ? rows : <li className="cmd-empty">No results found.</li>}
        </ul>
        <div className="cmd-foot">
          <span>
            <kbd className="kbd">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="kbd">↵</kbd> select
          </span>
        </div>
      </dialog>
    </>
  );
}
