/**
 * lib/db/supabase.ts
 *
 * Supabase client + typed queries.
 *
 * Three tables in use:
 *   - watched_pairs - token/spender pairs to check wallet approvals
 *     against, used by api/walletHealth.ts (replaces the old hardcoded
 *     WATCHED_PAIRS array).
 *   - auth_nonces - single-use, expiring nonces for wallet-signature
 *     authentication, used by lib/okx/walletSdk.ts to prevent signature
 *     replay attacks.
 *   - threat_reports - community-submitted scam reports, used by
 *     api/threatIntel.ts.
 *
 * Requires SUPABASE_URL and SUPABASE_ANON_KEY in .env.local.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import type { Address } from "viem";

let client: SupabaseClient | null = null;

// Accepts any of: SUPABASE_ANON_KEY (legacy JWT-based anon key),
// SUPABASE_API_KEY (an earlier rename in this project's .env), or
// SUPABASE_API (Supabase's newer "publishable" key format, sb_publishable_...).
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_API_KEY ?? process.env.SUPABASE_API;

/** Returns a singleton Supabase client. */
export function getSupabaseClient(): SupabaseClient {
  if (!process.env.SUPABASE_URL || !supabaseKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_API_KEY / SUPABASE_API) must be set in backend/.env.local"
    );
  }
  if (!client) {
    client = createClient(process.env.SUPABASE_URL, supabaseKey);
  }
  return client;
}

// ---------------------------------------------------------------------------
// watched_pairs table
// ---------------------------------------------------------------------------
//
// Schema (create in Supabase SQL editor):
//
// create table watched_pairs (
//   id uuid primary key default gen_random_uuid(),
//   token_address text not null,
//   spender_address text not null,
//   label text not null,
//   created_at timestamptz default now()
// );

export interface WatchedPair {
  token: Address;
  spender: Address;
  label: string;
}

/**
 * Fetches the current watchlist of token/spender pairs to check wallet
 * approvals against. Used by api/walletHealth.ts.
 */
export async function getWatchedPairs(): Promise<WatchedPair[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("watched_pairs")
    .select("token_address, spender_address, label");

  if (error) {
    throw new Error(`Failed to fetch watched pairs: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    token: row.token_address as Address,
    spender: row.spender_address as Address,
    label: row.label,
  }));
}

/**
 * Adds a new token/spender pair to the watchlist. Used for the
 * "Community Intelligence" feature - flagging newly discovered risky
 * spenders without a redeploy.
 */
export async function addWatchedPair(pair: WatchedPair): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("watched_pairs").insert({
    token_address: pair.token,
    spender_address: pair.spender,
    label: pair.label,
  });

  if (error) {
    throw new Error(`Failed to add watched pair: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// auth_nonces table
// ---------------------------------------------------------------------------
//
// Schema (create in Supabase SQL editor):
//
// create table auth_nonces (
//   nonce text primary key,
//   address text not null,
//   used boolean not null default false,
//   expires_at timestamptz not null,
//   created_at timestamptz default now()
// );

const NONCE_TTL_MINUTES = 5;

/**
 * Generates and stores a fresh nonce for a wallet address, to be embedded
 * in the message the user signs. Expires after NONCE_TTL_MINUTES.
 * Used by lib/okx/walletSdk.ts's startWalletAuth().
 */
export async function createNonce(address: string): Promise<string> {
  const supabase = getSupabaseClient();
  const nonce = randomUUID();
  const expiresAt = new Date(
    Date.now() + NONCE_TTL_MINUTES * 60 * 1000
  ).toISOString();

  const { error } = await supabase.from("auth_nonces").insert({
    nonce,
    address,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(`Failed to create nonce: ${error.message}`);
  }

  return nonce;
}

/**
 * Validates a nonce: must exist, match the claimed address, be unused,
 * and not be expired. Marks it used atomically on success so it can never
 * be replayed - a signature captured once can't be reused for a second
 * "session." Used by lib/okx/walletSdk.ts's verifyWalletSignature().
 */
export async function consumeNonce(
  nonce: string,
  address: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("auth_nonces")
    .select("address, used, expires_at")
    .eq("nonce", nonce)
    .single();

  if (error || !data) return false;
  if (data.used) return false;
  if (data.address.toLowerCase() !== address.toLowerCase()) return false;
  if (new Date(data.expires_at) < new Date()) return false;

  const { error: updateError } = await supabase
    .from("auth_nonces")
    .update({ used: true })
    .eq("nonce", nonce);

  return !updateError;
}

// ---------------------------------------------------------------------------
// threat_reports table
// ---------------------------------------------------------------------------
//
// Schema (create in Supabase SQL editor):
//
// create table threat_reports (
//   id uuid primary key default gen_random_uuid(),
//   category text not null,
//   title text not null,
//   target_address text not null,
//   severity text not null,
//   description text not null,
//   reporter text not null,
//   upvotes int not null default 0,
//   created_at timestamptz default now()
// );

export interface ThreatReportRow {
  id: string;
  category: string;
  title: string;
  targetAddress: string;
  severity: string;
  description: string;
  reporter: string;
  upvotes: number;
  createdAt: string;
}

export interface NewThreatReport {
  category: string;
  title: string;
  targetAddress: string;
  severity: string;
  description: string;
  reporter: string;
}

/**
 * Fetches community-submitted threat reports, most recent first. Used by
 * api/threatIntel.ts to back the "Community Intelligence" feed.
 */
export async function getThreatReports(): Promise<ThreatReportRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("threat_reports")
    .select("id, category, title, target_address, severity, description, reporter, upvotes, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch threat reports: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    category: row.category,
    title: row.title,
    targetAddress: row.target_address,
    severity: row.severity,
    description: row.description,
    reporter: row.reporter,
    upvotes: row.upvotes,
    createdAt: row.created_at,
  }));
}

/**
 * Inserts a new community threat report and returns the stored row.
 * Used by api/threatIntel.ts's submitThreatReport().
 */
export async function insertThreatReport(report: NewThreatReport): Promise<ThreatReportRow> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("threat_reports")
    .insert({
      category: report.category,
      title: report.title,
      target_address: report.targetAddress,
      severity: report.severity,
      description: report.description,
      reporter: report.reporter,
    })
    .select("id, category, title, target_address, severity, description, reporter, upvotes, created_at")
    .single();

  if (error || !data) {
    throw new Error(`Failed to submit threat report: ${error?.message ?? "unknown error"}`);
  }

  return {
    id: data.id,
    category: data.category,
    title: data.title,
    targetAddress: data.target_address,
    severity: data.severity,
    description: data.description,
    reporter: data.reporter,
    upvotes: data.upvotes,
    createdAt: data.created_at,
  };
}