import { useState } from 'react'
import { Server, Trash2, RefreshCw, ChevronRight, Terminal } from 'lucide-react'
import { StatusDot, MiniMetric, TagBadge } from './ui'
import { pingColor, pingLabel, timeAgo } from '../utils/helpers'

export default function ServerCard({ server, isSelected, onClick, onDelete, onCheck, onOpenTerminal, isChecking }) {
  const [hov, setHov] = useState(false)
  const { name, ip, port, status, metrics, tags, provider, lastCheck } = server
  const m = metrics || {}

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: 'pointer',
        background: isSelected
          ? 'rgba(59,130,246,0.05)'
          : hov ? 'rgba(255,255,255,0.025)' : 'rgba(8,15,30,0.6)',
        border: `1px solid ${isSelected
          ? 'rgba(59,130,246,0.45)'
          : hov ? 'rgba(30,45,80,0.9)' : 'var(--border)'}`,
        boxShadow: isSelected ? '0 0 0 1px rgba(59,130,246,0.2), 0 4px 24px rgba(59,130,246,0.07)' : 'none',
        padding: '13px 16px',
        borderRadius: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        transition: 'all 0.2s',
        backdropFilter: 'blur(8px)',
      }}>

      {/* Left: Icon + Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 11, flexShrink: 0,
          background: status === 'online'   ? 'rgba(16,185,129,0.1)'
                    : status === 'warning'  ? 'rgba(245,158,11,0.1)'
                    : status === 'offline'  ? 'rgba(239,68,68,0.1)'
                    : 'rgba(148,163,184,0.08)',
          border: `1px solid ${status === 'online'   ? 'rgba(16,185,129,0.22)'
                              : status === 'warning'  ? 'rgba(245,158,11,0.22)'
                              : status === 'offline'  ? 'rgba(239,68,68,0.22)'
                              : 'rgba(148,163,184,0.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Server size={20} style={{
            color: status === 'online'   ? '#10b981'
                 : status === 'warning'  ? '#f59e0b'
                 : status === 'offline'  ? '#ef4444'
                 : '#475569'
          }} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </span>
            <StatusDot status={status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#334155', fontFamily: 'var(--mono)' }}>
              {ip}{port && port !== '22' ? `:${port}` : ''}
            </span>
            <span style={{ fontSize: 10, color: '#1e3a5f' }}>·</span>
            <span style={{ fontSize: 11, color: '#1e3a5f' }}>{provider}</span>
          </div>
        </div>
      </div>

      {/* Middle: Metrics + Tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        {/* Tags (only show 1-2) */}
        <div style={{ display: 'flex', gap: 5 }}>
          {(tags || []).slice(0, 2).map(t => <TagBadge key={t} tag={t} />)}
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <MiniMetric label="CPU" value={m.cpu || 0} />
          <MiniMetric label="RAM" value={m.ram || 0} />
        </div>

        {/* Ping */}
        {status !== 'offline' && m.ping && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)',
              color: pingColor(m.ping) }}>
              {m.ping}ms
            </div>
            <div style={{ fontSize: 10, color: '#334155' }}>{pingLabel(m.ping)}</div>
          </div>
        )}
        {status === 'offline' && (
          <div style={{ fontSize: 12, color: '#ef4444', fontFamily: 'var(--mono)', fontWeight: 700 }}>
            TIMEOUT
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
        onClick={e => e.stopPropagation()}>
        <button title="Check status" onClick={() => onCheck()}
          style={{
            padding: 7, background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#334155', borderRadius: 7,
            opacity: hov ? 1 : 0,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = '#10b981' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155' }}>
          <RefreshCw size={14} style={{ animation: isChecking ? 'spin 1s linear infinite' : 'none' }} />
        </button>

        <button title="Open terminal" onClick={() => onOpenTerminal()}
          style={{
            padding: 7, background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#334155', borderRadius: 7,
            opacity: hov ? 1 : 0,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#60a5fa' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155' }}>
          <Terminal size={14} />
        </button>

        <button title="Delete server" onClick={() => onDelete()}
          style={{
            padding: 7, background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#334155', borderRadius: 7,
            opacity: hov ? 1 : 0,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155' }}>
          <Trash2 size={14} />
        </button>

        <ChevronRight size={16} style={{
          color: isSelected ? '#3b82f6' : '#1e3a5f',
          transition: 'color 0.15s',
        }} />
      </div>
    </div>
  )
}
