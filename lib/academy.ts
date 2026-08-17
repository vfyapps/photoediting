import type { Enums, Tables } from "@/lib/database.types";

export const guidelineTracks = ["onboarding", "goal", "tips"] as const satisfies readonly Enums<"guideline_track">[];
export type GuidelineTrack = (typeof guidelineTracks)[number];

export const trackLabels: Record<GuidelineTrack, string> = {
  onboarding: "Onboarding",
  goal: "Per editing goal",
  tips: "Tips",
};

export const trackDescriptions: Record<GuidelineTrack, string> = {
  onboarding: "Het proces van 1 tot 100, in volgorde. Begin hier als je nieuw bent.",
  goal: "Eén module per editing goal: aanpak, valkuilen, en een goed en fout voorbeeld.",
  tips: "Wat de coördinator tussendoor deelt. Nieuwste eerst.",
};

export function isGuidelineTrack(value: string): value is GuidelineTrack {
  return guidelineTracks.some((track) => track === value);
}

export type GuidelineSummary = {
  id: string;
  slug: string;
  title: string;
  track: GuidelineTrack;
  goalCode: string | null;
  isPublished: boolean;
  origin: "manual" | "qc_suggested";
  sortOrder: number;
  updatedAt: string;
  bodyPreview: string;
};

// Eerste regel body zonder markdown-opmaak, voor de rij-preview op de
// academy-index (BUILDPLAN-V4 §WP6.2). Geen volwaardige markdown-strip nodig
// voor een korte preview — kopregels, nadruk en links zijn de opmaak die in
// de eerste regel van een module daadwerkelijk voorkomt.
function stripMarkdown(value: string): string {
  return value
    .replace(/^#+\s*/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .trim();
}

function bodyPreview(bodyMd: string): string {
  const firstLine = bodyMd.split("\n").find((line) => line.trim().length > 0) ?? "";
  const text = stripMarkdown(firstLine);
  return text.length > 140 ? `${text.slice(0, 140).trimEnd()}…` : text;
}

export function toGuidelineSummary(row: Tables<"guidelines">): GuidelineSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    track: row.track,
    goalCode: row.goal_code,
    isPublished: row.is_published,
    origin: row.origin,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
    bodyPreview: bodyPreview(row.body_md),
  };
}

export type GuidelineDetail = GuidelineSummary & {
  category: string;
  bodyMd: string;
  qcIssueCode: string | null;
};

export function toGuidelineDetail(row: Tables<"guidelines">): GuidelineDetail {
  return {
    ...toGuidelineSummary(row),
    category: row.category,
    bodyMd: row.body_md,
    qcIssueCode: row.qc_issue_code,
  };
}
