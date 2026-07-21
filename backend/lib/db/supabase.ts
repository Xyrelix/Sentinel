/**
 * lib/db/supabase.ts
 *
 * Supabase client + typed queries. This is what unblocks WATCHED_PAIRS in
 * api/walletHealth.ts — instead of a hardcoded array, the watchlist lives
 * in a `watched_pairs` table and can be updated without a code deploy.
 *
 * Requires SUPABASE_URL and SUPABASE_ANON_KEY in .env.local.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Address } from "viem";

let client: SupabaseClient | null = null;

/** Returns a singleton Supabase client. */
export function getSupabaseClient(): SupabaseClient {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_ANON_KEY must be set in backend/.env.local"
    );
  }
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
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
 * approvals against. Used by api/walletHealth.ts in place of the old
 * hardcoded WATCHED_PAIRS array.
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
 * "Community Intelligence" feature — flagging newly discovered risky
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