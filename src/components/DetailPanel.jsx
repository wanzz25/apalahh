import { Terminal, RefreshCw, Power, Globe, Clock, Tag, Cpu, Database, HardDrive, Wifi, Activity } from 'lucide-react'
import { ResourceBar, Sparkline, TagBadge, Button, StatusDot } from './ui'
import { pingColor, pingLabel, timeAgo, statusConfig } from '../utils/helpers'

export default function DetailPanel({ server, onCheck, onDelete, onOpenTerminal, isChecking }) {
  if (!server) {
    return (
      <div className="glass" style={{
        borderRadius: 18, padding: 28,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: 420, textAlign: 'center',
        opacity: 0.35,
      }}>
        <Activity size={44} style={{ color: '#1e3a5f', marginBottom: 16 }} />
        <p style={{ color: '#334155', fontSize: 15, fontWeight: 600 }}>Pilih server untuk</p>
        <p style={{ color: '#1e3a5f', fontSize: 14 }}>melihat detail statistik</p>
      </div>
    )
  }

  const { name, ip, port, provider, os, region, status, metrics, tags, notes, uptime, history, geoInfo, createdAt, lastCheck } = server
  const m  = metrics || {}
  const sc = statusConfig[status] || statusConfig.offline

  return (
    <div className="glass fade-in" style={{ borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
              {name}
            </h3>
            <span style={{ fontSize: 13, color: '#334155', fontFamily: 'var(--mono)' }}>
              {ip}{port ? `:${port}` : ''}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusDot status={status} />
            <span style={{
              padding: '4px 12px', borderRadius: 99, fontSize: 10,
              fontWeight: 800, letterSpacing: '0.08em',
              background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
            }}>
              {sc.label}
            </span>
          </div>
        </div>

        {/* Geo info if available */}
        {geoInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: '#334155', marginTop: 6 }}>
            <Globe size={12} />
            <span>{geoInfo.city}, {geoInfo.country} · {geoInfo.isp}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>

        {/* Resource bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <ResourceBar label="CPU Usage"  value={m.cpu  || 0} icon={Cpu}      colorKey="blue"   />
          <ResourceBar label="RAM Usage"  value={m.ram  || 0} icon={Database}  colorKey="purple" />
          <ResourceBar label="Disk Usage" value={m.disk || 0} icon={HardDrive} colorKey="orange" />
        </div>

        {/* Sparkline */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#334155', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em' }}>CPU History (40 samples)</span>
            <span style={{ fontSize: 11, color: '#1e3a5f', fontFamily: 'var(--mono)' }}>
              {m.cpu || 0}% now
            </span>
          </div>
          <Sparkline data={history || []} color="#3b82f6" height={52} />
        </div>

        {/* Network row */}
        {status !== 'offline' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Ping',   val: m.ping ? `${Math.round(m.ping)}ms` : '—', color: pingColor(m.ping) },
              { label: 'Net ↓',  val: `${m.netIn || 0} MB/s`,  color: '#10b981' },
              { label: 'Net ↑',  val: `${m.netOut || 0} MB/s`, color: '#3b82f6' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)', borderRadius: 9, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#334155', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Server info */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { k: 'OS',       v: os || '—' },
            { k: 'Provider', v: provider || '—' },
            { k: 'Uptime',   v: uptime || '—' },
            { k: 'Region',   v: region || '—' },
            { k: 'Load avg', v: m.load ? m.load.join(' ') : '—' },
            { k: 'Last check', v: timeAgo(lastCheck) },
          ].map(({ k, v }) => (
            <div key={k}>
              <div style={{ fontSize: 10, color: '#1e3a5f', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        {tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.map(t => <TagBadge key={t} tag={t} />)}
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div style={{ padding: '10px 13px', background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)', borderRadius: 8,
            fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
            📝 {notes}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)',
        display: 'flex', gap: 8 }}>
        <Button variant="secondary" style={{ flex: 1 }} onClick={onOpenTerminal}>
          <Terminal size={14} /> SSH Console
        </Button>
        <Button variant="success" size="icon" title="Ping check" onClick={onCheck} disabled={isChecking}>
          <RefreshCw size={15} style={{ animation: isChecking ? 'spin 1s linear infinite' : 'none' }} />
        </Button>
        <Button variant="danger" size="icon" title="Remove server" onClick={onDelete}>
          <Power size={15} />
        </Button>
      </div>
    </div>
  )
}
