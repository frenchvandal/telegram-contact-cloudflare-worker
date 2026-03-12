const CORS_HEADERS_BASE = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

function normalizeConfiguredOrigin(allowedOrigin?: string): string | null {
  const trimmed = allowedOrigin?.trim();
  return trimmed ? trimmed : null;
}

export function getCorsHeaders(allowedOrigin?: string): HeadersInit {
  const configuredOrigin = normalizeConfiguredOrigin(allowedOrigin);

  return {
    ...CORS_HEADERS_BASE,
    "Access-Control-Allow-Origin": configuredOrigin ?? "*",
    ...(configuredOrigin ? { Vary: "Origin" } : {}),
  };
}

export function isOriginAllowed(origin: string | null, allowedOrigin?: string): boolean {
  const configuredOrigin = normalizeConfiguredOrigin(allowedOrigin);
  if (!configuredOrigin) return true;
  if (!origin) return true;
  return origin === configuredOrigin;
}
