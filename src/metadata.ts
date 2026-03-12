import type { RequestMetadata } from "./config";
import { formatDateParis, truncate } from "./text";

const MAX_METADATA_LENGTH = 300;

function getClientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "Inconnue"
  );
}

function getCountry(request: Request): string {
  return request.headers.get("CF-IPCountry") || "Inconnu";
}

function getUserAgent(request: Request): string {
  return request.headers.get("User-Agent") || "Inconnu";
}

function getReferer(request: Request): string {
  return request.headers.get("Referer") || "Non renseigne";
}

function getRayId(request: Request): string {
  return request.headers.get("CF-Ray") || "Non renseigne";
}

export function extractRequestMetadata(request: Request): RequestMetadata {
  return {
    formattedDate: formatDateParis(new Date()),
    clientIp: getClientIp(request),
    country: getCountry(request),
    userAgent: truncate(getUserAgent(request), MAX_METADATA_LENGTH),
    referer: truncate(getReferer(request), MAX_METADATA_LENGTH),
    rayId: truncate(getRayId(request), 120),
  };
}
