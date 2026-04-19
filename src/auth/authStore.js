/**
 * Auth Store — uses universal DB layer (Supabase cloud or localStorage fallback)
 */
import { AccountsDB, ServersDB } from '../lib/db'

const SESSION_KEY = 'vpm_session_v3'

// ── Default admin (always exists) ─────────────────────────────────────────────
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

// ── Sync accounts (ensure admin exists) ─────────────────────────────────────
export const getAccounts = async () => {
  const accounts = await AccountsDB.getAll()
  const hasAdmin = accounts.find(a => a.id === DEFAULT_ADMIN.id)
  if (!hasAdmin) {
    const withAdmin = [DEFAULT_ADMIN, ...accounts]
    await AccountsDB.saveAll(withAdmin)
    return withAdmin
  }
  return accounts
}

// ── Sync wrapper (returns cached immediately, then updates) ──────────────────
let _accountsCache = null
export const getAccountsSync = () => {
  if (_accountsCache) return _accountsCache
  // Fallback from localStorage until async resolves
  try {
    const raw = localStorage.getItem('vpm_accounts_cache')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        _accountsCache = parsed
        return parsed
      }
    }
  } catch (_) {}
  _accountsCache = [DEFAULT_ADMIN]
  return _accountsCache
}

// Warm up cache on load
getAccounts().then(a => { _accountsCache = a }).catch(() => {})

// ── Session ──────────────────────────────────────────────────────────────────
export const getSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      const sess = JSON.parse(raw)
      if (sess && Date.now() - sess.loginAt < 8 * 3600 * 1000) return sess
    }
  } catch (_) {}
  return null
}

export const setSession = (user) => {
  const sess = { ...user, loginAt: Date.now() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(sess))
  return sess
}

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY)
}

// ── Login ────────────────────────────────────────────────────────────────────
export const login = async (username, password) => {
  const accounts = await getAccounts()
  const user = accounts.find(
    a => a.username.toLowerCase() === username.toLowerCase().trim()
      && a.password === password
      && a.active !== false
  )
  if (!user) return { ok: false, error: 'Username atau password salah.' }
  const sess = setSession(user)
  return { ok: true, user: sess }
}

// ── Create user ──────────────────────────────────────────────────────────────
export const createUser = async (adminUser, form) => {
  if (adminUser.role !== 'admin') return { ok: false, error: 'Akses ditolak.' }
  const accounts = await getAccounts()
  if (accounts.find(a => a.username.toLowerCase() === form.username.toLowerCase().trim()))
    return { ok: false, error: 'Username sudah digunakan.' }
  if (!form.username || !form.password)
    return { ok: false, error: 'Username dan password wajib diisi.' }

  const initials = (form.displayName || form.username)
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const colors = [
    'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#06b6d4,#0891b2)',
    'linear-gradient(135deg,#ec4899,#db2777)',
  ]

  const newUser = {
    id:          `user_${form.username.toLowerCase()}_${Date.now()}`,
    username:    form.username.trim(),
    password:    form.password,
    role:        form.role || 'user',
    displayName: form.displayName || form.username,
    email:       form.email || `${form.username}@vpsmaster.pro`,
    avatar:      initials,
    color:       colors[accounts.length % colors.length],
    createdAt:   Date.now(),
    createdBy:   adminUser.username,
    active:      true,
  }

  await AccountsDB.create(newUser)
  _accountsCache = null // invalidate cache
  return { ok: true, user: newUser }
}

// ── Delete user ──────────────────────────────────────────────────────────────
export const deleteUser = async (adminUser, userId) => {
  if (adminUser.role !== 'admin') return { ok: false, error: 'Akses ditolak.' }
  if (userId === adminUser.id)    return { ok: false, error: 'Tidak dapat menghapus akun sendiri.' }
  if (userId === DEFAULT_ADMIN.id) return { ok: false, error: 'Akun admin utama tidak dapat dihapus.' }
  await AccountsDB.delete(userId)
  _accountsCache = null
  return { ok: true }
}

// ── Toggle active ────────────────────────────────────────────────────────────
export const toggleUserActive = async (adminUser, userId) => {
  if (adminUser.role !== 'admin') return { ok: false, error: 'Akses ditolak.' }
  const accounts = await getAccounts()
  const user = accounts.find(a => a.id === userId)
  if (!user) return { ok: false, error: 'User tidak ditemukan.' }
  await AccountsDB.update(userId, { active: !user.active })
  _accountsCache = null
  return { ok: true }
}

// ── Update password ──────────────────────────────────────────────────────────
export const updateUserPassword = async (adminUser, userId, newPw) => {
  if (adminUser.role !== 'admin') return { ok: false, error: 'Akses ditolak.' }
  await AccountsDB.update(userId, { password: newPw })
  _accountsCache = null
  return { ok: true }
}

// ── Storage key (kept for compatibility) ─────────────────────────────────────
export const userStorageKey = (userId) => `vpm_servers_${userId}`
