import assert from "node:assert/strict";
import test from "node:test";

import { getCorsHeaders, isOriginAllowed } from "./security";

test("uses wildcard CORS when ALLOWED_ORIGIN is not configured", () => {
  const headers = new Headers(getCorsHeaders());

  assert.equal(headers.get("Access-Control-Allow-Origin"), "*");
  assert.equal(headers.get("Access-Control-Allow-Headers"), "Content-Type");
  assert.equal(headers.get("Vary"), null);
});

test("uses fixed CORS origin when ALLOWED_ORIGIN is configured", () => {
  const headers = new Headers(getCorsHeaders("https://example.com"));

  assert.equal(
    headers.get("Access-Control-Allow-Origin"),
    "https://example.com",
  );
  assert.equal(headers.get("Vary"), "Origin");
});

test("validates request origin against ALLOWED_ORIGIN", () => {
  assert.equal(
    isOriginAllowed("https://example.com", "https://example.com"),
    true,
  );
  assert.equal(
    isOriginAllowed("https://evil.test", "https://example.com"),
    false,
  );
  assert.equal(isOriginAllowed(null, "https://example.com"), true);
});
