import { NextRequest, NextResponse } from 'next/server';
import { scanTransaction, scanDomain } from '../../../../backend/agents/scamDetectionAgent';
import { isLikelyDomain, isEnsName } from '../../../../backend/lib/utils';
import { resolveEnsName } from '../../../../backend/lib/ens';
import { logger, withLogging } from '../../../../backend/lib/logger';
import { withX402 } from '../../../lib/x402';
import { getX402ResourceServer, getX402PayToAddress, getX402PriceUsd } from '../../../lib/x402Server';

const scanHandler = async (request: NextRequest): Promise<NextResponse> => {
  const body = await request.json().catch(() => null);
  if (!body?.to) {
    logger.warn('scan.missing_target');
    return NextResponse.json({ error: 'to (target address, ENS name, or domain) is required.' }, { status: 400 });
  }

  try {
    let target = body.to;
    let resolvedFrom: string | undefined;

    // ENS names look domain-shaped too, so this must be checked before
    // isLikelyDomain - otherwise "vitalik.eth" gets misrouted to the
    // phishing-site pipeline instead of being resolved to a real address.
    if (isEnsName(target)) {
      const resolved = await resolveEnsName(target);
      if (!resolved) {
        logger.warn('scan.ens_not_found', { name: target });
        return NextResponse.json(
          { error: `Could not resolve ENS name "${target}" - it may not be registered.` },
          { status: 404 }
        );
      }
      resolvedFrom = target;
      target = resolved;
      logger.info('scan.ens_resolved', { name: resolvedFrom, address: target });
    } else if (isLikelyDomain(target)) {
      const result = await scanDomain(target);
      logger.info('scan.domain_completed', { target, score: result.score, label: result.label });
      return NextResponse.json(result);
    }

    const result = await scanTransaction(
      {
        from: body.from ?? '0x0000000000000000000000000000000000dEaD',
        to: target,
        data: body.data ?? '0x',
        value: body.value ? BigInt(body.value) : 0n,
      },
      body.chainId
    );

    if (resolvedFrom) {
      result.reasons = [`Resolved ENS name "${resolvedFrom}" to ${target}.`, ...result.reasons];
    }

    logger.info('scan.completed', { target, resolvedFrom, chainId: body.chainId, score: result.score, label: result.label });
    return NextResponse.json({ ...result, resolvedAddress: resolvedFrom ? target : undefined });
  } catch (err) {
    logger.error('scan.failed', {
      target: body.to,
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Scan failed.' },
      { status: 500 }
    );
  }
};

// x402 payment gate is opt-in: only enforced once OKX facilitator
// credentials and a payout address are configured, so the endpoint keeps
// working free-of-charge (matching the ASP listing's "free" state) until
// those are set - see lib/x402Server.ts.
const isX402Configured =
  process.env.OKX_X402_API_KEY && process.env.OKX_X402_SECRET_KEY && process.env.OKX_X402_PASSPHRASE && process.env.X402_PAYTO_ADDRESS;

const paymentProtectedHandler = isX402Configured
  ? withX402(
      scanHandler,
      {
        accepts: {
          scheme: 'exact',
          network: 'eip155:196',
          payTo: getX402PayToAddress(),
          price: getX402PriceUsd('X402_SCAN_PRICE_USD', '0.01'),
        },
        description: 'Pre-signature risk scan for a contract/wallet address, ENS name, domain, or transaction payload.',
      },
      getX402ResourceServer()
    )
  : scanHandler;

export const POST = withLogging('scan', paymentProtectedHandler);
