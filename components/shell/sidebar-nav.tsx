"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItem } from "@/components/shell/nav-config";
import { cn } from "@/lib/utils";

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Hoofdnavigatie" className="flex flex-col gap-0.5 p-2">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-[transform,box-shadow] duration-fast ease-standard",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
            href={item.href}
            key={item.href}
            title={item.label}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            {/* Onder md alleen het icoon: de navigatie klapt in tot iconen op tablet/mobiel. */}
            <span className="hidden truncate md:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
