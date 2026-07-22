/**
 * api/threatIntel.ts
 *
 * Community-sourced scam/threat reports - backend for the "Community
 * Intelligence" feature. Pure Supabase-backed storage, no AI involved:
 * category/severity come from the reporter, not model inference.
 */

import { getThreatReports, insertThreatReport, type NewThreatReport } from "../lib/db/supabase";
import type { ThreatAlert } from "@shared/types";

function toThreatAlert(row: Awaited<ReturnType<typeof getThreatReports>>[number]): ThreatAlert {
  return {
    id: row.id,
    category: row.category as ThreatAlert["category"],
    title: row.title,
    targetAddress: row.targetAddress,
    severity: row.severity as ThreatAlert["severity"],
    timestamp: row.createdAt,
    description: row.description,
    reporter: row.reporter,
    upvotes: row.upvotes,
  };
}

/** Lists community threat reports, most recent first. */
export async function listThreats(): Promise<ThreatAlert[]> {
  const rows = await getThreatReports();
  return rows.map(toThreatAlert);
}

/** Submits a new community threat report. */
export async function submitThreatReport(report: NewThreatReport): Promise<ThreatAlert> {
  const row = await insertThreatReport(report);
  return toThreatAlert(row);
}
