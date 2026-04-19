import { useState, useEffect } from 'react'
import { Server, Eye, EyeOff, Lock, User, Zap } from 'lucide-react'
import { login } from '../auth/authStore'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) { setError('Isi username dan password.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 700)) // realistic delay
    const result = await login(username, password)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    onLogin(result.user)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '44px 44px',
        pointerEvents: 'none',
      }} />
      {/* Glow orbs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 400,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-10%', right: '-10%',
        width: 400, height: 400,
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 400,
        padding: '0 20px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Logo header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(59,130,246,0.35)',
          }}>
            <Server size={26} style={{ color: '#fff' }} />
          </div>
          <h1 style={{
            fontSize: 24, fontWeight: 800, color: '#f1f5f9',
            letterSpacing: '-0.03em', marginBottom: 6,
          }}>VPS Master Pro</h1>
          <p style={{ fontSize: 13, color: '#334155' }}>
            Masuk ke dashboard monitoring Anda
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'rgba(8,15,30,0.9)',
          border: '1px solid rgba(30,45,80,0.9)',
          borderRadius: 20,
          padding: '32px 28px',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Error */}
            {error && (
              <div style={{
                padding: '11px 14px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderLeft: '3px solid #ef4444',
                borderRadius: 9, color: '#f87171', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label style={{
                display: 'block', fontSize: 11, color: '#475569',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
              }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  color: '#334155', pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError('') }}
                  placeholder="Masukkan username"
                  autoFocus
                  autoComplete="username"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(30,45,80,0.8)',
                    borderRadius: 10, paddingLeft: 40, paddingRight: 14,
                    paddingTop: 11, paddingBottom: 11,
                    color: '#e2e8f0', fontSize: 14, outline: 'none',
                    fontFamily: 'var(--mono)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(30,45,80,0.8)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', fontSize: 11, color: '#475569',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  color: '#334155', pointerEvents: 'none',
                }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(30,45,80,0.8)',
                    borderRadius: 10, paddingLeft: 40, paddingRight: 44,
                    paddingTop: 11, paddingBottom: 11,
                    color: '#e2e8f0', fontSize: 14, outline: 'none',
                    fontFamily: 'var(--mono)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(30,45,80,0.8)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#334155', padding: 4, display: 'flex',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#334155'}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                border: 'none', borderRadius: 10,
                color: '#fff', fontWeight: 800, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'var(--sans)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.3)',
                transition: 'all 0.2s',
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(59,130,246,0.45)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(59,130,246,0.3)' }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Memverifikasi...
                </>
              ) : (
                <><Zap size={16} /> Masuk ke Dashboard</>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#1e3a5f', marginTop: 20 }}>
          Hubungi admin untuk mendapatkan akun
        </p>
      </div>
    </div>
  )
}
