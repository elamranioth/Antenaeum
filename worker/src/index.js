const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;
const PASSWORD_ITERATIONS = 310000;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.CORS_ORIGIN || "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Vary": "Origin",
  };
}

function send(env, status, payload = null) {
  return new Response(payload === null ? "" : JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(env),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function readJson(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 1_000_000) throw new HttpError(413, "Request body too large");
  const raw = await request.text();
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlToBytes(value) {
  const base64 = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function textToBase64Url(text) {
  return bytesToBase64Url(textEncoder.encode(text));
}

function base64UrlToText(value) {
  return textDecoder.decode(base64UrlToBytes(value));
}

function constantTimeEqual(a, b) {
  const left = textEncoder.encode(String(a || ""));
  const right = textEncoder.encode(String(b || ""));
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (left[i] || 0) ^ (right[i] || 0);
  }
  return diff === 0;
}

function requireSecret(env, key) {
  const value = env[key];
  if (!value) throw new HttpError(500, `Missing ${key}`);
  return value;
}

async function hmacBase64Url(secret, data) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(data));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function signJwt(env, payload, secretKey, ttlSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const header = textToBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = textToBase64Url(JSON.stringify({ ...payload, iat: now, exp: now + ttlSeconds }));
  const secret = requireSecret(env, secretKey);
  const signature = await hmacBase64Url(secret, `${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

async function verifyJwt(env, token, secretKey) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new HttpError(401, "Invalid token");
  const [header, body, signature] = parts;
  const expected = await hmacBase64Url(requireSecret(env, secretKey), `${header}.${body}`);
  if (!constantTimeEqual(signature, expected)) throw new HttpError(401, "Invalid token");
  const payload = JSON.parse(base64UrlToText(body));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, "Token expired");
  }
  return payload;
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await crypto.subtle.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PASSWORD_ITERATIONS },
    key,
    256,
  );
  return `pbkdf2$${PASSWORD_ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(new Uint8Array(bits))}`;
}

async function verifyPassword(password, stored) {
  const [scheme, iterations, salt, hash] = String(stored || "").split("$");
  if (scheme !== "pbkdf2" || !iterations || !salt || !hash) return false;
  const key = await crypto.subtle.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: base64UrlToBytes(salt),
      iterations: Number(iterations),
    },
    key,
    256,
  );
  return constantTimeEqual(bytesToBase64Url(new Uint8Array(bits)), hash);
}

async function hashToken(env, token) {
  return hmacBase64Url(requireSecret(env, "JWT_REFRESH_SECRET"), token);
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email,
  };
}

async function createSession(env, user) {
  const sid = crypto.randomUUID();
  const accessTtl = Number(env.ACCESS_TOKEN_TTL_SECONDS || ACCESS_TTL_SECONDS);
  const refreshTtl = Number(env.REFRESH_TOKEN_TTL_SECONDS || REFRESH_TTL_SECONDS);
  const accessToken = await signJwt(env, { sub: user.id, email: user.email, type: "access" }, "JWT_SECRET", accessTtl);
  const refreshToken = await signJwt(env, { sub: user.id, email: user.email, type: "refresh", sid }, "JWT_REFRESH_SECRET", refreshTtl);
  const expiresAt = new Date(Date.now() + refreshTtl * 1000).toISOString();
  await env.DB.prepare(`
    INSERT INTO sessions (id, user_id, refresh_token_hash, expires_at)
    VALUES (?, ?, ?, ?)
  `).bind(sid, user.id, await hashToken(env, refreshToken), expiresAt).run();
  return { user: publicUser(user), accessToken, refreshToken };
}

async function requireUser(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = await verifyJwt(env, token, "JWT_SECRET");
  if (payload.type !== "access") throw new HttpError(401, "Access token required");
  const user = await env.DB.prepare("SELECT id, email, name FROM users WHERE id = ?").bind(payload.sub).first();
  if (!user) throw new HttpError(401, "User not found");
  return user;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function normalizeHighlightInput(body, fallbackId = crypto.randomUUID()) {
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

function normalizeVocabularyInput(body, fallbackId = crypto.randomUUID()) {
  const word = String(body.word || "").trim().toLowerCase().replace(/[^a-z'-]/g, "").slice(0, 64);
  if (!word) throw new HttpError(400, "Vocabulary word is required");
  return {
    id: body.id || fallbackId,
    clientId: String(body.clientId || body.id || fallbackId),
    word,
    ipa: String(body.ipa || ""),
    ar: String(body.ar || ""),
    def: String(body.def || "Saved from your reading. Add a definition later."),
    sourceUrl: String(body.sourceUrl || ""),
    sourceSection: String(body.sourceSection || ""),
    note: String(body.note || ""),
    tag: String(body.tag || ""),
  };
}

function mapVocabulary(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    word: row.word,
    ipa: row.ipa || "",
    ar: row.ar || "",
    def: row.def || "",
    sourceUrl: row.source_url || "",
    sourceSection: row.source_section || "",
    note: row.note || "",
    tag: row.tag || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function handleSignup(request, env) {
  const body = await readJson(request);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  if (!validateEmail(email)) throw new HttpError(400, "A valid email is required");
  if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters");

  try {
    const user = await env.DB.prepare(`
      INSERT INTO users (email, name, password_hash)
      VALUES (?, ?, ?)
      RETURNING id, email, name
    `).bind(email, name || null, await hashPassword(password)).first();
    return send(env, 201, await createSession(env, user));
  } catch (error) {
    if (String(error.message || "").includes("UNIQUE")) {
      throw new HttpError(409, "An account with that email already exists");
    }
    throw error;
  }
}

async function handleLogin(request, env) {
  const body = await readJson(request);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const user = await env.DB.prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?").bind(email).first();
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new HttpError(401, "Invalid email or password");
  }
  return send(env, 200, await createSession(env, user));
}

async function handleRefresh(request, env) {
  const body = await readJson(request);
  const refreshToken = String(body.refreshToken || "");
  const payload = await verifyJwt(env, refreshToken, "JWT_REFRESH_SECRET");
  if (payload.type !== "refresh" || !payload.sid) throw new HttpError(401, "Refresh token required");
  const session = await env.DB.prepare(`
    SELECT * FROM sessions
    WHERE id = ? AND user_id = ? AND revoked_at IS NULL
  `).bind(payload.sid, payload.sub).first();
  if (!session || new Date(session.expires_at).getTime() < Date.now()) {
    throw new HttpError(401, "Refresh session expired");
  }
  if (!constantTimeEqual(session.refresh_token_hash, await hashToken(env, refreshToken))) {
    throw new HttpError(401, "Refresh token revoked");
  }
  const user = await env.DB.prepare("SELECT id, email, name FROM users WHERE id = ?").bind(payload.sub).first();
  const refreshTtl = Number(env.REFRESH_TOKEN_TTL_SECONDS || REFRESH_TTL_SECONDS);
  const accessTtl = Number(env.ACCESS_TOKEN_TTL_SECONDS || ACCESS_TTL_SECONDS);
  const accessToken = await signJwt(env, { sub: user.id, email: user.email, type: "access" }, "JWT_SECRET", accessTtl);
  const nextRefreshToken = await signJwt(env, { sub: user.id, email: user.email, type: "refresh", sid: session.id }, "JWT_REFRESH_SECRET", refreshTtl);
  const expiresAt = new Date(Date.now() + refreshTtl * 1000).toISOString();
  await env.DB.prepare("UPDATE sessions SET refresh_token_hash = ?, expires_at = ? WHERE id = ?")
    .bind(await hashToken(env, nextRefreshToken), expiresAt, session.id)
    .run();
  return send(env, 200, { user: publicUser(user), accessToken, refreshToken: nextRefreshToken });
}

async function handleLogout(request, env) {
  try {
    const body = await readJson(request);
    const payload = await verifyJwt(env, String(body.refreshToken || ""), "JWT_REFRESH_SECRET");
    if (payload.sid) {
      await env.DB.prepare("UPDATE sessions SET revoked_at = datetime('now') WHERE id = ?").bind(payload.sid).run();
    }
  } catch {}
  return send(env, 204);
}

async function listHighlights(env, user, url) {
  const kind = url.searchParams.get("kind");
  const query = kind
    ? env.DB.prepare("SELECT * FROM highlights WHERE user_id = ? AND kind = ? ORDER BY updated_at DESC").bind(user.id, kind)
    : env.DB.prepare("SELECT * FROM highlights WHERE user_id = ? ORDER BY updated_at DESC").bind(user.id);
  const { results } = await query.all();
  return send(env, 200, { highlights: (results || []).map(mapHighlight) });
}

async function createHighlight(request, env, user) {
  const item = normalizeHighlightInput(await readJson(request));
  const row = await env.DB.prepare(`
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
  `).bind(
    item.id, user.id, item.clientId, item.kind, item.text, item.sourceUrl,
    item.sourceSection, item.articleId, item.articleTitle, item.note,
    item.tag, item.color,
  ).first();
  return send(env, 201, { highlight: mapHighlight(row) });
}

async function updateHighlight(request, env, user, id) {
  const current = await env.DB.prepare("SELECT * FROM highlights WHERE id = ? AND user_id = ?").bind(id, user.id).first();
  if (!current) throw new HttpError(404, "Highlight not found");
  const body = await readJson(request);
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
  const row = await env.DB.prepare(`
    UPDATE highlights SET
      kind = ?, text = ?, source_url = ?, source_section = ?,
      article_id = ?, article_title = ?, note = ?, tag = ?,
      color = ?, updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
    RETURNING *
  `).bind(
    next.kind, next.text, next.sourceUrl, next.sourceSection, next.articleId,
    next.articleTitle, next.note, next.tag, next.color, id, user.id,
  ).first();
  return send(env, 200, { highlight: mapHighlight(row) });
}

async function deleteHighlight(env, user, id) {
  const result = await env.DB.prepare("DELETE FROM highlights WHERE id = ? AND user_id = ?").bind(id, user.id).run();
  if (!result.meta?.changes) throw new HttpError(404, "Highlight not found");
  return send(env, 204);
}

async function listVocabulary(env, user) {
  const { results } = await env.DB.prepare("SELECT * FROM vocabulary WHERE user_id = ? ORDER BY updated_at DESC").bind(user.id).all();
  return send(env, 200, { vocabulary: (results || []).map(mapVocabulary) });
}

async function createVocabulary(request, env, user) {
  const item = normalizeVocabularyInput(await readJson(request));
  const row = await env.DB.prepare(`
    INSERT INTO vocabulary (
      id, user_id, client_id, word, ipa, ar, def, source_url,
      source_section, note, tag, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, word) DO UPDATE SET
      client_id = excluded.client_id,
      ipa = excluded.ipa,
      ar = excluded.ar,
      def = excluded.def,
      source_url = excluded.source_url,
      source_section = excluded.source_section,
      note = excluded.note,
      tag = excluded.tag,
      updated_at = datetime('now')
    RETURNING *
  `).bind(
    item.id, user.id, item.clientId, item.word, item.ipa, item.ar, item.def,
    item.sourceUrl, item.sourceSection, item.note, item.tag,
  ).first();
  return send(env, 201, { item: mapVocabulary(row) });
}

async function updateVocabulary(request, env, user, id) {
  const current = await env.DB.prepare("SELECT * FROM vocabulary WHERE id = ? AND user_id = ?").bind(id, user.id).first();
  if (!current) throw new HttpError(404, "Vocabulary item not found");
  const body = await readJson(request);
  const next = normalizeVocabularyInput({
    id,
    clientId: current.client_id,
    word: body.word ?? current.word,
    ipa: body.ipa ?? current.ipa,
    ar: body.ar ?? current.ar,
    def: body.def ?? current.def,
    sourceUrl: body.sourceUrl ?? current.source_url,
    sourceSection: body.sourceSection ?? current.source_section,
    note: body.note ?? current.note,
    tag: body.tag ?? current.tag,
  }, id);
  const row = await env.DB.prepare(`
    UPDATE vocabulary SET
      word = ?, ipa = ?, ar = ?, def = ?, source_url = ?,
      source_section = ?, note = ?, tag = ?, updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
    RETURNING *
  `).bind(
    next.word, next.ipa, next.ar, next.def, next.sourceUrl,
    next.sourceSection, next.note, next.tag, id, user.id,
  ).first();
  return send(env, 200, { item: mapVocabulary(row) });
}

async function deleteVocabulary(env, user, id) {
  const result = await env.DB.prepare("DELETE FROM vocabulary WHERE id = ? AND user_id = ?").bind(id, user.id).run();
  if (!result.meta?.changes) throw new HttpError(404, "Vocabulary item not found");
  return send(env, 204);
}

async function route(request, env) {
  if (request.method === "OPTIONS") return send(env, 204);
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "GET" && path === "/api/health") {
    return send(env, 200, { ok: true, database: "d1", runtime: "cloudflare-worker" });
  }
  if (request.method === "POST" && path === "/api/auth/signup") return handleSignup(request, env);
  if (request.method === "POST" && path === "/api/auth/login") return handleLogin(request, env);
  if (request.method === "POST" && path === "/api/auth/refresh") return handleRefresh(request, env);
  if (request.method === "POST" && path === "/api/auth/logout") return handleLogout(request, env);

  if (request.method === "GET" && path === "/api/auth/me") {
    return send(env, 200, { user: publicUser(await requireUser(request, env)) });
  }

  const protectedRoute = path.startsWith("/api/highlights") || path.startsWith("/api/vocabulary");
  const user = protectedRoute ? await requireUser(request, env) : null;

  if (request.method === "GET" && path === "/api/highlights") return listHighlights(env, user, url);
  if (request.method === "POST" && path === "/api/highlights") return createHighlight(request, env, user);
  const highlightMatch = path.match(/^\/api\/highlights\/([^/]+)$/);
  if (highlightMatch && request.method === "PATCH") return updateHighlight(request, env, user, decodeURIComponent(highlightMatch[1]));
  if (highlightMatch && request.method === "DELETE") return deleteHighlight(env, user, decodeURIComponent(highlightMatch[1]));

  if (request.method === "GET" && path === "/api/vocabulary") return listVocabulary(env, user);
  if (request.method === "POST" && path === "/api/vocabulary") return createVocabulary(request, env, user);
  const vocabularyMatch = path.match(/^\/api\/vocabulary\/([^/]+)$/);
  if (vocabularyMatch && request.method === "PATCH") return updateVocabulary(request, env, user, decodeURIComponent(vocabularyMatch[1]));
  if (vocabularyMatch && request.method === "DELETE") return deleteVocabulary(env, user, decodeURIComponent(vocabularyMatch[1]));

  return send(env, 404, { error: "Not found" });
}

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      return send(env, status, { error: error.message || "Server error" });
    }
  },
};
