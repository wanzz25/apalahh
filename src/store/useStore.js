import { useState, useEffect, useCallback } from 'react'
import { uid, genMetrics, genUptime, genHistory, checkHostReachable } from '../utils/helpers'
import { ServersDB } from '../lib/db'

// ─── HYDRATE ─────────────────────────────────────────────────────────────────
const hydrateServer = (raw) => ({
  ...raw,
  metrics:   raw.metrics   || genMetrics(raw.status),
  uptime:    raw.uptime    || genUptime(),
  history:   raw.history   || genHistory(),
  lastCheck: raw.lastCheck || null,
  geoInfo:   raw.geoInfo   || null,
})

// ─── STORE HOOK ───────────────────────────────────────────────────────────────
export function useStore(currentUser) {
  const userId = currentUser?.id || 'guest'

  const [servers,     setServers]   = useState([])
  const [checkingIds, setChecking]  = useState(new Set())
  const [notifications, setNotifs]  = useState([])
  const [dbMode,      setDbMode]    = useState('loading') // 'loading'|'cloud'|'local'

  // ── Load from DB on mount / user change ──────────────────────────────────
  useEffect(() => {
    setServers([])
    setDbMode('loading')

    ServersDB.getForUser(userId).then(list => {
      setServers(list.map(hydrateServer))
      const hasSupabase = Boolean(
        import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON
      )
      setDbMode(hasSupabase ? 'cloud' : 'local')
    }).catch(() => {
      setDbMode('local')
    })
  }, [userId])

  // ── Save to DB whenever servers change ────────────────────────────────────
  useEffect(() => {
    if (dbMode === 'loading') return
    ServersDB.saveForUser(userId, servers).catch(e =>
      console.warn('[Store] Save failed:', e.message)
    )
  }, [userId, servers, dbMode])

  // ── Auto-refresh metrics every 6s ─────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setServers(prev => prev.map(s => {
        if (s.status === 'offline' || s.status === 'checking') return s
        const m   = s.metrics
        const cpu = Math.max(1,  Math.min(99, m.cpu  + (Math.random() * 12 - 6)))
        const ram = Math.max(5,  Math.min(99, m.ram  + (Math.random() * 6  - 3)))
        const ping = m.ping ? Math.max(1, Math.min(600, m.ping + (Math.random() * 20 - 10))) : null
        return {
          ...s,
          status: cpu > 92 || ram > 92 ? 'warning' : 'online',
          metrics: {
            ...m,
            cpu: Math.round(cpu), ram: Math.round(ram),
            ping: ping ? Math.round(ping) : null,
            netIn:  parseFloat((Math.random() * 130).toFixed(1)),
            netOut: parseFloat((Math.random() * 65).toFixed(1)),
            load: [
              parseFloat((cpu / 100 * 3.2).toFixed(2)),
              parseFloat((cpu / 100 * 2.1).toFixed(2)),
              parseFloat((cpu / 100 * 1.4).toFixed(2)),
            ],
          },
          history: [...(s.history || []).slice(1), Math.round(cpu)],
        }
      }))
    }, 6000)
    return () => clearInterval(t)
  }, [])

  // ── Notifications ─────────────────────────────────────────────────────────
  useEffect(() => {
    const alerts = []
    servers.forEach(s => {
      if (s.status === 'offline')
        alerts.push({ id: `off-${s.id}`, level: 'critical', msg: `"${s.name}" is OFFLINE`, icon: '🔴', ts: s.lastCheck || Date.now() })
      if ((s.metrics?.cpu || 0) >= 90)
        alerts.push({ id: `cpu-${s.id}`, level: 'critical', msg: `CPU critical on "${s.name}": ${s.metrics.cpu}%`, icon: '🔥', ts: Date.now() })
      else if ((s.metrics?.cpu || 0) >= 75)
        alerts.push({ id: `cpuw-${s.id}`, level: 'warning', msg: `High CPU on "${s.name}": ${s.metrics.cpu}%`, icon: '⚠️', ts: Date.now() })
      if ((s.metrics?.ram || 0) >= 90)
        alerts.push({ id: `ram-${s.id}`, level: 'critical', msg: `RAM critical on "${s.name}": ${s.metrics.ram}%`, icon: '💾', ts: Date.now() })
      if ((s.metrics?.disk || 0) >= 85)
        alerts.push({ id: `disk-${s.id}`, level: 'warning', msg: `Low disk on "${s.name}": ${s.metrics.disk}%`, icon: '💽', ts: Date.now() })
    })
    setNotifs(alerts)
  }, [servers])

  // ── Add server ────────────────────────────────────────────────────────────
  const addServer = useCallback((form) => {
    const srv = {
      id: uid(), ...form,
      tags: typeof form.tags === 'string'
        ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
        : form.tags || [],
      status: 'checking',
      metrics:  genMetrics('online'),
      uptime:   genUptime(),
      history:  genHistory(),
      createdAt: Date.now(), lastCheck: null, geoInfo: null,
    }
    setServers(prev => [...prev, srv])
    setTimeout(() => _doCheck(srv.id, form.ip), 300)
    return srv
  }, [])

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteServer = useCallback((id) => {
    setServers(prev => prev.filter(s => s.id !== id))
  }, [])

  // ── Internal ping check ───────────────────────────────────────────────────
  const _doCheck = useCallback(async (id, ip) => {
    setChecking(prev => new Set([...prev, id]))
    setServers(prev => prev.map(s => s.id === id ? { ...s, status: 'checking' } : s))

    const start = Date.now()
    const { reachable, info } = await checkHostReachable(ip)
    const elapsed = Date.now() - start

    setServers(prev => prev.map(s => {
      if (s.id !== id) return s
      const isPrivate = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip)
      const isOnline  = reachable || isPrivate
      const simPing   = isPrivate
        ? Math.floor(1 + Math.random() * 30)
        : (reachable ? Math.min(elapsed, 300) : null)
      const newStatus = isOnline
        ? (s.metrics.cpu > 90 || s.metrics.ram > 90 ? 'warning' : 'online')
        : 'offline'
      return {
        ...s, status: newStatus,
        lastCheck: Date.now(),
        geoInfo: info || s.geoInfo,
        metrics: { ...s.metrics, ping: simPing },
      }
    }))

    setChecking(prev => { const n = new Set(prev); n.delete(id); return n })
  }, [])

  const checkServer = useCallback((id) => {
    const s = servers.find(x => x.id === id)
    if (s) _doCheck(id, s.ip)
  }, [servers, _doCheck])

  const checkAll = useCallback(() => {
    servers.forEach(s => _doCheck(s.id, s.ip))
  }, [servers, _doCheck])

  const clearAll = useCallback(() => {
    setServers([])
    ServersDB.deleteAllForUser(userId)
  }, [userId])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total:    servers.length,
    online:   servers.filter(s => s.status === 'online').length,
    offline:  servers.filter(s => s.status === 'offline').length,
    warning:  servers.filter(s => s.status === 'warning').length,
    checking: servers.filter(s => s.status === 'checking').length,
    critical: servers.filter(s => (s.metrics?.cpu || 0) >= 90 || (s.metrics?.ram || 0) >= 90).length,
    avgCpu:   servers.length ? Math.round(servers.reduce((a,s) => a+(s.metrics?.cpu||0), 0)/servers.length) : 0,
    avgRam:   servers.length ? Math.round(servers.reduce((a,s) => a+(s.metrics?.ram||0), 0)/servers.length) : 0,
  }

  return {
    servers, stats, checkingIds, notifications, dbMode,
    addServer, deleteServer, checkServer, checkAll, clearAll,
  }
}
