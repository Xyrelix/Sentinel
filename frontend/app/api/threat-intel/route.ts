import { listThreats, submitThreatReport } from '../../../../backend/api/threatIntel';
import { logger, withLogging } from '../../../../backend/lib/logger';

export const GET = withLogging('threat-intel.list', async () => {
  try {
    const threats = await listThreats();
    logger.info('threat-intel.listed', { count: threats.length });
    return Response.json({ threats });
  } catch (err) {
    logger.error('threat-intel.list_failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to load threat reports.' },
      { status: 500 }
    );
  }
});

export const POST = withLogging('threat-intel.submit', async (request: Request) => {
  const body = await request.json().catch(() => null);
  if (!body?.category || !body?.title || !body?.targetAddress || !body?.description || !body?.reporter) {
    logger.warn('threat-intel.invalid_body', { body });
    return Response.json(
      { error: 'category, title, targetAddress, description, and reporter are all required.' },
      { status: 400 }
    );
  }

  try {
    const threat = await submitThreatReport({
      category: body.category,
      title: body.title,
      targetAddress: body.targetAddress,
      severity: body.severity ?? 'HIGH',
      description: body.description,
      reporter: body.reporter,
    });
    logger.info('threat-intel.submitted', { id: threat.id, category: threat.category, targetAddress: threat.targetAddress });
    return Response.json(threat);
  } catch (err) {
    logger.error('threat-intel.submit_failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to submit threat report.' },
      { status: 500 }
    );
  }
});
