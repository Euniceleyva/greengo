import "server-only";

// Rate limiting en memoria por proceso. Suficiente para una sola instancia;
// en un despliegue multi-región o serverless con múltiples instancias frías
// cada una llevará su propio contador, así que el límite real efectivo puede
// ser más alto que `limit`. Para un límite estricto entre instancias, migrar
// a un store compartido (p. ej. Upstash Redis) reemplazando solo este módulo.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Evita que `buckets` crezca sin límite si llegan muchas IPs distintas.
const MAX_TRACKED_KEYS = 5000;

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function checkRateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
