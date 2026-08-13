import { NextResponse } from "next/server";

import { rowsToCsv } from "@/lib/csv";
import { createClient } from "@/lib/supabase/server";

// Vaste whitelist — nooit een clientgestuurde tabelnaam direct doorgeven aan
// .from(), ook niet als de invoer er onschuldig uitziet.
const exportableViews = {
  status: "v_dashboard_status",
  editors: "v_editor_performance",
  goals: "v_goal_usage",
  volume: "v_monthly_volume",
  completed: "v_monthly_completed",
  issues: "v_qc_issue_frequency",
} as const;

type ExportKey = keyof typeof exportableViews;

function isExportKey(value: string | null): value is ExportKey {
  return value !== null && value in exportableViews;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");

  if (!isExportKey(view)) {
    return NextResponse.json(
      { error: `Ongeldige view. Kies uit: ${Object.keys(exportableViews).join(", ")}.` },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from(exportableViews[view]).select("*");

  if (error) {
    // RLS is de echte grens hier: een editor die deze route direct aanroept
    // met view=editors krijgt via v_editor_performance sowieso alleen de
    // eigen rij terug (AGENTS.md, schemawijziging 5) — dit is dus geen
    // aparte autorisatiecheck, alleen nette foutafhandeling.
    return NextResponse.json({ error: "Export mislukt." }, { status: 500 });
  }

  const csv = rowsToCsv(data ?? []);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportableViews[view]}.csv"`,
    },
  });
}
