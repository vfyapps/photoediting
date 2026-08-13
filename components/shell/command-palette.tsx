"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Laptop, Moon, Search, Sun } from "lucide-react";

import { type PaletteAssignment, searchAssignments } from "@/app/(app)/actions";
import type { NavItem } from "@/components/shell/nav-config";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { applyTheme } from "@/lib/theme";

export function CommandPalette({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PaletteAssignment[]>([]);
  const [isSearching, startSearch] = useTransition();
  const router = useRouter();
  const requestId = useRef(0);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Effect subscribeert alleen op de externe timer; het opruimen van
  // resultaten bij een korte/lege query gebeurt hieronder bij het renderen
  // (queryIsSearchable), niet met een synchrone setState in het effect.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    const id = ++requestId.current;
    const timeout = setTimeout(() => {
      startSearch(async () => {
        const found = await searchAssignments(trimmed);
        if (id === requestId.current) setResults(found);
      });
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const queryIsSearchable = query.trim().length >= 2;
  const visibleResults = queryIsSearchable ? results : [];

  function go(href: string) {
    handleOpenChange(false);
    router.push(href);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setQuery("");
      setResults([]);
    }
  }

  return (
    <>
      <button
        aria-label="Open command palette"
        className="flex h-9 w-full max-w-64 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition-[transform,box-shadow] duration-fast ease-standard hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        onClick={() => handleOpenChange(true)}
        type="button"
      >
        <Search aria-hidden="true" className="size-4" />
        <span className="flex-1 truncate text-left">Zoeken of navigeren…</span>
        <kbd className="hidden rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
          Ctrl K
        </kbd>
      </button>
      <CommandDialog label="Command palette" onOpenChange={handleOpenChange} open={open} shouldFilter={false}>
        <CommandInput
          onValueChange={setQuery}
          placeholder="Zoek op acco ID, of typ een schermnaam…"
          value={query}
        />
        <CommandList>
          {queryIsSearchable ? (
            <>
              {!isSearching && visibleResults.length === 0 ? (
                <CommandEmpty>Geen opdrachten gevonden voor &ldquo;{query}&rdquo;.</CommandEmpty>
              ) : null}
              {visibleResults.length > 0 ? (
                <CommandGroup heading="Opdrachten">
                  {visibleResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => go(`/?q=${encodeURIComponent(result.accoId)}`)}
                      value={result.id}
                    >
                      <span className="font-mono text-xs">{result.accoId}</span>
                      <span className="text-xs text-muted-foreground">{result.status}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
            </>
          ) : (
            <>
              <CommandGroup heading="Schermen">
                {items.map((item) => (
                  <CommandItem key={item.href} onSelect={() => go(item.href)} value={item.href}>
                    <item.icon aria-hidden="true" className="size-4 text-muted-foreground" />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Thema">
                <CommandItem onSelect={() => applyTheme("light")} value="thema-licht">
                  <Sun aria-hidden="true" className="size-4 text-muted-foreground" />
                  Licht
                </CommandItem>
                <CommandItem onSelect={() => applyTheme("dark")} value="thema-donker">
                  <Moon aria-hidden="true" className="size-4 text-muted-foreground" />
                  Donker
                </CommandItem>
                <CommandItem onSelect={() => applyTheme("system")} value="thema-systeem">
                  <Laptop aria-hidden="true" className="size-4 text-muted-foreground" />
                  Systeem
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
