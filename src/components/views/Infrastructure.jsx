import { RefreshCw, Plus, Server } from 'lucide-react'
import { Cpu, Database, HardDrive } from 'lucide-react'
import { ResourceBar, StatusDot, TagBadge, Button } from '../ui'
import { timeAgo } from '../../utils/helpers'

export default function Infrastructure({ servers, checkingIds, onCheck, onDelete, onAddClick }) {
  if (servers.length === 0) {
    return (
      <div className="fade-up" style={{ textAlign: 'center', padding: 60 }}>
        <Server size={44} style={{ color: '#0f172a', margin: '0 auto 16px', display: 'block' }} />
        <p style={{ color: '#334155', marginBottom: 16 }}>Belum ada server terdaftar.</p>
        <Button variant="primary" onClick={onAddClick}><Plus size={14} /> Tambah VPS</Button>
      </div>
    )
  }

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Infrastructure Grid</h3>
          <span style={{ fontSize: 12, color: '#334155' }}>{servers.length} servers registered</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => servers.forEach(s => onCheck(s.id))}>
          <RefreshCw size={13} /> Check All
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14 }}>
        {servers.map(s => {
          const m = s.metrics || {}
          const isChecking = checkingIds.has(s.id)
          return (
            <div key={s.id} className="glass" style={{ borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

              {/* Card header */}
              <div style={{
                padding: '13px 15px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#334155', fontFamily: 'var(--mono)' }}>{s.ip}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusDot status={s.status} />
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 800,
                    background: s.status === 'online'  ? 'rgba(16,185,129,0.15)'
                              : s.status === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                    color:     s.status === 'online'  ? '#10b981'
                              : s.status === 'warning' ? '#f59e0b' : '#ef4444',
                  }}>{s.status.toUpperCase()}</span>
                </div>
              </div>

              {/* Resource bars */}
              <div style={{ padding: '13px 15px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ResourceBar label="CPU"  value={m.cpu  || 0} icon={Cpu}      colorKey="blue"   />
                <ResourceBar label="RAM"  value={m.ram  || 0} icon={Database}  colorKey="purple" />
                <ResourceBar label="Disk" value={m.disk || 0} icon={HardDrive} colorKey="orange" />
              </div>

              {/* Footer */}
              <div style={{
                padding: '10px 15px',
                borderTop: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {(s.tags || []).slice(0, 2).map(t => <TagBadge key={t} tag={t} />)}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#1e3a5f', fontFamily: 'var(--mono)' }}>
                    {timeAgo(s.lastCheck)}
                  </span>
                  <button onClick={() => onCheck(s.id)} title="Ping check"
                    style={{
                      padding: '4px 10px', background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6,
                      color: '#10b981', fontSize: 11, cursor: 'pointer', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                    <RefreshCw size={11} style={{ animation: isChecking ? 'spin 1s linear infinite' : 'none' }} />
                    Check
                  </button>
                  <button onClick={() => onDelete(s.id)} title="Delete"
                    style={{
                      padding: '4px 8px', background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6,
                      color: '#ef4444', fontSize: 11, cursor: 'pointer', fontWeight: 700,
                    }}>✕</button>
                </div>
              </div>

              {/* Provider / OS strip */}
              <div style={{
                padding: '6px 15px',
                background: 'rgba(255,255,255,0.01)',
                borderTop: '1px solid rgba(255,255,255,0.03)',
                display: 'flex', justifyContent: 'space-between',
                fontSize: 10, color: '#1e3a5f', fontFamily: 'var(--mono)',
              }}>
                <span>{s.provider}</span>
                <span>{s.os}</span>
                <span>{s.region}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
