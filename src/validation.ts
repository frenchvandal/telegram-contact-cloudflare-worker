import type { ContactFormPayload } from "./config";

const FALLBACK_NAME = "Inconnu";
const FALLBACK_EMAIL = "Non renseigne";
const FALLBACK_MESSAGE = "Pas de message";

export const MAX_NAME_LENGTH = 120;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_MESSAGE_LENGTH = 2500;

export type ValidationResult =
  | { ok: true; payload: ContactFormPayload }
  | { ok: false; status: number; message: string };

function normalizeField(
  value: FormDataEntryValue | null,
  fallback: string,
): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function isValidEmail(email: string): boolean {
  if (email === FALLBACK_EMAIL) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isSupportedContentType(contentType: string): boolean {
  return (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  );
}

export function isHoneypotTriggered(formData: FormData): boolean {
  const honeypot = formData.get("website");
  return typeof honeypot === "string" && honeypot.trim() !== "";
}

export function validateFormData(formData: FormData): ValidationResult {
  const nom = normalizeField(formData.get("nom"), FALLBACK_NAME);
  const email = normalizeField(formData.get("email"), FALLBACK_EMAIL);
  const message = normalizeField(formData.get("message"), FALLBACK_MESSAGE);

  if (nom.length > MAX_NAME_LENGTH) {
    return {
      ok: false,
      status: 400,
      message: `Nom trop long (${MAX_NAME_LENGTH} caracteres max)`,
    };
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return {
      ok: false,
      status: 400,
      message:
        `Adresse e-mail trop longue (${MAX_EMAIL_LENGTH} caracteres max)`,
    };
  }

  if (!isValidEmail(email)) {
    return { ok: false, status: 400, message: "Adresse e-mail invalide" };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      status: 400,
      message: `Message trop long (${MAX_MESSAGE_LENGTH} caracteres max)`,
    };
  }

  return {
    ok: true,
    payload: {
      nom,
      email,
      message,
    },
  };
}
