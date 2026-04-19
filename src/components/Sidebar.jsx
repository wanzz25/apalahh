import { useState, useEffect } from 'react'
import { Server, Activity, Database, Terminal, ShieldCheck, Settings, Power, Bell, ChevronLeft, ChevronRight, Users } from 'lucide-react'

export default function Sidebar({ activeTab, onTabChange, stats, alertCount, onNotifToggle, currentUser, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)
  const [clock, setClock] = useState(new Date())
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const TABS = [
    { id: 'dashboard',      icon: Activity,   label: 'Dashboard'      },
    { id: 'infrastructure', icon: Database,    label: 'Infrastructure' },
    { id: 'terminal',       icon: Terminal,    label: 'Web Terminal'   },
    { id: 'security',       icon: ShieldCheck, label: 'Security'       },
    ...(isAdmin ? [{ id: 'admin', icon: Users, label: 'Admin Panel', badge: 'ADMIN' }] : []),
    { id: 'settings',       icon: Settings,    label: 'Settings'       },
  ]

  const W = collapsed ? 58 : 218

  const NavBtn = ({ id, icon: Icon, label, onClick, alertBadge, dotBadge, adminBadge }) => {
    const [hov, setHov] = useState(false)
    const active = activeTab === id
    return (
      <button
        onClick={onClick || (() => onTabChange(id))}
        title={collapsed ? label : undefined}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 9,
          padding: collapsed ? '9px 0' : '9px 10px',
          borderRadius: 8, border: 'none',
          borderLeft: collapsed ? 'none' : `2px solid ${active ? '#3b82f6' : 'transparent'}`,
          background: active
            ? 'linear-gradient(135deg,rgba(59,130,246,0.16),rgba(37,99,235,0.07))'
            : hov ? 'rgba(255,255,255,0.035)' : 'transparent',
          color: active ? '#93c5fd' : hov ? '#64748b' : '#334155',
          cursor: 'pointer', width: '100%',
          fontWeight: 700, fontSize: 13,
          fontFamily: 'var(--sans)', transition: 'all 0.14s',
          position: 'relative', whiteSpace: 'nowrap', overflow: 'hidden',
        }}>
        <Icon size={16} style={{ flexShrink: 0 }} />
        {!collapsed && (
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{label}</span>
        )}
        {/* Admin badge */}
        {adminBadge && !collapsed && (
          <span style={{
            fontSize: 8, padding: '2px 5px', borderRadius: 4, fontWeight: 800,
            background: 'rgba(239,68,68,0.15)', color: '#f87171',
            border: '1px solid rgba(239,68,68,0.2)', letterSpacing: '0.06em',
          }}>ADMIN</span>
        )}
        {/* Number badge */}
        {alertBadge !== undefined && alertBadge > 0 && !collapsed && (
          <span style={{
            minWidth: 17, height: 17, borderRadius: 99,
            background: '#ef4444', color: '#fff',
            fontSize: 9, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
          }}>{alertBadge}</span>
        )}
        {alertBadge !== undefined && alertBadge > 0 && collapsed && (
          <span style={{
            position: 'absolute', top: 5, right: 5,
            minWidth: 14, height: 14, borderRadius: 99,
            background: '#ef4444', color: '#fff',
            fontSize: 8, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px',
          }}>{alertBadge}</span>
        )}
        {/* Dot badge */}
        {dotBadge && (
          <span style={{
            position: 'absolute',
            top: collapsed ? 7 : '50%', right: collapsed ? 7 : 10,
            transform: collapsed ? 'none' : 'translateY(-50%)',
            width: 6, height: 6, borderRadius: '50%',
            background: '#ef4444', boxShadow: '0 0 5px #ef4444aa',
          }} />
        )}
      </button>
    )
  }

  return (
    <aside style={{
      width: W, flexShrink: 0,
      background: 'rgba(4,8,20,0.98)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: collapsed ? '14px 8px' : '14px 10px',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      height: '100vh', position: 'sticky', top: 0,
      transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), padding 0.22s',
      overflow: 'hidden', zIndex: 50,
    }}>

      {/* Logo row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        marginBottom: 20,
      }}>
        <div style={{
          padding: 7,
          background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
          borderRadius: 9, display: 'flex', flexShrink: 0,
          boxShadow: '0 2px 12px rgba(59,130,246,0.3)',
          cursor: collapsed ? 'pointer' : 'default',
        }} onClick={collapsed ? () => setCollapsed(false) : undefined}
          title={collapsed ? 'Expand sidebar' : undefined}>
          <Server size={15} style={{ color: '#fff' }} />
        </div>

        {!collapsed && (
          <>
            <div style={{ flex: 1, marginLeft: 8, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.02em', color: '#f1f5f9', whiteSpace: 'nowrap' }}>
                VPS Master
              </div>
              <div style={{ fontSize: 8, color: '#1e3a5f', fontWeight: 700, letterSpacing: '0.13em' }}>PRO</div>
            </div>
            <button onClick={() => setCollapsed(true)} title="Collapse sidebar"
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '4px 5px', cursor: 'pointer',
                color: '#334155', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}>
              <ChevronLeft size={13} />
            </button>
          </>
        )}
      </div>

      {/* Expand btn when collapsed */}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} title="Expand sidebar"
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
            borderRadius: 7, padding: '5px', cursor: 'pointer', color: '#475569',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 10, transition: 'all 0.15s', width: '100%',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#475569' }}>
          <ChevronRight size={13} />
        </button>
      )}

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {TABS.map(({ id, icon, label, badge }) => (
          <NavBtn key={id} id={id} icon={icon} label={label}
            alertBadge={id === 'dashboard' ? alertCount : undefined}
            adminBadge={badge === 'ADMIN'} />
        ))}
        <NavBtn id="notifications" icon={Bell} label="Notifications"
          onClick={onNotifToggle} dotBadge={alertCount > 0} />
      </nav>

      {/* Live status (expanded) */}
      {!collapsed && (
        <div style={{
          padding: '10px', background: 'rgba(255,255,255,0.02)',
          borderRadius: 9, border: '1px solid var(--border)', marginBottom: 8,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 9, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Status</span>
            <span style={{ fontSize: 9, color: '#1e3a5f', fontFamily: 'var(--mono)' }}>{clock.toLocaleTimeString('en-GB')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, textAlign: 'center' }}>
            {[
              { label: 'ON',  val: stats.online,   color: '#10b981' },
              { label: 'OFF', val: stats.offline,  color: '#ef4444' },
              { label: 'WRN', val: stats.critical, color: '#f59e0b' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div style={{ fontSize: 19, fontWeight: 800, color, lineHeight: 1, marginBottom: 1 }}>{val}</div>
                <div style={{ fontSize: 8, color: '#1e3a5f', fontWeight: 700, letterSpacing: '0.07em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mini dots (collapsed) */}
      {collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div title={`${stats.online} Online`} style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>{stats.online}</div>
          <div title={`${stats.offline} Offline`} style={{ fontSize: 13, fontWeight: 800, color: '#ef4444' }}>{stats.offline}</div>
        </div>
      )}

      {/* User profile (expanded) */}
      {!collapsed && (
        <div style={{ padding: '9px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 9, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: currentUser?.color || 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: '#fff',
            }}>
              {currentUser?.avatar || currentUser?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 5 }}>
                {currentUser?.displayName || currentUser?.username}
                {isAdmin && (
                  <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#f87171', fontWeight: 800 }}>ADMIN</span>
                )}
              </div>
              <div style={{ fontSize: 10, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                @{currentUser?.username}
              </div>
            </div>
          </div>
          <button onClick={onLogout}
            style={{
              width: '100%', padding: '5px',
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 7, color: '#ef4444', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 5, fontFamily: 'var(--sans)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}>
            <Power size={10} /> Logout
          </button>
        </div>
      )}

      {/* Collapsed avatar */}
      {collapsed && (
        <div title={`${currentUser?.displayName || currentUser?.username} — Klik untuk logout`}
          onClick={onLogout}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: currentUser?.color || 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff', margin: '0 auto',
            cursor: 'pointer', boxShadow: '0 2px 10px rgba(59,130,246,0.3)',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          {currentUser?.avatar || currentUser?.username?.[0]?.toUpperCase() || 'U'}
        </div>
      )}
    </aside>
  )
}
