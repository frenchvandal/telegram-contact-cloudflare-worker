import { faker } from "@faker-js/faker";

const workerUrl = process.env.WORKER_URL ?? "http://127.0.0.1:8787";

const fakePayload = {
  nom: faker.person.fullName(),
  email: faker.internet.email(),
  message: faker.lorem.paragraphs({ min: 1, max: 3 }, "\n\n"),
  website: "",
};

const body = new URLSearchParams(fakePayload);

const headers = {
  "Content-Type": "application/x-www-form-urlencoded",
};

const response = await fetch(workerUrl, {
  method: "POST",
  headers,
  body,
});

let parsed;
try {
  parsed = await response.json();
} catch {
  parsed = null;
}

if (!response.ok) {
  throw new Error(
    `Worker request failed (${response.status}): ${JSON.stringify(parsed)}`,
  );
}

if (!parsed || parsed.ok !== true) {
  throw new Error(`Worker answered with a non-success payload: ${JSON.stringify(parsed)}`);
}

console.log("Faker message sent successfully via worker endpoint.");
console.log(`Target endpoint: ${workerUrl}`);
console.log(`Fake sender: ${fakePayload.nom} <${fakePayload.email}>`);
