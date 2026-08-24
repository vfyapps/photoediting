"use client";

import Link from "next/link";
import { Images } from "lucide-react";

import { CommandPalette } from "@/components/shell/command-palette";
import { visibleNavItems } from "@/components/shell/nav-config";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { UserMenu } from "@/components/shell/user-menu";
import type { CurrentUser } from "@/lib/session";

// V5 "Studio" (BUILDPLAN-V5 §WP1): donkere chrome-zijbalk draagt logo, zoek/
// command-palette-trigger, navigatie en gebruikersblok. Geen aparte lichte
// header meer — het werkvlak begint direct onder de paginakop van elk scherm.
export function AppShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const items = visibleNavItems(user.role);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-14 shrink-0 flex-col bg-v5-chrome md:w-64">
        <Link
          className="flex items-center gap-2 px-3 py-4 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          href="/"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <Images aria-hidden="true" className="size-4" />
          </span>
          <span className="hidden truncate font-display text-sm font-bold text-v5-chrome-ink md:inline">
            Villa for You
          </span>
        </Link>

        <div className="px-2 pb-2">
          <CommandPalette items={items} />
        </div>

        <SidebarNav items={items} />

        <div className="mt-auto border-t border-white/10 p-2">
          <UserMenu user={user} variant="chrome" />
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
