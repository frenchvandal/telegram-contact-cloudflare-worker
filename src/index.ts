import type { Env } from "./config";
import { jsonResponse } from "./http";
import { extractRequestMetadata } from "./metadata";
import { getCorsHeaders, isOriginAllowed } from "./security";
import { sendToTelegram } from "./telegram";
import {
  isHoneypotTriggered,
  isSupportedContentType,
  validateFormData,
} from "./validation";

const SUCCESS_RESPONSE = {
  ok: true,
  message: "Message envoye avec succes",
} as const;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = getCorsHeaders(env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (request.method !== "POST") {
      return jsonResponse(
        { ok: false, message: "Methode non autorisee" },
        405,
        corsHeaders,
      );
    }

    const origin = request.headers.get("Origin");
    if (!isOriginAllowed(origin, env.ALLOWED_ORIGIN)) {
      return jsonResponse(
        { ok: false, message: "Origine non autorisee" },
        403,
        corsHeaders,
      );
    }

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return jsonResponse(
        { ok: false, message: "Configuration serveur incomplete" },
        500,
        corsHeaders,
      );
    }

    try {
      const contentType = request.headers.get("Content-Type") ?? "";
      if (!isSupportedContentType(contentType)) {
        return jsonResponse(
          { ok: false, message: "Type de contenu non supporte" },
          415,
          corsHeaders,
        );
      }

      const formData = await request.formData();

      if (isHoneypotTriggered(formData)) {
        return jsonResponse(SUCCESS_RESPONSE, 200, corsHeaders);
      }

      const validation = validateFormData(formData);
      if (!validation.ok) {
        return jsonResponse(
          { ok: false, message: validation.message },
          validation.status,
          corsHeaders,
        );
      }

      const metadata = extractRequestMetadata(request);
      const isSent = await sendToTelegram(env, validation.payload, metadata);

      if (!isSent) {
        return jsonResponse(
          {
            ok: false,
            message: "Echec temporaire lors de l'envoi, merci de reessayer",
          },
          502,
          corsHeaders,
        );
      }

      return jsonResponse(SUCCESS_RESPONSE, 200, corsHeaders);
    } catch (error) {
      console.error("Unhandled worker error", error);
      return jsonResponse(
        { ok: false, message: "Erreur serveur" },
        500,
        corsHeaders,
      );
    }
  },
};
