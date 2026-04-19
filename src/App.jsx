import { useState, useCallback, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/views/Dashboard'
import Infrastructure from './components/views/Infrastructure'
import TerminalView from './components/Terminal'
import { SecurityView, SettingsView } from './components/views/SecuritySettings'
import AdminPanel from './components/views/AdminPanel'
import AddModal from './components/AddModal'
import NotifPanel from './components/NotifPanel'
import Toast from './components/Toast'
import LoginPage from './components/LoginPage'
import { useStore } from './store/useStore'
import DbStatusBadge from './components/DbStatusBadge'
import { getSession, clearSession } from './auth/authStore'

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getSession())
  const [activeTab,   setActiveTab]   = useState('dashboard')
  const [selectedId,  setSelectedId]  = useState(null)
  const [isAdding,    setIsAdding]    = useState(false)
  const [showNotif,   setShowNotif]   = useState(false)
  const [search,      setSearch]      = useState('')
  const [toast,       setToast]       = useState(null)

  const {
    servers, stats, checkingIds, notifications, dbMode,
    addServer, deleteServer, checkServer, checkAll, clearAll,
  } = useStore(currentUser)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
  }, [])

  // ── Auth handlers ────────────────────────────────────────────────────────────
  const handleLogin = useCallback((user) => {
    setCurrentUser(user)
    setActiveTab('dashboard')
    setSelectedId(null)
  }, [])

  const handleLogout = useCallback(() => {
    clearSession()
    setCurrentUser(null)
    setActiveTab('dashboard')
    setSelectedId(null)
    setSearch('')
    setShowNotif(false)
  }, [])

  // ── Server actions ───────────────────────────────────────────────────────────
  const handleAdd = useCallback((form) => {
    const srv = addServer(form)
    setIsAdding(false)
    setSelectedId(srv.id)
    showToast(`"${srv.name}" berhasil didaftarkan! Sedang mengecek status...`, 'success')
  }, [addServer, showToast])

  const handleDelete = useCallback((id) => {
    const s = servers.find(v => v.id === id)
    if (!s) return
    if (!window.confirm(`Hapus "${s.name}" dari monitoring?`)) return
    deleteServer(id)
    if (selectedId === id) setSelectedId(null)
    showToast(`Server "${s.name}" dihapus.`, 'info')
  }, [servers, selectedId, deleteServer, showToast])

  const handleCheck = useCallback((id) => {
    checkServer(id)
    const s = servers.find(v => v.id === id)
    showToast(`Mengecek status "${s?.name}"...`, 'info')
  }, [checkServer, servers, showToast])

  const handleCheckAll = useCallback(() => {
    if (servers.length === 0) { showToast('Tidak ada server untuk dicek.', 'warning'); return }
    checkAll()
    showToast(`Mengecek ${servers.length} server...`, 'info')
  }, [servers, checkAll, showToast])

  const handleOpenTerminal = useCallback((id) => {
    setSelectedId(id)
    setActiveTab('terminal')
    const s = servers.find(v => v.id === id)
    showToast(`Terminal: Terhubung ke ${s?.name}`, 'success')
  }, [servers, showToast])

  const handleClearAll = useCallback(() => {
    clearAll()
    setSelectedId(null)
    showToast('Semua data server dihapus.', 'info')
  }, [clearAll, showToast])

  // ── Not logged in → show login ───────────────────────────────────────────────
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />
  }

  const isAdmin = currentUser.role === 'admin'
  const alertCount = notifications.length

  // Build tabs dynamically based on role
  const VIEWS = {
    dashboard: (
      <Dashboard
        servers={servers} stats={stats} checkingIds={checkingIds}
        selectedId={selectedId} onSelect={setSelectedId}
        onDelete={handleDelete} onCheck={handleCheck} onCheckAll={handleCheckAll}
        onOpenTerminal={handleOpenTerminal} onAddClick={() => setIsAdding(true)}
        search={search} onSearch={setSearch}
      />
    ),
    infrastructure: (
      <Infrastructure
        servers={servers} checkingIds={checkingIds}
        onCheck={handleCheck} onDelete={handleDelete} onAddClick={() => setIsAdding(true)}
      />
    ),
    terminal: <TerminalView servers={servers} initialId={selectedId} />,
    security: <SecurityView servers={servers} />,
    ...(isAdmin ? {
      admin: <AdminPanel currentUser={currentUser} onToast={showToast} />,
    } : {}),
    settings: <SettingsView onClearAll={handleClearAll} />,
  }

  const PAGE_TITLES = {
    dashboard:      { title: 'Ringkasan Sistem',        sub: `Selamat datang, ${currentUser.displayName || currentUser.username} 👋` },
    infrastructure: { title: 'Manajemen Infrastruktur', sub: 'Grid view seluruh server Anda.' },
    terminal:       { title: 'Web Terminal',            sub: 'SSH simulator — ketik "help" untuk daftar perintah.' },
    security:       { title: 'Security Center',         sub: 'Audit keamanan server Anda.' },
    admin:          { title: 'Admin Panel',             sub: 'Kelola semua akun pengguna.' },
    settings:       { title: 'Pengaturan',              sub: 'Konfigurasi aplikasi dan notifikasi.' },
  }

  const page = PAGE_TITLES[activeTab] || PAGE_TITLES.dashboard

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setSearch('') }}
        stats={stats}
        alertCount={alertCount}
        onNotifToggle={() => setShowNotif(n => !n)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
        transition: 'padding-right 0.25s',
        paddingRight: showNotif ? 340 : 0,
      }}>
        {/* Header */}
        <header style={{
          padding: '18px 28px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(2,8,23,0.85)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: 2 }}>
              {page.title}
            </h2>
            <p style={{ fontSize: 12, color: '#334155' }}>{page.sub}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* DB status badge */}
            <DbStatusBadge dbMode={dbMode} />

            {/* Live indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 99,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse-green 2s infinite' }} />
              <span style={{ fontSize: 10, color: '#10b981', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE</span>
            </div>

            {/* Stats pill */}
            <div style={{
              display: 'flex', gap: 6, padding: '5px 12px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
              borderRadius: 99, fontSize: 12, fontWeight: 700,
            }}>
              <span style={{ color: '#10b981' }}>{stats.online} online</span>
              <span style={{ color: '#1e3a5f' }}>·</span>
              <span style={{ color: '#ef4444' }}>{stats.offline} offline</span>
            </div>

            {/* Add VPS button */}
            <button
              onClick={() => setIsAdding(true)}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 9,
                color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
                boxShadow: '0 4px 16px rgba(59,130,246,0.3)', fontFamily: 'var(--sans)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(59,130,246,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.3)' }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Tambah VPS
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '22px 28px', overflowY: 'auto' }}>
          {VIEWS[activeTab] || VIEWS.dashboard}
        </main>
      </div>

      {/* Notifications */}
      {showNotif && <NotifPanel notifications={notifications} onClose={() => setShowNotif(false)} />}

      {/* Add modal */}
      {isAdding && <AddModal onClose={() => setIsAdding(false)} onSave={handleAdd} />}

      {/* Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
