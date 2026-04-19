/**
 * ═══════════════════════════════════════════════════════
 *  VPS Master Pro — Universal Database Layer
 * ═══════════════════════════════════════════════════════
 *
 *  Priority:
 *  1. Supabase (cloud) — if VITE_SUPABASE_URL is set
 *  2. API Backend       — if running on Pterodactyl
 *  3. localStorage      — offline fallback (browser only)
 *
 *  Data ALWAYS synced to cloud when available.
 *  On reconnect → cloud wins (authoritative).
 */

// ── Detect environment ────────────────────────────────────────────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || ''
const HAS_SUPABASE  = Boolean(SUPABASE_URL && SUPABASE_ANON)

// ── Supabase REST helpers (no SDK needed — raw fetch) ─────────────────────────
const sbFetch = async (path, opts = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Prefer':        'return=representation',
      ...opts.headers,
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase ${res.status}: ${err}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

// ══════════════════════════════════════════════════════
//  ACCOUNTS DB
// ══════════════════════════════════════════════════════

export const AccountsDB = {

  // ── Load all accounts ────────────────────────────────
  async getAll() {
    if (HAS_SUPABASE) {
      try {
        const rows = await sbFetch('accounts?select=*&order=created_at.asc')
        if (rows && rows.length > 0) {
          // Sync to localStorage as cache
          localStorage.setItem('vpm_accounts_cache', JSON.stringify(rows))
          return rows
        }
      } catch (e) {
        console.warn('[DB] Supabase getAccounts failed, using cache:', e.message)
      }
    }
    // Fallback: localStorage
    return _localGetAccounts()
  },

  // ── Save all accounts ────────────────────────────────
  async saveAll(accounts) {
    // Always save locally first (instant)
    localStorage.setItem('vpm_accounts_cache', JSON.stringify(accounts))

    if (HAS_SUPABASE) {
      try {
        // Upsert all accounts
        await sbFetch('accounts', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify(accounts.map(a => ({
            id:           a.id,
            username:     a.username,
            password:     a.password,
            role:         a.role,
            display_name: a.displayName,
            email:        a.email,
            avatar:       a.avatar,
            color:        a.color,
            active:       a.active !== false,
            created_by:   a.createdBy,
            created_at:   a.createdAt,
          }))),
        })
      } catch (e) {
        console.warn('[DB] Supabase saveAccounts failed:', e.message)
      }
    }
  },

  // ── Create one account ───────────────────────────────
  async create(account) {
    const all = await this.getAll()
    const updated = [...all.filter(a => a.id !== account.id), account]
    await this.saveAll(updated)
    return account
  },

  // ── Update one account ───────────────────────────────
  async update(id, patch) {
    const all = await this.getAll()
    const updated = all.map(a => a.id === id ? { ...a, ...patch } : a)
    await this.saveAll(updated)
  },

  // ── Delete one account ───────────────────────────────
  async delete(id) {
    const all = await this.getAll()
    const updated = all.filter(a => a.id !== id)
    await this.saveAll(updated)

    if (HAS_SUPABASE) {
      try {
        await sbFetch(`accounts?id=eq.${id}`, { method: 'DELETE' })
      } catch (e) {
        console.warn('[DB] Supabase deleteAccount failed:', e.message)
      }
    }

    // Also delete their servers
    await ServersDB.deleteAllForUser(id)
  },
}

// ══════════════════════════════════════════════════════
//  SERVERS DB (per-user isolated)
// ══════════════════════════════════════════════════════

export const ServersDB = {

  // ── Load servers for a user ──────────────────────────
  async getForUser(userId) {
    if (HAS_SUPABASE) {
      try {
        const rows = await sbFetch(`servers?user_id=eq.${userId}&select=*&order=created_at.asc`)
        if (rows) {
          const servers = rows.map(_rowToServer)
          localStorage.setItem(`vpm_srv_cache_${userId}`, JSON.stringify(servers))
          return servers
        }
      } catch (e) {
        console.warn('[DB] Supabase getServers failed, using cache:', e.message)
      }
    }
    // Fallback: localStorage cache
    try {
      const raw = localStorage.getItem(`vpm_servers_${userId}`) ||
                  localStorage.getItem(`vpm_srv_cache_${userId}`)
      if (raw) return JSON.parse(raw)
    } catch (_) {}
    return []
  },

  // ── Save all servers for a user ──────────────────────
  async saveForUser(userId, servers) {
    // Always local first
    localStorage.setItem(`vpm_servers_${userId}`, JSON.stringify(servers))
    localStorage.setItem(`vpm_srv_cache_${userId}`, JSON.stringify(servers))

    if (HAS_SUPABASE) {
      try {
        // Delete existing and re-insert (simple upsert)
        await sbFetch(`servers?user_id=eq.${userId}`, { method: 'DELETE' })
        if (servers.length > 0) {
          await sbFetch('servers', {
            method: 'POST',
            headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify(servers.map(s => _serverToRow(userId, s))),
          })
        }
      } catch (e) {
        console.warn('[DB] Supabase saveServers failed:', e.message)
      }
    }
  },

  // ── Delete all servers for a user ───────────────────
  async deleteAllForUser(userId) {
    localStorage.removeItem(`vpm_servers_${userId}`)
    localStorage.removeItem(`vpm_srv_cache_${userId}`)

    if (HAS_SUPABASE) {
      try {
        await sbFetch(`servers?user_id=eq.${userId}`, { method: 'DELETE' })
      } catch (e) {
        console.warn('[DB] Supabase deleteServers failed:', e.message)
      }
    }
  },
}

// ══════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════

const DEFAULT_ADMIN = {
  id:          'user_admin_wanzz',
  username:    'wanzz',
  password:    'wanzz3369',
  role:        'admin',
  displayName: 'Wanz Admin',
  email:       'admin@vpsmaster.pro',
  avatar:      'WZ',
  color:       'linear-gradient(135deg,#ef4444,#dc2626)',
  createdAt:   1700000000000,
  createdBy:   'system',
  active:      true,
}

function _localGetAccounts() {
  try {
    const keys = ['vpm_accounts_cache', 'vpm_auth_v1', 'vpm_auth_v2']
    for (const key of keys) {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasAdmin = parsed.find(a => a.id === DEFAULT_ADMIN.id)
          if (!hasAdmin) parsed.unshift(DEFAULT_ADMIN)
          return parsed
        }
      }
    }
  } catch (_) {}
  const accounts = [DEFAULT_ADMIN]
  localStorage.setItem('vpm_accounts_cache', JSON.stringify(accounts))
  return accounts
}

function _serverToRow(userId, s) {
  return {
    id:         s.id,
    user_id:    userId,
    name:       s.name,
    ip:         s.ip,
    port:       s.port || '22',
    provider:   s.provider || '',
    os:         s.os || '',
    region:     s.region || '',
    tags:       JSON.stringify(s.tags || []),
    notes:      s.notes || '',
    status:     s.status || 'offline',
    uptime:     s.uptime || '0d',
    created_at: s.createdAt || Date.now(),
  }
}

function _rowToServer(row) {
  return {
    id:         row.id,
    name:       row.name,
    ip:         row.ip,
    port:       row.port,
    provider:   row.provider,
    os:         row.os,
    region:     row.region,
    tags:       _parseJSON(row.tags, []),
    notes:      row.notes,
    status:     row.status || 'offline',
    uptime:     row.uptime || '0d',
    createdAt:  row.created_at,
    lastCheck:  null,
    geoInfo:    null,
    metrics:    null,
    history:    null,
  }
}

function _parseJSON(str, fallback) {
  try { return JSON.parse(str) } catch { return fallback }
}

// ── Connection status ─────────────────────────────────
export const dbStatus = () => ({
  mode:       HAS_SUPABASE ? 'supabase' : 'localStorage',
  supabaseUrl: SUPABASE_URL || null,
  connected:   HAS_SUPABASE,
})
