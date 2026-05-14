# Athenaeum

Athenaeum is a React/Vite e-ink reading library with cross-device sync for highlights, quotes, and vocabulary.

## No Google Cloud

Athenaeum does not use Firebase, Firestore, Google Auth, or any GCP service. The production sync path is:

- Frontend: React + Vite, hosted as a static site.
- Sync API: Cloudflare Worker.
- Database: Cloudflare D1 SQLite.
- Auth: email + password, JWT access tokens, refresh tokens.
- Password hashing: PBKDF2-SHA256 in the Worker runtime.

The older local Node/SQLite server is still included for development.

## Local Frontend

```bash
npm install
npm run dev -- --port 5173
```

Open `http://localhost:5173/Antenaeum/`.

## Production Cloud Sync

1. Install or run Wrangler:

```bash
npm install -D wrangler@latest
```

2. Log in to Cloudflare:

```bash
npx wrangler login
```

3. Create the D1 database:

```bash
npm run sync:d1:create
```

4. Copy the returned `database_id` into `wrangler.jsonc`.

5. Add secrets:

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put JWT_REFRESH_SECRET
```

Use two different long random values.

6. Apply the schema:

```bash
npm run sync:d1:migrate
```

7. Deploy the API:

```bash
npm run sync:deploy
```

8. Copy the deployed Worker URL into `public/config.js`:

```js
window.ATHENAEUM_CONFIG = {
  API_URL: "https://athenaeum-sync.your-name.workers.dev"
};
```

9. Rebuild and push the static site:

```bash
npm run build
git add .
git commit -m "Connect Athenaeum Cloud Sync"
git push origin main
```

After that, every browser and e-reader uses the same API URL from `config.js`. Sign in with the same email and password on any device to load the same highlights, quotes, and vocabulary.

## API Routes

- `GET /api/health`
- `POST /api/auth/signup` with `{ email, password, name }`
- `POST /api/auth/login` with `{ email, password }`
- `POST /api/auth/refresh` with `{ refreshToken }`
- `POST /api/auth/logout` with `{ refreshToken }`
- `GET /api/auth/me`
- `GET /api/highlights`
- `POST /api/highlights`
- `PATCH /api/highlights/:id`
- `DELETE /api/highlights/:id`
- `GET /api/vocabulary`
- `POST /api/vocabulary`
- `PATCH /api/vocabulary/:id`
- `DELETE /api/vocabulary/:id`

## Local Node API

For local development without Cloudflare:

```bash
npm run api
```

The local API listens on `http://localhost:8787` and stores SQLite data under `server/data/`.
