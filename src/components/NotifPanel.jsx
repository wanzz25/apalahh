import { X, CheckCircle, Bell } from 'lucide-react'
import { timeAgo } from '../utils/helpers'

export default function NotifPanel({ notifications, onClose }) {
  const critical = notifications.filter(n => n.level === 'critical')
  const warning  = notifications.filter(n => n.level === 'warning')

  return (
    <div className="slide-right" style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: 340, zIndex: 200,
      background: 'rgba(4,8,20,0.97)',
      borderLeft: '1px solid var(--border)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={16} style={{ color: notifications.length > 0 ? '#ef4444' : '#475569' }} />
          <span style={{ fontWeight: 800, fontSize: 15 }}>Notifications</span>
          {notifications.length > 0 && (
            <span style={{
              minWidth: 20, height: 20, borderRadius: 99,
              background: '#ef4444', color: '#fff',
              fontSize: 11, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 5px',
            }}>{notifications.length}</span>
          )}
        </div>
        <button onClick={onClose} style={{
          padding: 7, background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border2)', borderRadius: 7,
          color: '#475569', cursor: 'pointer',
        }}><X size={14} /></button>
      </div>

      {/* Summary row */}
      {notifications.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 8, padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            padding: '10px 12px', borderRadius: 9,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{critical.length}</div>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, letterSpacing: '0.08em' }}>CRITICAL</div>
          </div>
          <div style={{
            padding: '10px 12px', borderRadius: 9,
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{warning.length}</div>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, letterSpacing: '0.08em' }}>WARNING</div>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {notifications.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            flex: 1, textAlign: 'center', gap: 12, opacity: 0.5,
          }}>
            <CheckCircle size={40} style={{ color: '#10b981' }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 4 }}>All Clear</p>
              <p style={{ fontSize: 12, color: '#475569' }}>No active alerts</p>
            </div>
          </div>
        ) : (
          notifications.map((n, i) => (
            <div key={n.id || i} style={{
              padding: '12px 13px',
              background: n.level === 'critical'
                ? 'rgba(239,68,68,0.06)'
                : 'rgba(245,158,11,0.06)',
              border: `1px solid ${n.level === 'critical'
                ? 'rgba(239,68,68,0.18)'
                : 'rgba(245,158,11,0.18)'}`,
              borderLeft: `3px solid ${n.level === 'critical' ? '#ef4444' : '#f59e0b'}`,
              borderRadius: 9,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: '#e2e8f0', marginBottom: 4, lineHeight: 1.4 }}>
                  {n.msg}
                </div>
                <div style={{ fontSize: 11, color: '#334155', fontFamily: 'var(--mono)' }}>
                  {timeAgo(n.ts)}
                </div>
              </div>
              <span style={{
                fontSize: 9, padding: '3px 7px', borderRadius: 99, fontWeight: 800,
                letterSpacing: '0.08em', flexShrink: 0,
                background: n.level === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                color: n.level === 'critical' ? '#f87171' : '#fbbf24',
              }}>{n.level.toUpperCase()}</span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)',
        fontSize: 11, color: '#1e3a5f', textAlign: 'center' }}>
        Auto-updates every 6 seconds
      </div>
    </div>
  )
}
