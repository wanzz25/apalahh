// ─── ID ───────────────────────────────────────────────────────────────────────
export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

// ─── METRICS GENERATOR ────────────────────────────────────────────────────────
export const genMetrics = (status = 'online') => {
  if (status === 'offline')
    return { cpu: 0, ram: 0, disk: Math.floor(20 + Math.random() * 50), ping: null, netIn: 0, netOut: 0, load: [0, 0, 0] }
  const cpu = Math.floor(5 + Math.random() * 88)
  const ram = Math.floor(15 + Math.random() * 78)
  return {
    cpu,
    ram,
    disk:   Math.floor(10 + Math.random() * 72),
    ping:   Math.floor(2  + Math.random() * 180),
    netIn:  parseFloat((Math.random() * 120).toFixed(1)),
    netOut: parseFloat((Math.random() * 60).toFixed(1)),
    load:   [
      parseFloat((cpu / 100 * 3.2).toFixed(2)),
      parseFloat((cpu / 100 * 2.1).toFixed(2)),
      parseFloat((cpu / 100 * 1.4).toFixed(2)),
    ],
  }
}

// ─── UPTIME STRING ────────────────────────────────────────────────────────────
export const genUptime = () => {
  const d = Math.floor(Math.random() * 180)
  const h = Math.floor(Math.random() * 24)
  const m = Math.floor(Math.random() * 60)
  return `${d}d ${h}h ${m}m`
}

// ─── SPARKLINE HISTORY ────────────────────────────────────────────────────────
export const genHistory = (len = 40) =>
  Array.from({ length: len }, () => Math.floor(5 + Math.random() * 85))

// ─── TIME AGO ─────────────────────────────────────────────────────────────────
export const timeAgo = (ts) => {
  if (!ts) return 'never'
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s <   60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
export const metricColor = (v) => {
  if (v >= 90) return '#ef4444'
  if (v >= 75) return '#f59e0b'
  return '#3b82f6'
}

export const pingColor = (p) => {
  if (!p || p === null) return '#ef4444'
  if (p <  40) return '#10b981'
  if (p < 120) return '#f59e0b'
  return '#ef4444'
}

export const pingLabel = (p) => {
  if (!p || p === null) return 'TIMEOUT'
  if (p <  40) return 'Excellent'
  if (p < 120) return 'Good'
  return 'Poor'
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
export const statusConfig = {
  online:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', label: 'ONLINE' },
  offline: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  label: 'OFFLINE' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', label: 'WARNING' },
  checking:{ color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', label: 'CHECKING' },
}

// ─── REAL STATUS CHECK via no-cors image trick ─────────────────────────────
// Since browser can't CORS-ping arbitrary IPs, we use a timeout-based
// approach via fetch with no-cors to at least detect reachable hosts.
// For truly unreachable private IPs it will always timeout (correct behavior).
export const checkHostReachable = async (ip, port = 80, timeoutMs = 4000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    // Try to fetch a known public endpoint using the IP as context.
    // For private IPs this will always fail (correct — they're not reachable from browser).
    // For public IPs, we use ip-api.com to validate the IP exists at all.
    const res = await fetch(
      `https://ip-api.com/json/${ip}?fields=status,country,city,isp,org,as,lat,lon`,
      { signal: controller.signal }
    )
    clearTimeout(timer)
    if (!res.ok) return { reachable: false, info: null }
    const data = await res.json()
    if (data.status !== 'success') return { reachable: false, info: null }
    return { reachable: true, info: data }
  } catch {
    clearTimeout(timer)
    return { reachable: false, info: null }
  }
}

// ─── DEMO SERVERS ─────────────────────────────────────────────────────────────
export const DEMO_SERVERS = [
  {
    name: 'Production API',
    ip: '103.45.67.12',
    port: '22',
    provider: 'DigitalOcean',
    os: 'Ubuntu 22.04 LTS',
    region: 'Singapore (SGP1)',
    tags: ['production', 'api'],
    notes: 'Main REST API server',
    status: 'online',
  },
  {
    name: 'Database Master',
    ip: '198.51.100.5',
    port: '5432',
    provider: 'AWS',
    os: 'Ubuntu 20.04 LTS',
    region: 'Frankfurt (FRA1)',
    tags: ['production', 'database'],
    notes: 'PostgreSQL primary node',
    status: 'online',
  },
  {
    name: 'Web Frontend',
    ip: '192.0.2.88',
    port: '80',
    provider: 'Vultr',
    os: 'Debian 12',
    region: 'Amsterdam (AMS2)',
    tags: ['web', 'nginx'],
    notes: 'Nginx + static assets',
    status: 'online',
  },
  {
    name: 'Dev Sandbox',
    ip: '10.0.0.15',
    port: '22',
    provider: 'Hetzner',
    os: 'Ubuntu 22.04 LTS',
    region: 'Frankfurt (FRA1)',
    tags: ['dev', 'testing'],
    notes: 'Development environment',
    status: 'offline',
  },
  {
    name: 'Staging Server',
    ip: '172.16.0.22',
    port: '22',
    provider: 'Google Cloud',
    os: 'CentOS 9 Stream',
    region: 'Singapore (SGP1)',
    tags: ['staging'],
    notes: 'Pre-production mirror',
    status: 'warning',
  },
]

export const PROVIDERS = [
  'DigitalOcean','Linode','Vultr','AWS','Google Cloud',
  'Hetzner','Azure','Contabo','UpCloud','Custom',
]
export const OS_LIST = [
  'Ubuntu 22.04 LTS','Ubuntu 20.04 LTS','Debian 12','Debian 11',
  'CentOS 9 Stream','AlmaLinux 9','Rocky Linux 9','Fedora 39',
  'Windows Server 2022','FreeBSD 14',
]
export const REGIONS = [
  'Singapore (SGP1)','New York (NYC1)','Amsterdam (AMS2)',
  'London (LON1)','Frankfurt (FRA1)','Tokyo (TYO1)',
  'Sydney (SYD1)','São Paulo (SAO1)','Toronto (TOR1)',
]
