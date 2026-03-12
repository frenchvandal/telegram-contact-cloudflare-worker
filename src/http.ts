import type { JsonResponse } from "./config";

export function jsonResponse(
  data: JsonResponse,
  status: number,
  corsHeaders: HeadersInit,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
    },
  });
}
