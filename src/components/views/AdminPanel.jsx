import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Shield, ShieldOff, Key, X, UserCheck, UserX, Server } from 'lucide-react'
import { getAccounts, createUser, deleteUser, toggleUserActive, updateUserPassword } from '../../auth/authStore'
import { ServersDB } from '../../lib/db'
import { Button } from '../ui'

export default function AdminPanel({ currentUser, onToast }) {
  const [accounts, setAccounts]   = useState([])
  const [showAdd,  setShowAdd]    = useState(false)
  const [editPwId, setEditPwId]   = useState(null)
  const [newPw,    setNewPw]      = useState('')
  const [form,     setForm]       = useState({
    username: '', password: '', displayName: '', email: '', role: 'user',
  })
  const [err, setErr] = useState('')

  // Load accounts on mount
  useEffect(() => { refresh() }, [])

  const refresh = () => { getAccounts().then(a => setAccounts(a)).catch(() => {}) }

  const handleCreate = async (e) => {
    e.preventDefault()
    setErr('')
    const result = await createUser(currentUser, form)
    if (!result.ok) { setErr(result.error); return }
    refresh()
    setShowAdd(false)
    setForm({ username: '', password: '', displayName: '', email: '', role: 'user' })
    onToast(`Akun "${result.user.username}" berhasil dibuat!`, 'success')
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Hapus akun "${user.username}"? Data server mereka juga akan dihapus.`)) return
    const result = await deleteUser(currentUser, user.id)
    if (!result.ok) { onToast(result.error, 'error'); return }
    refresh()
    onToast(`Akun "${user.username}" dihapus.`, 'info')
  }

  const handleToggle = async (user) => {
    const result = await toggleUserActive(currentUser, user.id)
    if (!result.ok) { onToast(result.error, 'error'); return }
    refresh()
    onToast(`Akun "${user.username}" ${user.active ? 'dinonaktifkan' : 'diaktifkan'}.`, 'info')
  }

  const handlePwUpdate = async (user) => {
    if (!newPw) return
    const result = await updateUserPassword(currentUser, user.id, newPw)
    if (!result.ok) { onToast(result.error, 'error'); return }
    setEditPwId(null); setNewPw('')
    onToast(`Password "${user.username}" diperbarui.`, 'success')
  }

  const getServerCount = (userId) => {
    try {
      const raw = localStorage.getItem(`vpm_servers_${userId}`) || localStorage.getItem(`vpm_srv_cache_${userId}`)
      if (raw) { const d = JSON.parse(raw); return Array.isArray(d) ? d.length : 0 }
    } catch (_) {}
    return 0
  }

  const inpStyle = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(30,45,80,0.8)', borderRadius: 8,
    padding: '8px 12px', color: '#e2e8f0', fontSize: 13,
    outline: 'none', fontFamily: 'var(--sans)',
    boxSizing: 'border-box',
  }
  const labelStyle = {
    display: 'block', fontSize: 10, color: '#475569',
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5,
  }

  const others = accounts.filter(a => a.id !== currentUser.id)
  const self   = accounts.find(a => a.id === currentUser.id)

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[
          { label: 'Total Akun',   val: accounts.length,                         color: '#3b82f6', icon: Users },
          { label: 'Akun Aktif',   val: accounts.filter(a=>a.active!==false).length, color: '#10b981', icon: UserCheck },
          { label: 'Akun Nonaktif',val: accounts.filter(a=>a.active===false).length, color: '#ef4444', icon: UserX },
        ].map(({ label, val, color, icon: Icon }) => (
          <div key={label} style={{
            background: 'rgba(8,15,30,0.85)', border: '1px solid rgba(20,30,55,0.9)',
            borderRadius: 14, padding: '18px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: 7, background: `${color}18`, border: `1px solid ${color}30`, borderRadius: 8 }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* User table */}
      <div style={{ background: 'rgba(8,15,30,0.85)', border: '1px solid rgba(20,30,55,0.9)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Manajemen Pengguna</span>
            <span style={{ fontSize: 12, color: '#334155', marginLeft: 10 }}>{accounts.length} akun terdaftar</span>
          </div>
          <Button variant="primary" size="sm" onClick={() => { setShowAdd(true); setErr('') }}>
            <Plus size={14} /> Buat Akun Baru
          </Button>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
          padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)',
          fontSize: 10, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          <span>Pengguna</span><span>Role</span><span>Server</span><span>Status</span><span>Aksi</span>
        </div>

        {/* Rows */}
        {accounts.map(user => {
          const srvCount  = getServerCount(user.id)
          const isActive  = user.active !== false
          const isSelf    = user.id === currentUser.id
          const isAdminAcc = user.role === 'admin'

          return (
            <div key={user.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
              padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.025)',
              alignItems: 'center', transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* User info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: user.color || 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {user.avatar || user.username[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {user.displayName || user.username}
                    {isSelf && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 5, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontWeight: 700 }}>ANDA</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#334155', fontFamily: 'var(--mono)' }}>@{user.username}</div>
                </div>
              </div>

              {/* Role */}
              <span style={{
                fontSize: 10, padding: '3px 9px', borderRadius: 6, fontWeight: 700,
                background: user.role === 'admin' ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
                color: user.role === 'admin' ? '#f87171' : '#60a5fa',
                border: `1px solid ${user.role === 'admin' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
                width: 'fit-content',
              }}>
                {user.role === 'admin' ? '👑 ADMIN' : '👤 USER'}
              </span>

              {/* Server count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Server size={13} style={{ color: '#334155' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: srvCount > 0 ? '#e2e8f0' : '#334155' }}>
                  {srvCount}
                </span>
              </div>

              {/* Status */}
              <span style={{
                fontSize: 10, padding: '3px 9px', borderRadius: 6, fontWeight: 700,
                background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)',
                color: isActive ? '#10b981' : '#ef4444',
                border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.18)'}`,
                width: 'fit-content',
              }}>
                {isActive ? '● Aktif' : '○ Nonaktif'}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {!isSelf && (
                  <>
                    {/* Toggle active */}
                    <button onClick={() => handleToggle(user)}
                      title={isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      style={{
                        padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
                        background: isActive ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                        border: `1px solid ${isActive ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`,
                        color: isActive ? '#f59e0b' : '#10b981', fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--sans)',
                      }}>
                      {isActive ? <><ShieldOff size={11} /> Nonaktif</> : <><Shield size={11} /> Aktifkan</>}
                    </button>

                    {/* Change password */}
                    <button onClick={() => { setEditPwId(editPwId === user.id ? null : user.id); setNewPw('') }}
                      title="Ganti password"
                      style={{
                        padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
                        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
                        color: '#60a5fa', fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--sans)',
                      }}>
                      <Key size={11} /> Password
                    </button>

                    {/* Delete (not admin) */}
                    {!isAdminAcc && (
                      <button onClick={() => handleDelete(user)}
                        title="Hapus akun"
                        style={{
                          padding: '5px 8px', borderRadius: 7, cursor: 'pointer',
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                          color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                        <Trash2 size={11} />
                      </button>
                    )}
                  </>
                )}
                {isSelf && (
                  <span style={{ fontSize: 11, color: '#1e3a5f', fontStyle: 'italic' }}>—</span>
                )}
              </div>

              {/* Inline password editor */}
              {editPwId === user.id && (
                <div style={{
                  gridColumn: '1 / -1', marginTop: 10,
                  padding: '12px 14px',
                  background: 'rgba(59,130,246,0.05)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: 9,
                  display: 'flex', gap: 8, alignItems: 'center',
                }}>
                  <input
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="Password baru..."
                    type="text"
                    autoFocus
                    style={{ ...inpStyle, flex: 1, padding: '7px 12px' }}
                  />
                  <button onClick={() => handlePwUpdate(user)} style={{
                    padding: '7px 14px', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                    border: 'none', borderRadius: 7, color: '#fff', fontWeight: 700,
                    fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)',
                  }}>Simpan</button>
                  <button onClick={() => { setEditPwId(null); setNewPw('') }} style={{
                    padding: '7px', background: 'transparent', border: 'none',
                    color: '#475569', cursor: 'pointer',
                  }}><X size={14} /></button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info box */}
      <div style={{
        padding: '14px 18px',
        background: 'rgba(59,130,246,0.05)',
        border: '1px solid rgba(59,130,246,0.15)',
        borderRadius: 12, fontSize: 12, color: '#475569', lineHeight: 1.7,
      }}>
        <strong style={{ color: '#60a5fa' }}>ℹ Info Keamanan:</strong> Setiap akun memiliki database server yang terpisah dan terisolasi.
        Data VPS satu pengguna tidak dapat dilihat oleh pengguna lain. Hanya admin yang dapat mengelola akun.
      </div>

      {/* Create user modal */}
      {showAdd && (
        <div className="fade-in"
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)', zIndex: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}>
          <div style={{
            background: 'rgba(6,12,26,0.98)', border: '1px solid rgba(30,45,80,0.9)',
            borderRadius: 20, width: '100%', maxWidth: 440,
            boxShadow: '0 30px 80px rgba(0,0,0,0.7)', overflow: 'hidden',
          }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>👤 Buat Akun Baru</span>
              <button onClick={() => { setShowAdd(false); setErr('') }} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {err && (
                <div style={{ padding: '10px 13px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
                  ⚠ {err}
                </div>
              )}

              <div>
                <label style={labelStyle}>Username *</label>
                <input required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="contoh: john123" style={inpStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(30,45,80,0.8)'} />
              </div>

              <div>
                <label style={labelStyle}>Password *</label>
                <input required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Minimal 6 karakter" type="text" style={inpStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(30,45,80,0.8)'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Nama Lengkap</label>
                  <input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                    placeholder="John Doe" style={inpStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(30,45,80,0.8)'} />
                </div>
                <div>
                  <label style={labelStyle}>Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    style={{ ...inpStyle, cursor: 'pointer', background: 'rgba(6,12,26,0.95)' }}>
                    <option value="user">👤 User</option>
                    <option value="admin">👑 Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email (opsional)</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@domain.com" type="email" style={inpStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(30,45,80,0.8)'} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => { setShowAdd(false); setErr('') }}
                  style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border2)', borderRadius: 9, color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'var(--sans)' }}>
                  Batal
                </button>
                <button type="submit"
                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 9, color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: 13, fontFamily: 'var(--sans)', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
                  ✓ Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
