import type { ContactFormPayload, Env, RequestMetadata } from "./config";
import { escapeHtml, truncate } from "./text";

const TELEGRAM_MAX_TEXT_LENGTH = 4096;
const TELEGRAM_SAFETY_BUFFER = 96;
const TELEGRAM_TEXT_BUDGET = TELEGRAM_MAX_TEXT_LENGTH - TELEGRAM_SAFETY_BUFFER;

function buildTelegramMessage(
  payload: ContactFormPayload,
  metadata: RequestMetadata,
): string {
  return [
    "<b>Nouveau message de formulaire</b>",
    "",
    "<b>Contact</b>",
    `- <b>Nom :</b> ${escapeHtml(payload.nom)}`,
    `- <b>Email :</b> ${escapeHtml(payload.email)}`,
    "",
    "<b>Message</b>",
    escapeHtml(payload.message),
    "",
    "<b>Metadonnees</b>",
    `- <b>Date :</b> ${escapeHtml(metadata.formattedDate)}`,
    `- <b>IP :</b> <code>${escapeHtml(metadata.clientIp)}</code>`,
    `- <b>Pays :</b> ${escapeHtml(metadata.country)}`,
    `- <b>User-Agent :</b> <code>${escapeHtml(metadata.userAgent)}</code>`,
    `- <b>Referer :</b> ${escapeHtml(metadata.referer)}`,
    `- <b>CF-Ray :</b> <code>${escapeHtml(metadata.rayId)}</code>`,
  ].join("\n");
}

function withMessageBudget(
  payload: ContactFormPayload,
  metadata: RequestMetadata,
): ContactFormPayload {
  const text = buildTelegramMessage(payload, metadata);
  if (text.length <= TELEGRAM_TEXT_BUDGET) return payload;

  const staticLength = text.length - payload.message.length;
  const maxMessageLength = Math.max(80, TELEGRAM_TEXT_BUDGET - staticLength);

  return {
    ...payload,
    message: truncate(payload.message, maxMessageLength),
  };
}

export async function sendToTelegram(
  env: Env,
  payload: ContactFormPayload,
  metadata: RequestMetadata,
): Promise<boolean> {
  const budgetedPayload = withMessageBudget(payload, metadata);
  const text = buildTelegramMessage(budgetedPayload, metadata);

  const telegramResponse = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    },
  );

  if (!telegramResponse.ok) {
    const errorText = truncate(await telegramResponse.text(), 300);
    console.error("Telegram API returned an error", {
      status: telegramResponse.status,
      body: errorText,
    });
    return false;
  }

  return true;
}
