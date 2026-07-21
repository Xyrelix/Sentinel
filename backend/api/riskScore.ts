export async function getRiskScore(payload: Record<string, unknown>) {
  return { ok: true, payload, riskScore: 72, label: "Moderate" };
}
