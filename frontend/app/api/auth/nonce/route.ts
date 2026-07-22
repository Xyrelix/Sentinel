import { startWalletAuth } from '../../../../../backend/lib/okx/walletSdk';
import { logger, withLogging } from '../../../../../backend/lib/logger';

export const POST = withLogging('auth.nonce', async (request: Request) => {
  const body = await request.json().catch(() => null);
  if (!body?.address) {
    logger.warn('auth.nonce.missing_address');
    return Response.json({ error: 'address is required.' }, { status: 400 });
  }

  try {
    const result = await startWalletAuth(body.address);
    logger.info('auth.nonce.issued', { address: body.address });
    return Response.json(result);
  } catch (err) {
    logger.error('auth.nonce.failed', {
      address: body.address,
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to start wallet auth.' },
      { status: 400 }
    );
  }
});
