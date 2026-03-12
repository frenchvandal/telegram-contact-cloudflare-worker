export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  ALLOWED_ORIGIN?: string;
}

export interface JsonResponse {
  ok: boolean;
  message: string;
}

export interface ContactFormPayload {
  nom: string;
  email: string;
  message: string;
}

export interface RequestMetadata {
  formattedDate: string;
  clientIp: string;
  country: string;
  userAgent: string;
  referer: string;
  rayId: string;
}
