/**
 * lib/logger.ts
 *
 * Structured JSON logging for Vercel's Runtime Logs. Vercel captures
 * stdout/stderr from serverless functions automatically — emitting one JSON
 * object per line (rather than freeform text) makes those logs filterable
 * by field (event, route, address, durationMs, etc.) in the dashboard's log
 * explorer, and just as useful for local `next dev` debugging.
 */

type LogLevel = "info" | "warn" | "error";

interface LogFields {
  [key: string]: unknown;
}

function emit(level: LogLevel, event: string, fields: LogFields = {}): void {
  const entry = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (event: string, fields?: LogFields) => emit("info", event, fields),
  warn: (event: string, fields?: LogFields) => emit("warn", event, fields),
  error: (event: string, fields?: LogFields) => emit("error", event, fields),
};

/**
 * Wraps an API route handler with request/response/error/timing logging.
 * Usage: export const POST = withLogging('revoke', async (request) => {...});
 */
export function withLogging<T extends (request: Request) => Promise<Response>>(
  route: string,
  handler: T
): T {
  return (async (request: Request) => {
    const start = Date.now();
    const method = request.method;
    logger.info("request.start", { route, method, url: request.url });

    try {
      const response = await handler(request);
      logger.info("request.end", {
        route,
        method,
        status: response.status,
        durationMs: Date.now() - start,
      });
      return response;
    } catch (err) {
      logger.error("request.unhandled_error", {
        route,
        method,
        durationMs: Date.now() - start,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      throw err;
    }
  }) as T;
}
