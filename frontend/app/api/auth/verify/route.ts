import { verifyWalletSignature } from '../../../../../backend/lib/okx/walletSdk';
import { logger, withLogging } from '../../../../../backend/lib/logger';

export const POST = withLogging('auth.verify', async (request: Request) => {
  const body = await request.json().catch(() => null);
  if (!body?.address || !body?.nonce || !body?.message || !body?.signature) {
    logger.warn('auth.verify.invalid_body');
    return Response.json(
      { error: 'address, nonce, message, and signature are all required.' },
      { status: 400 }
    );
  }

  const verified = await verifyWalletSignature({
    address: body.address,
    nonce: body.nonce,
    message: body.message,
    signature: body.signature,
  });

  // Deliberately never log the signature itself - only the outcome.
  logger.info('auth.verify.result', { address: body.address, verified });

  return Response.json({ verified });
});
