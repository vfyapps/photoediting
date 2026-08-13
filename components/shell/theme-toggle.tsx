"use client";

import { useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";

import { applyTheme, getStoredTheme, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Licht", icon: Sun },
  { value: "dark", label: "Donker", icon: Moon },
  { value: "system", label: "Systeem", icon: Laptop },
];

export function ThemeToggle() {
  // Lazy initializer i.p.v. effect: dit component is altijd client-side
  // gemount (het staat in een dropdown), dus localStorage is beschikbaar
  // bij de eerste render en er is geen cascaderende setState nodig.
  const [preference, setPreference] = useState<ThemePreference>(getStoredTheme);

  function select(value: ThemePreference) {
    setPreference(value);
    applyTheme(value);
  }

  return (
    <div
      aria-label="Thema"
      className="grid grid-cols-3 gap-0.5 rounded-md bg-muted p-0.5"
      role="radiogroup"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const selected = preference === option.value;
        return (
          <button
            aria-checked={selected}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-medium transition-[transform,box-shadow] duration-fast ease-standard",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
              selected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            key={option.value}
            onClick={() => select(option.value)}
            role="radio"
            type="button"
          >
            <Icon aria-hidden="true" className="size-3.5" />
            <span className="sr-only sm:not-sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
