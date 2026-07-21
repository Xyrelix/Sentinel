export async function revokeApproval(payload: Record<string, unknown>) {
  return { ok: true, payload, revoked: true };
}
