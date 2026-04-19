import { ShieldCheck, Lock, Globe, Eye, AlertTriangle, CheckCircle } from 'lucide-react'
import { StatCard } from '../ui'
import { useState } from 'react'

export function SecurityView({ servers }) {
  const safe = servers.filter(s => s.status === 'online').length

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        <StatCard label="Protected Servers" value={safe}   icon={ShieldCheck} color="green" />
        <StatCard label="Firewall Rules"    value="24"     icon={Lock}        color="blue"  />
        <StatCard label="Open Ports"        value="5"      icon={Globe}       color="orange"/>
      </div>

      <div className="glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Security Audit Report</span>
          <span style={{ fontSize: 11, color: '#334155', fontFamily: 'var(--mono)' }}>
            Last scan: {new Date().toLocaleTimeString()}
          </span>
        </div>

        {servers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#334155' }}>No servers to audit.</div>
        ) : (
          servers.map(s => (
            <div key={s.id} style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: s.status === 'online' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${s.status === 'online' ? 'rgba(16,185,129,0.22)' : 'rgba(239,68,68,0.22)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShieldCheck size={16} style={{ color: s.status === 'online' ? '#10b981' : '#ef4444' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#334155', fontFamily: 'var(--mono)' }}>{s.ip}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {['SSH Key Auth', 'UFW Firewall', 'Fail2ban', 'Auto Updates'].map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600,
                    background: s.status === 'online' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: s.status === 'online' ? '#34d399' : '#f87171',
                    border: `1px solid ${s.status === 'online' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  }}>
                    {s.status === 'online' ? '✓' : '✗'} {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Port scanner simulation */}
      <div className="glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Open Port Monitor</span>
        </div>
        <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { port: 22,   service: 'SSH',        status: 'open',   risk: 'low' },
            { port: 80,   service: 'HTTP',        status: 'open',   risk: 'low' },
            { port: 443,  service: 'HTTPS',       status: 'open',   risk: 'low' },
            { port: 3306, service: 'MySQL',       status: 'closed', risk: 'low' },
            { port: 5432, service: 'PostgreSQL',  status: 'listen', risk: 'medium' },
            { port: 6379, service: 'Redis',       status: 'closed', risk: 'low' },
          ].map(({ port, service, status, risk }) => (
            <div key={port} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 8,
            }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#60a5fa', width: 50 }}>{port}</span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{service}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700,
                  background: status === 'open'   ? 'rgba(16,185,129,0.12)'
                            : status === 'listen' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.08)',
                  color:     status === 'open'   ? '#10b981'
                            : status === 'listen' ? '#f59e0b' : '#475569',
                }}>{status.toUpperCase()}</span>
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700,
                  background: risk === 'low' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                  color: risk === 'low' ? '#60a5fa' : '#fbbf24',
                }}>RISK: {risk.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SettingsView({ onClearAll }) {
  const [monitoring, setMonitoring] = useState('5')
  const [notifs, setNotifs] = useState({ email: true, telegram: false, webhook: false, desktop: true })
  const [theme, setTheme] = useState('dark')
  const [saved, setSaved] = useState(false)

  const saveSettings = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const Toggle = ({ val, onToggle }) => (
    <div onClick={onToggle} style={{
      width: 42, height: 23, borderRadius: 99,
      background: val ? '#3b82f6' : 'rgba(30,45,80,0.8)',
      cursor: 'pointer', transition: 'background 0.2s', position: 'relative',
      flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: val ? 21 : 3,
        width: 17, height: 17, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  )

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 600 }}>

      {[
        {
          title: '⏱ Monitoring Interval',
          content: (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['1','3','5','10','30'].map(v => (
                <button key={v} onClick={() => setMonitoring(v)}
                  style={{
                    padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13,
                    cursor: 'pointer',
                    background: monitoring === v ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${monitoring === v ? 'rgba(59,130,246,0.45)' : 'var(--border2)'}`,
                    color: monitoring === v ? '#93c5fd' : '#475569',
                    transition: 'all 0.15s',
                    fontFamily: 'var(--sans)',
                  }}>
                  {v}m
                </button>
              ))}
            </div>
          ),
        },
        {
          title: '🔔 Notification Channels',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Email Alerts',    'email'],
                ['Telegram Bot',    'telegram'],
                ['Webhook',         'webhook'],
                ['Desktop Notifs',  'desktop'],
              ].map(([label, key]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 11, color: '#334155' }}>
                      {key === 'email' && 'Receive email when server goes offline'}
                      {key === 'telegram' && 'Send alerts to Telegram Bot'}
                      {key === 'webhook' && 'POST to custom webhook URL'}
                      {key === 'desktop' && 'Browser push notifications'}
                    </div>
                  </div>
                  <Toggle val={notifs[key]} onToggle={() => setNotifs(n => ({ ...n, [key]: !n[key] }))} />
                </div>
              ))}
            </div>
          ),
        },
        {
          title: '🎨 Appearance',
          content: (
            <div style={{ display: 'flex', gap: 8 }}>
              {['dark', 'darker', 'midnight'].map(t => (
                <button key={t} onClick={() => setTheme(t)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 12,
                    cursor: 'pointer', textTransform: 'capitalize',
                    background: theme === t ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${theme === t ? 'rgba(59,130,246,0.45)' : 'var(--border2)'}`,
                    color: theme === t ? '#93c5fd' : '#475569',
                    fontFamily: 'var(--sans)',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          ),
        },
        {
          title: '🗂 Data Management',
          content: (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveSettings} style={{
                padding: '9px 20px', background: 'rgba(59,130,246,0.12)',
                border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8,
                color: '#60a5fa', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                fontFamily: 'var(--sans)', transition: 'all 0.2s',
              }}>
                {saved ? '✓ Saved!' : '💾 Save Settings'}
              </button>
              <button onClick={() => {
                if (confirm('Export semua data server?')) {
                  const blob = new Blob([localStorage.getItem('vps_master_pro_v3') || '[]'], { type: 'application/json' })
                  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                  a.download = 'vps-master-backup.json'; a.click()
                }
              }} style={{
                padding: '9px 20px', background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8,
                color: '#10b981', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                fontFamily: 'var(--sans)',
              }}>
                📤 Export JSON
              </button>
              <button onClick={() => {
                if (confirm('Hapus SEMUA data server? Tindakan ini tidak bisa dibatalkan!')) onClearAll()
              }} style={{
                padding: '9px 20px', background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8,
                color: '#f87171', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                fontFamily: 'var(--sans)',
              }}>
                🗑 Clear All Data
              </button>
            </div>
          ),
        },
      ].map(({ title, content }) => (
        <div key={title} className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>{title}</span>
          </div>
          <div style={{ padding: '16px 18px' }}>{content}</div>
        </div>
      ))}

      {/* Version info */}
      <div style={{ fontSize: 11, color: '#0f172a', textAlign: 'center', paddingTop: 8 }}>
        VPS Master Pro v1.0.0 · Built for Vercel/Netlify · Data stored locally
      </div>
    </div>
  )
}
