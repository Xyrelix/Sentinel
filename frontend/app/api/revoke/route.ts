import { buildRevokeTransaction } from '../../../../backend/api/revoke';
import { logger, withLogging } from '../../../../backend/lib/logger';

export const POST = withLogging('revoke', async (request: Request) => {
  const body = await request.json().catch(() => null);
  if (!body?.tokenAddress || !body?.spenderAddress) {
    logger.warn('revoke.invalid_body', { body });
    return Response.json(
      { error: 'tokenAddress and spenderAddress are required.' },
      { status: 400 }
    );
  }

  try {
    const tx = await buildRevokeTransaction({
      tokenAddress: body.tokenAddress,
      spenderAddress: body.spenderAddress,
    });
    logger.info('revoke.tx_built', { tokenAddress: body.tokenAddress, spenderAddress: body.spenderAddress });
    return Response.json(tx);
  } catch (err) {
    logger.error('revoke.failed', {
      tokenAddress: body.tokenAddress,
      spenderAddress: body.spenderAddress,
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to build revoke transaction.' },
      { status: 400 }
    );
  }
});
