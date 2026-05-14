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

CREATE TABLE IF NOT EXISTS vocabulary (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  word TEXT NOT NULL,
  ipa TEXT,
  ar TEXT,
  def TEXT,
  source_url TEXT,
  source_section TEXT,
  note TEXT,
  tag TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, client_id),
  UNIQUE(user_id, word)
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_user_updated ON vocabulary(user_id, updated_at DESC);
