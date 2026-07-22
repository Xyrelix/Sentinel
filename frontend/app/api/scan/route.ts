import { scanTransaction, scanDomain } from '../../../../backend/agents/scamDetectionAgent';
import { isLikelyDomain } from '../../../../backend/lib/utils';
import { logger, withLogging } from '../../../../backend/lib/logger';

export const POST = withLogging('scan', async (request: Request) => {
  const body = await request.json().catch(() => null);
  if (!body?.to) {
    logger.warn('scan.missing_target');
    return Response.json({ error: 'to (target address or domain) is required.' }, { status: 400 });
  }

  try {
    if (isLikelyDomain(body.to)) {
      const result = await scanDomain(body.to);
      logger.info('scan.domain_completed', { target: body.to, score: result.score, label: result.label });
      return Response.json(result);
    }

    const result = await scanTransaction(
      {
        from: body.from ?? '0x0000000000000000000000000000000000dEaD',
        to: body.to,
        data: body.data ?? '0x',
        value: body.value ? BigInt(body.value) : 0n,
      },
      body.chainId
    );
    logger.info('scan.completed', { target: body.to, chainId: body.chainId, score: result.score, label: result.label });
    return Response.json(result);
  } catch (err) {
    logger.error('scan.failed', {
      target: body.to,
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json(
      { error: err instanceof Error ? err.message : 'Scan failed.' },
      { status: 500 }
    );
  }
});
