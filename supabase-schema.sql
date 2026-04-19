-- ═══════════════════════════════════════════════════════════════
--  VPS Master Pro — Supabase Database Schema
--  Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ── Drop existing (jika perlu reset) ──────────────────────────
-- DROP TABLE IF EXISTS servers;
-- DROP TABLE IF EXISTS accounts;

-- ── Table: accounts ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id           TEXT PRIMARY KEY,
  username     TEXT NOT NULL UNIQUE,
  password     TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'user',
  display_name TEXT,
  email        TEXT,
  avatar       TEXT,
  color        TEXT,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_by   TEXT,
  created_at   BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
);

-- ── Table: servers ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS servers (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  ip         TEXT NOT NULL,
  port       TEXT DEFAULT '22',
  provider   TEXT,
  os         TEXT,
  region     TEXT,
  tags       TEXT DEFAULT '[]',
  notes      TEXT DEFAULT '',
  status     TEXT DEFAULT 'offline',
  uptime     TEXT DEFAULT '0d',
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_servers_user_id ON servers(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);

-- ── RLS (Row Level Security) — PUBLIC access via anon key ─────
-- Karena kita handle auth sendiri di frontend, disable RLS
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE servers  DISABLE ROW LEVEL SECURITY;

-- ── Seed default admin account ────────────────────────────────
INSERT INTO accounts (id, username, password, role, display_name, email, avatar, color, active, created_by, created_at)
VALUES (
  'user_admin_wanzz',
  'wanzz',
  'wanzz3369',
  'admin',
  'Wanz Admin',
  'admin@vpsmaster.pro',
  'WZ',
  'linear-gradient(135deg,#ef4444,#dc2626)',
  true,
  'system',
  1700000000000
)
ON CONFLICT (id) DO NOTHING;

-- ── Verify ────────────────────────────────────────────────────
SELECT 'accounts' as table_name, count(*) as rows FROM accounts
UNION ALL
SELECT 'servers', count(*) FROM servers;
