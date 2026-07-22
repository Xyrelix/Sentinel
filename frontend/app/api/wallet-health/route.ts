import { getWalletHealth } from '../../../../backend/api/walletHealth';
import { logger, withLogging } from '../../../../backend/lib/logger';

export const GET = withLogging('wallet-health', async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    logger.warn('wallet-health.missing_address');
    return Response.json({ error: 'address query parameter is required.' }, { status: 400 });
  }

  try {
    const health = await getWalletHealth(address);
    logger.info('wallet-health.checked', {
      address,
      approvalsFound: health.approvals.length,
      riskFlagsFound: health.riskFlags.length,
    });
    return Response.json(health);
  } catch (err) {
    logger.error('wallet-health.failed', {
      address,
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to check wallet health.' },
      { status: 500 }
    );
  }
});
