import { getNativeTokenPriceUsd } from '../../../../backend/lib/pricing';
import { logger, withLogging } from '../../../../backend/lib/logger';

export const GET = withLogging('price', async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const chainIdParam = searchParams.get('chainId');
  const chainId = chainIdParam ? Number(chainIdParam) : NaN;

  if (!Number.isFinite(chainId)) {
    logger.warn('price.invalid_chain_id', { chainIdParam });
    return Response.json({ error: 'chainId query parameter is required.' }, { status: 400 });
  }

  try {
    const price = await getNativeTokenPriceUsd(chainId);
    logger.info('price.fetched', { chainId, price });
    return Response.json({ price });
  } catch (err) {
    logger.error('price.failed', { chainId, message: err instanceof Error ? err.message : String(err) });
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch price.' },
      { status: 502 }
    );
  }
});
