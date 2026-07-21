export async function revokeApproval(payload: Record<string, unknown>) {\n  return { ok: true, payload, revoked: true };\n}\n
