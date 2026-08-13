import type { LucideIcon } from "lucide-react";
import { BarChart3, ClipboardCheck, GraduationCap, LayoutGrid } from "lucide-react";

import type { CurrentUser } from "@/lib/session";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** null = iedereen die is ingelogd. */
  roles: CurrentUser["role"][] | null;
};

// Screens uit AGENTS.md, in de volgorde van het dagelijkse werk: opdrachten
// eerst (waar iedereen start), QC en Dashboard alleen coordinator/admin.
export const navItems: NavItem[] = [
  { href: "/", label: "Opdrachten", icon: LayoutGrid, roles: null },
  { href: "/qc", label: "QC", icon: ClipboardCheck, roles: ["admin", "coordinator"] },
  { href: "/academy", label: "Academy", icon: GraduationCap, roles: null },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3, roles: ["admin", "coordinator"] },
];

export function visibleNavItems(role: CurrentUser["role"]): NavItem[] {
  return navItems.filter((item) => item.roles === null || item.roles.includes(role));
}
