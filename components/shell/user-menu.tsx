"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { signOut } from "@/app/(app)/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import type { CurrentUser } from "@/lib/session";

const roleLabels: Record<CurrentUser["role"], string> = {
  admin: "Beheerder",
  coordinator: "Coördinator",
  editor: "Editor",
  viewer: "Kijker",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function UserMenu({ user }: { user: CurrentUser }) {
  const [isSigningOut, startSignOut] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Gebruikersmenu voor ${user.fullName}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold text-muted-foreground transition-[transform,box-shadow] duration-fast ease-standard hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          type="button"
        >
          {initials(user.fullName)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="font-medium text-foreground">{user.fullName}</p>
          <p className="mt-0.5">
            {roleLabels[user.role]}
            {user.email ? ` · ${user.email}` : ""}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <ThemeToggle />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isSigningOut}
          onSelect={(event) => {
            event.preventDefault();
            startSignOut(() => signOut());
          }}
        >
          <LogOut aria-hidden="true" className="size-4" />
          {isSigningOut ? "Bezig met uitloggen…" : "Uitloggen"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
