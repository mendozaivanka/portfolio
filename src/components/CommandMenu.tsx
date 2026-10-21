import { useEffect, useState } from "react";
import { ArrowUpRightIcon, CopyIcon, FileTextIcon, HashIcon, MonitorIcon, MoonIcon, SearchIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { setMode } from "@/lib/theme";
import { copyText } from "@/lib/toast";

type Props = {
  email: string;
  pages: { label: string; href: string }[];
  links: { name: string; href: string }[];
};

/** shadcn Command in a Dialog: the header search button, also opened with ⌘K / Ctrl+K. */
export default function CommandMenu({ email, pages, links }: Props) {
  const [open, setOpen] = useState(false);
  const [modKey, setModKey] = useState("⌘"); // set after mount to avoid a hydration mismatch

  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform)) setModKey("Ctrl");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close first so the dialog doesn't linger over the next page / action
  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  const go = (href: string) => run(() => window.location.assign(href));
  const openExternal = (href: string) => run(() => window.open(href, "_blank", "noopener"));

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
        className="h-9 w-9 justify-center px-0 text-muted-foreground max-[400px]:hidden sm:w-56 sm:justify-start sm:px-3 no-js:hidden"
      >
        <SearchIcon />
        <span className="hidden sm:inline">Search…</span>
        <Kbd className="ml-auto hidden sm:inline-flex">{modKey} K</Kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Command menu" description="Search pages and actions">
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={go("/")} keywords={["home", "start"]}>
              <FileTextIcon /> Home
            </CommandItem>
            {pages.map((p) => (
              <CommandItem key={p.href} onSelect={go(p.href)} keywords={["page"]}>
                {p.href.includes("#") ? <HashIcon /> : <FileTextIcon />} {p.label}
              </CommandItem>
            ))}
            <CommandItem onSelect={go("/#about")} keywords={["bio", "section"]}>
              <HashIcon /> About me
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={run(() => copyText(email))} keywords={["clipboard", "mail"]}>
              <CopyIcon /> Copy email address
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Theme">
            <CommandItem onSelect={run(() => setMode("light"))}>
              <SunIcon /> Light mode
            </CommandItem>
            <CommandItem onSelect={run(() => setMode("dark"))}>
              <MoonIcon /> Dark mode
            </CommandItem>
            <CommandItem onSelect={run(() => setMode("system"))}>
              <MonitorIcon /> Follow system theme
            </CommandItem>
          </CommandGroup>
          {links.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Links">
                {links.map((l) => (
                  <CommandItem key={l.href} onSelect={openExternal(l.href)} keywords={["social", "profile"]}>
                    <ArrowUpRightIcon /> {l.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
