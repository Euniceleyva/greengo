import "server-only";

import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export function rateLimitResponse(
  request: Request,
  routeKey: string,
  limit: number,
  windowSeconds: number,
): NextResponse | null {
  const key = `${routeKey}:${getClientIp(request)}`;
  const result = checkRateLimit(key, limit, windowSeconds);
  if (result.allowed) return null;

  return NextResponse.json(
    { error: "Demasiadas solicitudes. Inténtalo de nuevo en unos momentos." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
  );
}

export class PayloadTooLargeError extends Error {}

/** Lee y parsea JSON limitando el tamaño del body para evitar payloads abusivos. */
export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new PayloadTooLargeError("El cuerpo de la solicitud es demasiado grande.");
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) {
    throw new PayloadTooLargeError("El cuerpo de la solicitud es demasiado grande.");
  }

  return JSON.parse(text);
}
