"use client";

import Link from "next/link";
import { Images } from "lucide-react";

import { CommandPalette } from "@/components/shell/command-palette";
import { visibleNavItems } from "@/components/shell/nav-config";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { UserMenu } from "@/components/shell/user-menu";
import type { CurrentUser } from "@/lib/session";

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
      <aside className="flex w-14 shrink-0 flex-col border-r border-border bg-card md:w-56">
        <Link
          className="flex items-center gap-2 border-b border-border px-3 py-4 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          href="/"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <Images aria-hidden="true" className="size-4" />
          </span>
          <span className="hidden truncate font-display text-sm font-bold md:inline">
            VfY Fotobewerking
          </span>
        </Link>
        <SidebarNav items={items} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-2.5">
          <div className="max-w-64 flex-1">
            <CommandPalette items={items} />
          </div>
          <div className="ml-auto">
            <UserMenu user={user} />
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
