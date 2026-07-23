/**
 * lib/x402.ts
 *
 * Wires the OKX x402 payment protocol into a Next.js App Router route
 * handler. @okxweb3/x402-next (OKX's own Next.js wrapper) declares a peer
 * dependency on next@^16, but this app is on Next 14 - so instead of forcing
 * that major upgrade just for a thin adapter, this file ports the same
 * NextAdapter/withX402 logic from that package's source directly against
 * the framework-agnostic @okxweb3/x402-core, which has no Next.js
 * dependency at all. The request/response APIs used below (NextRequest's
 * .nextUrl/.headers/.json(), NextResponse.json/.next()) are unchanged
 * between Next 14 and 16, so behavior matches the official package.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  x402HTTPResourceServer,
  x402ResourceServer,
  FacilitatorResponseError,
  type HTTPAdapter,
  type HTTPRequestContext,
  type RouteConfig,
} from "@okxweb3/x402-core/server";

class NextAdapter implements HTTPAdapter {
  constructor(private req: NextRequest) {}
  getHeader(name: string): string | undefined {
    return this.req.headers.get(name) ?? undefined;
  }
  getMethod(): string {
    return this.req.method;
  }
  getPath(): string {
    return this.req.nextUrl.pathname;
  }
  getUrl(): string {
    return this.req.url;
  }
  getAcceptHeader(): string {
    return this.req.headers.get("Accept") ?? "";
  }
  getUserAgent(): string {
    return this.req.headers.get("User-Agent") ?? "";
  }
  async getBody(): Promise<unknown> {
    try {
      return await this.req.clone().json();
    } catch {
      return undefined;
    }
  }
}

function createRequestContext(request: NextRequest): HTTPRequestContext {
  const adapter = new NextAdapter(request);
  return {
    adapter,
    path: request.nextUrl.pathname,
    method: request.method,
    paymentHeader: adapter.getHeader("payment-signature") ?? adapter.getHeader("x-payment"),
  };
}

function createFacilitatorErrorResponse(error: Error): NextResponse {
  return NextResponse.json({ error: error.message }, { status: 502 });
}

/**
 * Wraps a Next.js route handler with x402 payment protection: unpaid
 * requests get a 402 with payment requirements; paid requests are verified
 * before the handler runs and settled on-chain only after it responds
 * successfully (status < 400) - a failed scan never charges the caller.
 */
export function withX402(
  routeHandler: (request: NextRequest) => Promise<NextResponse>,
  routeConfig: RouteConfig,
  server: x402ResourceServer
): (request: NextRequest) => Promise<NextResponse> {
  const httpServer = new x402HTTPResourceServer(server, { "*": routeConfig });
  let initialized = false;
  let initPromise: Promise<void> | null = null;

  return async (request: NextRequest) => {
    if (!initialized) {
      initPromise ??= httpServer.initialize();
      try {
        await initPromise;
        initialized = true;
      } catch (error) {
        initPromise = null;
        throw error;
      }
    }

    const context = createRequestContext(request);
    const result = await httpServer.processHTTPRequest(context);

    if (result.type === "no-payment-required") {
      return routeHandler(request);
    }

    if (result.type === "payment-error") {
      const { response } = result;
      return NextResponse.json(response.body ?? {}, {
        status: response.status,
        headers: response.headers,
      });
    }

    // payment-verified: run the real handler first, then settle on-chain
    // only if it succeeded.
    const { paymentPayload, paymentRequirements, declaredExtensions } = result;
    const handlerResponse = await routeHandler(request);

    if (handlerResponse.status >= 400) {
      return handlerResponse;
    }

    try {
      const responseBody = Buffer.from(await handlerResponse.clone().arrayBuffer());
      const settlement = await httpServer.processSettlement(
        paymentPayload,
        paymentRequirements,
        declaredExtensions,
        { request: context, responseBody }
      );

      if (!settlement.success) {
        const { response } = settlement;
        return NextResponse.json(response.body ?? {}, {
          status: response.status,
          headers: response.headers,
        });
      }

      Object.entries(settlement.headers).forEach(([key, value]) => {
        handlerResponse.headers.set(key, value);
      });
      return handlerResponse;
    } catch (error) {
      if (error instanceof FacilitatorResponseError) {
        return createFacilitatorErrorResponse(error);
      }
      return NextResponse.json({}, { status: 402 });
    }
  };
}
