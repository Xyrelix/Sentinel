export async function scanTransaction(payload: Record<string, unknown>) {\n  return { ok: true, payload, status: 'scanned' };\n}\n
