import assert from "node:assert/strict";
import test from "node:test";

import {
  isHoneypotTriggered,
  isSupportedContentType,
  MAX_MESSAGE_LENGTH,
  validateFormData,
} from "./validation";

function createFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

test("accepts supported content types", () => {
  assert.equal(
    isSupportedContentType("multipart/form-data; boundary=abc"),
    true,
  );
  assert.equal(
    isSupportedContentType("application/x-www-form-urlencoded"),
    true,
  );
  assert.equal(isSupportedContentType("application/json"), false);
});

test("flags honeypot submissions", () => {
  const clean = createFormData({ website: "" });
  const spam = createFormData({ website: "https://spam.test" });

  assert.equal(isHoneypotTriggered(clean), false);
  assert.equal(isHoneypotTriggered(spam), true);
});

test("validates expected form data", () => {
  const formData = createFormData({
    nom: "Alice Martin",
    email: "alice@example.com",
    message: "Bonjour, ceci est un message de test.",
  });

  const result = validateFormData(formData);
  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.payload.nom, "Alice Martin");
    assert.equal(result.payload.email, "alice@example.com");
  }
});

test("rejects invalid email", () => {
  const formData = createFormData({
    nom: "Alice Martin",
    email: "alice@@example",
    message: "Salut",
  });

  const result = validateFormData(formData);
  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.status, 400);
    assert.equal(result.message, "Adresse e-mail invalide");
  }
});

test("rejects too long messages", () => {
  const formData = createFormData({
    nom: "Alice Martin",
    email: "alice@example.com",
    message: "a".repeat(MAX_MESSAGE_LENGTH + 1),
  });

  const result = validateFormData(formData);
  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.status, 400);
    assert.match(result.message, /Message trop long/);
  }
});
