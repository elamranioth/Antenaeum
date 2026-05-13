# Athenaeum

Athenaeum is a React/Vite reading library with a self-hostable sync backend.

## Stack

- Frontend: React + Vite
- Backend: Node.js HTTP server
- Database: SQLite via Node's built-in `node:sqlite`
- Auth: email + password, JWT access tokens, refresh tokens
- Password hashing: Node `crypto.scrypt`

No Firebase, Firestore, Google Cloud, or GCP service is used for auth, storage, or sync.

## Run Locally

1. Copy `.env.example` to `.env` and change the secrets.
2. Start the API:

```bash
npm run api
```

3. Start the frontend:

```bash
npm run dev -- --port 5173
```

4. Open `http://localhost:5173/Antenaeum/`.

The frontend uses `VITE_ATHENAEUM_API_URL`, defaulting to `http://localhost:8787`. The login panel also includes a "Sync server URL" field, so a static GitHub Pages build can point to a backend you deploy elsewhere without rebuilding.

## API Routes

- `POST /api/auth/signup` with `{ email, password, name }`
- `POST /api/auth/login` with `{ email, password }`
- `POST /api/auth/refresh` with `{ refreshToken }`
- `POST /api/auth/logout` with `{ refreshToken }`
- `GET /api/auth/me`
- `GET /api/highlights`
- `POST /api/highlights`
- `PATCH /api/highlights/:id`
- `DELETE /api/highlights/:id`

Highlight records support `kind`, `text`, `sourceUrl`, `sourceSection`, `articleId`, `articleTitle`, `note`, `tag`, and `color`.

## Database

The schema lives in `server/schema.sql`. The app creates the SQLite database automatically at `server/data/athenaeum.sqlite` unless `SQLITE_PATH` is set.
