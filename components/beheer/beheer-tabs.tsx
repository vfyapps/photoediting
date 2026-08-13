"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/beheer/gebruikers", label: "Gebruikers" },
  { href: "/beheer/editors", label: "Editors & experts" },
  { href: "/beheer/instellingen", label: "Instellingen" },
  { href: "/beheer/referentiedata", label: "Referentiedata" },
];

export function BeheerTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader description="Accounts, editors, verhuurexperts en de instellingen die de app stuurt." eyebrow="Beheer" title="Beheer" />
      <nav aria-label="Beheer-onderdelen" className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
              href={tab.href}
              key={tab.href}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
