import { Cloud, HardDrive, Wifi, WifiOff, RefreshCw } from 'lucide-react'

export default function DbStatusBadge({ dbMode }) {
  if (dbMode === 'loading') return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 10px',
      background: 'rgba(148,163,184,0.08)',
      border: '1px solid rgba(148,163,184,0.15)',
      borderRadius: 99,
    }}>
      <RefreshCw size={11} style={{ color: '#64748b', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
        CONNECTING...
      </span>
    </div>
  )

  if (dbMode === 'cloud') return (
    <div title="Data tersimpan di Supabase Cloud" style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 10px',
      background: 'rgba(16,185,129,0.08)',
      border: '1px solid rgba(16,185,129,0.18)',
      borderRadius: 99,
      cursor: 'default',
    }}>
      <Cloud size={11} style={{ color: '#10b981' }} />
      <span style={{ fontSize: 10, color: '#10b981', fontWeight: 700, letterSpacing: '0.05em' }}>
        CLOUD DB
      </span>
    </div>
  )

  return (
    <div title="Data tersimpan di browser (localStorage). Set SUPABASE untuk cloud sync." style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 10px',
      background: 'rgba(245,158,11,0.08)',
      border: '1px solid rgba(245,158,11,0.18)',
      borderRadius: 99,
      cursor: 'default',
    }}>
      <HardDrive size={11} style={{ color: '#f59e0b' }} />
      <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, letterSpacing: '0.05em' }}>
        LOCAL DB
      </span>
    </div>
  )
}
