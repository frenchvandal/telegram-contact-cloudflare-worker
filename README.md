# Telegram Contact Cloudflare Worker

Worker Cloudflare qui recoit un formulaire de contact et transfere le message
vers Telegram.

## Fonctionnalites

- Endpoint `POST` pour formulaire (`multipart/form-data` ou
  `application/x-www-form-urlencoded`)
- Validation des champs (`nom`, `email`, `message`)
- CORS configurable via `ALLOWED_ORIGIN`
- Honeypot (`website`) pour filtrer des bots simples
- Message Telegram enrichi avec metadonnees (date, IP, pays, user-agent,
  referer, CF-Ray)

## Variables d'environnement (Worker)

- `TELEGRAM_BOT_TOKEN` (obligatoire)
- `TELEGRAM_CHAT_ID` (obligatoire)
- `ALLOWED_ORIGIN` (optionnel)

## Scripts

- `npm run dev`: lance `wrangler dev`
- `npm run type-check`: regenere les types + compile TS
- `npm run test`: execute les tests unitaires
- `npm run ci`: type-check + tests
- `npm run send:faker-message`: envoie un faux message via endpoint worker

## Workflow GitHub Actions

### CI

Le workflow `CI` lance `npm run ci` sur push et pull request.

### Send Faker Message

Le workflow `Send Faker Message` est declenche manuellement
(`workflow_dispatch`) et execute un test de bout en bout:

1. demarre le worker local sur le runner GitHub
2. injecte les secrets dans `.dev.vars`
3. appelle l'endpoint worker avec un payload genere par Faker.js
4. verifie une reponse `ok: true`

Secrets GitHub attendus:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
