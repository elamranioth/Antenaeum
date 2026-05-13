import { createServer } from "node:http";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), "server", "data");
const DB_PATH = process.env.SQLITE_PATH || join(DATA_DIR, "athenaeum.sqlite");
const ACCESS_SECRET = process.env.JWT_SECRET || "athenaeum-dev-access-secret-change-me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "athenaeum-dev-refresh-secret-change-me";
const ACCESS_TTL_SECONDS = Number(process.env.ACCESS_TOKEN_TTL_SECONDS || 15 * 60);
const REFRESH_TTL_SECONDS = Number(process.env.REFRESH_TOKEN_TTL_SECONDS || 30 * 24 * 60 * 60);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON");
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at TEXT
);

CREATE TABLE IF NOT EXISTS highlights (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'highlight' CHECK (kind IN ('highlight', 'quote')),
  text TEXT NOT NULL,
  source_url TEXT,
  source_section TEXT,
  article_id TEXT,
  article_title TEXT,
  note TEXT,
  tag TEXT,
  color TEXT NOT NULL DEFAULT '#E8C770',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_highlights_user_updated ON highlights(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_highlights_user_article ON highlights(user_id, article_id);
`);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function send(res, status, payload = null) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  });
  res.end(payload === null ? "" : JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new HttpError(413, "Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw.trim()) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new HttpError(400, "Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJwt(payload, secret, ttlSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + ttlSeconds };
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(fullPayload));
  const signature = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verifyJwt(token, secret) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new HttpError(401, "Invalid token");
  const [header, body, signature] = parts;
  const expected = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  const sent = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (sent.length !== wanted.length || !timingSafeEqual(sent, wanted)) {
    throw new HttpError(401, "Invalid token");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, "Token expired");
  }
  return payload;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("base64url");
  return `scrypt$16384$8$1$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const [scheme, n, r, p, salt, hash] = String(stored || "").split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024,
  });
  const expected = Buffer.from(hash, "base64url");
  return expected.length === candidate.length && timingSafeEqual(candidate, expected);
}

function hashToken(token) {
  return createHmac("sha256", REFRESH_SECRET).update(token).digest("base64url");
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email,
  };
}

function createSession(user) {
  const sid = randomUUID();
  const accessToken = signJwt({ sub: user.id, email: user.email, type: "access" }, ACCESS_SECRET, ACCESS_TTL_SECONDS);
  const refreshToken = signJwt({ sub: user.id, email: user.email, type: "refresh", sid }, REFRESH_SECRET, REFRESH_TTL_SECONDS);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000).toISOString();
  db.prepare(`
    INSERT INTO sessions (id, user_id, refresh_token_hash, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(sid, user.id, hashToken(refreshToken), expiresAt);
  return { user: publicUser(user), accessToken, refreshToken };
}

function requireUser(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = verifyJwt(token, ACCESS_SECRET);
  if (payload.type !== "access") throw new HttpError(401, "Access token required");
  const user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(payload.sub);
  if (!user) throw new HttpError(401, "User not found");
  return user;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function normalizeHighlightInput(body, fallbackId = randomUUID()) {
  const text = String(body.text || "").trim();
  if (!text) throw new HttpError(400, "Highlight text is required");
  return {
    id: body.id || fallbackId,
    clientId: String(body.clientId || body.id || fallbackId),
    kind: body.kind === "quote" ? "quote" : "highlight",
    text,
    sourceUrl: String(body.sourceUrl || ""),
    sourceSection: String(body.sourceSection || ""),
    articleId: String(body.articleId || ""),
    articleTitle: String(body.articleTitle || ""),
    note: String(body.note || ""),
    tag: String(body.tag || ""),
    color: String(body.color || "#E8C770"),
  };
}

function mapHighlight(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    kind: row.kind,
    text: row.text,
    sourceUrl: row.source_url || "",
    sourceSection: row.source_section || "",
    articleId: row.article_id || "",
    articleTitle: row.article_title || "",
    note: row.note || "",
    tag: row.tag || "",
    color: row.color || "#E8C770",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function handleSignup(req, res) {
  const body = await readJson(req);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  if (!validateEmail(email)) throw new HttpError(400, "A valid email is required");
  if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters");

  try {
    const result = db.prepare(`
      INSERT INTO users (email, name, password_hash)
      VALUES (?, ?, ?)
    `).run(email, name || null, hashPassword(password));
    const user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(result.lastInsertRowid);
    send(res, 201, createSession(user));
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) throw new HttpError(409, "An account with that email already exists");
    throw error;
  }
}

async function handleLogin(req, res) {
  const body = await readJson(req);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const user = db.prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?").get(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new HttpError(401, "Invalid email or password");
  }
  send(res, 200, createSession(user));
}

async function handleRefresh(req, res) {
  const body = await readJson(req);
  const refreshToken = String(body.refreshToken || "");
  const payload = verifyJwt(refreshToken, REFRESH_SECRET);
  if (payload.type !== "refresh" || !payload.sid) throw new HttpError(401, "Refresh token required");
  const session = db.prepare(`
    SELECT * FROM sessions
    WHERE id = ? AND user_id = ? AND revoked_at IS NULL
  `).get(payload.sid, payload.sub);
  if (!session || new Date(session.expires_at).getTime() < Date.now()) {
    throw new HttpError(401, "Refresh session expired");
  }
  if (session.refresh_token_hash !== hashToken(refreshToken)) {
    throw new HttpError(401, "Refresh token revoked");
  }
  const user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(payload.sub);
  const accessToken = signJwt({ sub: user.id, email: user.email, type: "access" }, ACCESS_SECRET, ACCESS_TTL_SECONDS);
  const nextRefreshToken = signJwt({ sub: user.id, email: user.email, type: "refresh", sid: session.id }, REFRESH_SECRET, REFRESH_TTL_SECONDS);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000).toISOString();
  db.prepare("UPDATE sessions SET refresh_token_hash = ?, expires_at = ? WHERE id = ?")
    .run(hashToken(nextRefreshToken), expiresAt, session.id);
  send(res, 200, { user: publicUser(user), accessToken, refreshToken: nextRefreshToken });
}

async function handleLogout(req, res) {
  const body = await readJson(req);
  const refreshToken = String(body.refreshToken || "");
  try {
    const payload = verifyJwt(refreshToken, REFRESH_SECRET);
    if (payload.sid) {
      db.prepare("UPDATE sessions SET revoked_at = datetime('now') WHERE id = ?").run(payload.sid);
    }
  } catch {}
  send(res, 204);
}

function listHighlights(req, res, user, url) {
  const kind = url.searchParams.get("kind");
  const rows = kind
    ? db.prepare("SELECT * FROM highlights WHERE user_id = ? AND kind = ? ORDER BY updated_at DESC").all(user.id, kind)
    : db.prepare("SELECT * FROM highlights WHERE user_id = ? ORDER BY updated_at DESC").all(user.id);
  send(res, 200, { highlights: rows.map(mapHighlight) });
}

async function createHighlight(req, res, user) {
  const item = normalizeHighlightInput(await readJson(req));
  const row = db.prepare(`
    INSERT INTO highlights (
      id, user_id, client_id, kind, text, source_url, source_section,
      article_id, article_title, note, tag, color, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, client_id) DO UPDATE SET
      kind = excluded.kind,
      text = excluded.text,
      source_url = excluded.source_url,
      source_section = excluded.source_section,
      article_id = excluded.article_id,
      article_title = excluded.article_title,
      note = excluded.note,
      tag = excluded.tag,
      color = excluded.color,
      updated_at = datetime('now')
    RETURNING *
  `).get(
    item.id, user.id, item.clientId, item.kind, item.text, item.sourceUrl,
    item.sourceSection, item.articleId, item.articleTitle, item.note,
    item.tag, item.color
  );
  send(res, 201, { highlight: mapHighlight(row) });
}

async function updateHighlight(req, res, user, id) {
  const current = db.prepare("SELECT * FROM highlights WHERE id = ? AND user_id = ?").get(id, user.id);
  if (!current) throw new HttpError(404, "Highlight not found");
  const body = await readJson(req);
  const next = normalizeHighlightInput({
    id,
    clientId: current.client_id,
    kind: body.kind ?? current.kind,
    text: body.text ?? current.text,
    sourceUrl: body.sourceUrl ?? current.source_url,
    sourceSection: body.sourceSection ?? current.source_section,
    articleId: body.articleId ?? current.article_id,
    articleTitle: body.articleTitle ?? current.article_title,
    note: body.note ?? current.note,
    tag: body.tag ?? current.tag,
    color: body.color ?? current.color,
  }, id);
  const row = db.prepare(`
    UPDATE highlights SET
      kind = ?, text = ?, source_url = ?, source_section = ?,
      article_id = ?, article_title = ?, note = ?, tag = ?,
      color = ?, updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
    RETURNING *
  `).get(
    next.kind, next.text, next.sourceUrl, next.sourceSection, next.articleId,
    next.articleTitle, next.note, next.tag, next.color, id, user.id
  );
  send(res, 200, { highlight: mapHighlight(row) });
}

function deleteHighlight(res, user, id) {
  const result = db.prepare("DELETE FROM highlights WHERE id = ? AND user_id = ?").run(id, user.id);
  if (!result.changes) throw new HttpError(404, "Highlight not found");
  send(res, 204);
}

export const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return send(res, 204);

  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const path = url.pathname;

    if (req.method === "GET" && path === "/api/health") {
      return send(res, 200, { ok: true, database: DB_PATH });
    }
    if (req.method === "POST" && path === "/api/auth/signup") return handleSignup(req, res);
    if (req.method === "POST" && path === "/api/auth/login") return handleLogin(req, res);
    if (req.method === "POST" && path === "/api/auth/refresh") return handleRefresh(req, res);
    if (req.method === "POST" && path === "/api/auth/logout") return handleLogout(req, res);

    if (req.method === "GET" && path === "/api/auth/me") {
      return send(res, 200, { user: publicUser(requireUser(req)) });
    }

    const user = path.startsWith("/api/highlights") ? requireUser(req) : null;
    if (req.method === "GET" && path === "/api/highlights") return listHighlights(req, res, user, url);
    if (req.method === "POST" && path === "/api/highlights") return createHighlight(req, res, user);

    const match = path.match(/^\/api\/highlights\/([^/]+)$/);
    if (match && req.method === "PATCH") return updateHighlight(req, res, user, decodeURIComponent(match[1]));
    if (match && req.method === "DELETE") return deleteHighlight(res, user, decodeURIComponent(match[1]));

    send(res, 404, { error: "Not found" });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    send(res, status, { error: error.message || "Server error" });
  }
});

export function startServer(port = PORT) {
  return server.listen(port, () => {
    console.log(`Athenaeum API listening on http://localhost:${port}`);
    console.log(`SQLite database: ${DB_PATH}`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
