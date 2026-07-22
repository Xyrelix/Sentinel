import { scanTransaction, scanDomain } from '../../../../backend/agents/scamDetectionAgent';
import { isLikelyDomain, isEnsName } from '../../../../backend/lib/utils';
import { resolveEnsName } from '../../../../backend/lib/ens';
import { logger, withLogging } from '../../../../backend/lib/logger';

export const POST = withLogging('scan', async (request: Request) => {
  const body = await request.json().catch(() => null);
  if (!body?.to) {
    logger.warn('scan.missing_target');
    return Response.json({ error: 'to (target address, ENS name, or domain) is required.' }, { status: 400 });
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
        return Response.json(
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
      return Response.json(result);
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
    return Response.json({ ...result, resolvedAddress: resolvedFrom ? target : undefined });
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
