import { useEffect } from 'react'

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  if (!toast) return null

  const colors = {
    success: { border: '#10b981', icon: '✓', iconColor: '#10b981' },
    error:   { border: '#ef4444', icon: '✕', iconColor: '#ef4444' },
    info:    { border: '#3b82f6', icon: 'ℹ', iconColor: '#60a5fa' },
    warning: { border: '#f59e0b', icon: '⚠', iconColor: '#fbbf24' },
  }
  const c = colors[toast.type] || colors.info

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 500,
      animation: 'toast-in 0.3s ease both',
    }}>
      <div style={{
        padding: '13px 18px',
        background: 'rgba(4,8,20,0.97)',
        border: '1px solid var(--border2)',
        borderLeft: `3px solid ${c.border}`,
        borderRadius: 11,
        color: '#e2e8f0',
        fontSize: 13,
        fontWeight: 500,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        minWidth: 250,
        maxWidth: 340,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
      }}
        onClick={onDismiss}>
        <span style={{ color: c.iconColor, fontWeight: 800, fontSize: 14 }}>{c.icon}</span>
        <span>{toast.msg}</span>
      </div>
    </div>
  )
}
