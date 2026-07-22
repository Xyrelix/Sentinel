import { getRiskScore } from '../../../../backend/api/riskScore';
import { withLogging } from '../../../../backend/lib/logger';

export const POST = withLogging('risk-score', async (request: Request) => {
  const body = await request.json().catch(() => ({}));
  const result = await getRiskScore(body ?? {});
  return Response.json(result);
});
