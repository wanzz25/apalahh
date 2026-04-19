import { useState, useRef, useEffect, useCallback } from 'react'
import { Server } from 'lucide-react'

const HELP_TEXT = [
  '┌────────────────────────────────────────────────────┐',
  '│        VPS Master Pro — SSH Simulator v2.0         │',
  '│               Available Commands                   │',
  '├────────────────────────────────────────────────────┤',
  '│  help           Show this help                     │',
  '│  top            CPU, memory & load average         │',
  '│  htop           Interactive process view           │',
  '│  df -h          Disk space usage                   │',
  '│  free -m        Memory information                 │',
  '│  uptime         System uptime & load               │',
  '│  uname -a       Kernel information                 │',
  '│  whoami / id    User information                   │',
  '│  ps aux         Running processes                  │',
  '│  netstat        Network connections                 │',
  '│  ss -tlnp       Listening ports                    │',
  '│  ifconfig       Network interfaces                 │',
  '│  ip addr        IP address info                    │',
  '│  ping <host>    Ping a host (3 packets)            │',
  '│  curl <url>     HTTP request simulation            │',
  '│  wget <url>     File download simulation           │',
  '│  systemctl      List running services              │',
  '│  journalctl     System logs                        │',
  '│  cat /etc/os-release   OS information              │',
  '│  history        Command history                    │',
  '│  clear / cls    Clear terminal                     │',
  '└────────────────────────────────────────────────────┘',
]

const progressBar = (pct, len = 30) => {
  const filled = Math.min(Math.round((pct / 100) * len), len)
  return '▓'.repeat(filled) + ' '.repeat(len - filled)
}

const buildCommands = (server) => {
  const m   = server?.metrics || {}
  const ip  = server?.ip || '127.0.0.1'
  const nm  = (server?.name || 'vps').replace(/\s/g, '-').toLowerCase()
  const now = new Date()
  const ts  = () => now.toISOString().replace('T', ' ').slice(0, 19)

  return {
    help: () => HELP_TEXT,

    top: () => [
      `top - ${now.toLocaleTimeString()} up ${server?.uptime || '0d 0h'},  2 users,  load average: ${m.load?.[0]||0}, ${m.load?.[1]||0}, ${m.load?.[2]||0}`,
      `Tasks: 142 total,   1 running, 141 sleeping,   0 stopped,   0 zombie`,
      `%Cpu(s): ${(m.cpu||0).toFixed(1)} us,  2.1 sy,  0.0 ni, ${Math.max(0,100-(m.cpu||0)-2.6).toFixed(1)} id`,
      `MiB Mem :  4096.0 total,  ${Math.round(4096*(1-(m.ram||0)/100))}.0 free,  ${Math.round(4096*(m.ram||0)/100)}.0 used`,
      `MiB Swap:  2048.0 total,  2048.0 free,     0.0 used`,
      ``,
      `  PID USER      %CPU %MEM COMMAND`,
      `  312 root      ${(m.cpu||5).toFixed(1)}  1.6 node /app/server.js`,
      `  501 postgres   0.7  0.8 postgres: checkpointer`,
      `  892 www-data   0.3  0.4 nginx: worker`,
      `    1 root       0.0  0.1 /sbin/init`,
    ],

    htop: () => [
      `CPU [${progressBar(m.cpu||0)}] ${(m.cpu||0).toFixed(1)}%`,
      `Mem [${progressBar(m.ram||0)}] ${Math.round(4096*(m.ram||0)/100)}M/4096M`,
      `Swp [${progressBar(0)}] 0K/2048M`,
      `Uptime: ${server?.uptime || '0d 0h 0m'}`,
    ],

    'df -h': () => {
      const u = Math.round(50*(m.disk||30)/100)
      return [
        `Filesystem  Size  Used  Avail Use% Mounted on`,
        `/dev/vda1    50G   ${u}G   ${50-u}G  ${m.disk||0}% /`,
        `tmpfs       2.0G     0  2.0G   0% /dev/shm`,
        `/dev/vda15  105M  6.1M   99M   6% /boot/efi`,
      ]
    },

    'free -m': () => {
      const tot = 4096, used = Math.round(tot*(m.ram||40)/100)
      return [
        `             total   used   free  buff/cache  available`,
        `Mem:          ${tot}   ${used}   ${tot-used}     384       ${tot-used+200}`,
        `Swap:         2048      0   2048`,
      ]
    },

    uptime: () => [
      ` ${now.toLocaleTimeString()} up ${server?.uptime||'0d 0h 0m'},  2 users,  load average: ${m.load?.[0]||0}, ${m.load?.[1]||0}, ${m.load?.[2]||0}`
    ],

    'uname -a': () => [
      `Linux ${nm} 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 GNU/Linux`
    ],

    whoami: () => ['root'],
    id:     () => ['uid=0(root) gid=0(root) groups=0(root)'],

    'ps aux': () => [
      `USER       PID %CPU %MEM COMMAND`,
      `root         1  0.0  0.1 /sbin/init`,
      `root       312  ${(m.cpu||2).toFixed(1)}  1.6 node /app/server.js`,
      `postgres   501  0.7  0.8 postgres: checkpointer`,
      `www-data   892  0.3  0.4 nginx: worker process`,
      `root      1024  0.0  0.0 ps aux`,
    ],

    netstat: () => [
      `Proto  Local Address    State`,
      `tcp    0.0.0.0:22       LISTEN`,
      `tcp    0.0.0.0:80       LISTEN`,
      `tcp    0.0.0.0:443      LISTEN`,
      `tcp    127.0.0.1:5432   LISTEN`,
      `tcp    0.0.0.0:3000     LISTEN`,
      `tcp    ${ip}:22 ESTABLISHED`,
    ],

    'ss -tlnp': () => [
      `State   Local Address:Port  Process`,
      `LISTEN  0.0.0.0:22          sshd`,
      `LISTEN  0.0.0.0:80          nginx`,
      `LISTEN  0.0.0.0:443         nginx`,
      `LISTEN  127.0.0.1:5432      postgres`,
      `LISTEN  0.0.0.0:3000        node`,
    ],

    ifconfig: () => [
      `eth0: flags=4163<UP,BROADCAST,RUNNING>  mtu 1500`,
      `      inet ${ip}  netmask 255.255.255.0`,
      `      inet6 fe80::1  prefixlen 64`,
      `      RX packets 4567890  bytes 3456789012`,
      `      TX packets 2345678  bytes 1234567890`,
      ``,
      `lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536`,
      `    inet 127.0.0.1  netmask 255.0.0.0`,
    ],

    'ip addr': () => [
      `1: lo: <LOOPBACK,UP,LOWER_UP>`,
      `    inet 127.0.0.1/8 scope host lo`,
      `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP>`,
      `    inet ${ip}/24 brd ${ip.split('.').slice(0,3).join('.')}.255 scope global eth0`,
    ],

    systemctl: () => [
      `UNIT                  ACTIVE   DESCRIPTION`,
      `nginx.service         active   Nginx web server`,
      `postgresql.service    active   PostgreSQL RDBMS`,
      `node-app.service      active   Node.js App Server`,
      `ssh.service           active   OpenSSH server`,
      `ufw.service           active   Uncomplicated firewall`,
      `fail2ban.service      active   Fail2Ban`,
    ],

    journalctl: () => [
      `-- Journal begins --`,
      `${ts()} ${nm} systemd[1]: Started nginx.service`,
      `${ts()} ${nm} nginx[312]: worker process started`,
      `${ts()} ${nm} node[312]: Server listening on port 3000`,
      `${ts()} ${nm} postgres[501]: ready to accept connections`,
      `${ts()} ${nm} sshd[890]: Accepted publickey for root from ${ip}`,
      `-- End of log --`,
    ],

    'cat /etc/os-release': () => [
      `PRETTY_NAME="${server?.os||'Ubuntu 22.04.3 LTS'}"`,
      `NAME="Ubuntu"`,
      `VERSION_ID="22.04"`,
      `ID=ubuntu`,
      `HOME_URL="https://www.ubuntu.com/"`,
    ],

    clear: null,
    cls:   null,
  }
}

export default function TerminalView({ servers, initialId }) {
  const [selectedId, setSelectedId] = useState(initialId || servers[0]?.id || '')
  const [lines, setLines] = useState([
    { type: 'sys', text: 'VPS Master Pro — SSH Simulator v2.0' },
    { type: 'sys', text: 'Type "help" for commands. Tab = autocomplete. ↑↓ = history.' },
    { type: 'sep' },
  ])
  const [input, setInput]       = useState('')
  const [cmdHist, setCmdHist]   = useState([])
  const [histIdx, setHistIdx]   = useState(-1)
  const bodyRef  = useRef(null)
  const inputRef = useRef(null)
  const server   = servers.find(v => v.id === selectedId)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  useEffect(() => {
    if (initialId && servers.find(v => v.id === initialId)) setSelectedId(initialId)
  }, [initialId])

  const addLines = useCallback((nl) => setLines(p => [...p, ...nl]), [])

  const exec = useCallback((rawCmd) => {
    const cmd = rawCmd.trim()
    if (!cmd) return
    const prompt = `root@${server?.ip||'localhost'}:~#`
    setCmdHist(h => [...h, cmd])
    setHistIdx(-1)
    const entry = [{ type: 'cmd', prompt, text: cmd }]
    const cmds  = buildCommands(server)

    if (cmd === 'clear' || cmd === 'cls') {
      setLines([{ type: 'sys', text: 'Terminal cleared.' }]); return
    }
    if (cmd === 'history') {
      addLines([...entry, ...cmdHist.map((h,i) => ({ type: 'out', text: `  ${i+1}  ${h}` }))]); return
    }
    if (cmd.startsWith('ping ')) {
      const host = cmd.split(' ').slice(1).join(' ')||'8.8.8.8'
      const ms   = Math.floor(3+Math.random()*120)
      addLines([...entry,
        { type: 'out', text: `PING ${host}: 56 data bytes` },
        { type: 'out', text: `64 bytes from ${host}: icmp_seq=0 ttl=56 time=${ms}.${Math.floor(Math.random()*9)} ms` },
        { type: 'out', text: `64 bytes from ${host}: icmp_seq=1 ttl=56 time=${ms+2}.${Math.floor(Math.random()*9)} ms` },
        { type: 'out', text: `64 bytes from ${host}: icmp_seq=2 ttl=56 time=${ms-1}.${Math.floor(Math.random()*9)} ms` },
        { type: 'out', text: `3 packets transmitted, 3 received, 0% packet loss, avg ${ms} ms` },
      ]); return
    }
    if (cmd.startsWith('curl ') || cmd.startsWith('wget ')) {
      const url = cmd.split(' ').slice(1).join(' ')
      addLines([...entry,
        { type: 'out', text: cmd.startsWith('curl') ? `{"status":"ok","url":"${url}","time":"${new Date().toISOString()}"}` : `Downloading ${url}... done (14K)` },
      ]); return
    }

    const handler = cmds[cmd]
    if (typeof handler === 'function') {
      addLines([...entry, ...handler().map(t => ({ type: 'out', text: t }))]); return
    }
    if (handler === null) return

    // partial match
    const match = Object.keys(cmds).find(k => cmd.split(' ')[0] === k.split(' ')[0] && typeof cmds[k] === 'function')
    if (match) { addLines([...entry, ...cmds[match]().map(t => ({ type: 'out', text: t }))]); return }

    addLines([...entry, { type: 'err', text: `bash: ${cmd.split(' ')[0]}: command not found` }])
  }, [server, cmdHist, addLines])

  const onKey = (e) => {
    if (e.key === 'Enter') { exec(input); setInput('') }
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const i = Math.min(histIdx+1, cmdHist.length-1)
      if (i >= 0) { setHistIdx(i); setInput(cmdHist[cmdHist.length-1-i]||'') }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const i = Math.max(histIdx-1, -1)
      setHistIdx(i); setInput(i<0 ? '' : cmdHist[cmdHist.length-1-i])
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const all = [...Object.keys(buildCommands(server)), 'ping', 'curl', 'wget', 'history', 'clear']
      const m   = all.find(k => k.startsWith(input) && k !== input)
      if (m) setInput(m)
    } else if (e.key === 'c' && e.ctrlKey) {
      addLines([{ type: 'cmd', prompt: `root@${server?.ip||'localhost'}:~#`, text: input+' ^C' }])
      setInput('')
    }
  }

  if (servers.length === 0) return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:60, opacity:0.4 }}>
      <Server size={44} style={{ color:'#1e3a5f' }} />
      <p style={{ color:'#334155' }}>Tambahkan server terlebih dahulu.</p>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }} className="fade-up">
      {/* Selector */}
      <div className="glass" style={{ borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <span style={{ fontSize:13, color:'#475569', fontWeight:600 }}>Connect to:</span>
        <select value={selectedId} onChange={e => {
          setSelectedId(e.target.value)
          const s = servers.find(v=>v.id===e.target.value)
          setLines([{ type:'sys', text:`Connected to ${s?.name} (${s?.ip})` }, { type:'sep' }])
          inputRef.current?.focus()
        }} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--border2)', borderRadius:8, padding:'6px 12px', color:'#e2e8f0', fontSize:13, outline:'none', cursor:'pointer', fontFamily:'var(--mono)' }}>
          {servers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.ip})</option>)}
        </select>
        {server && (
          <span style={{ fontSize:11, padding:'3px 10px', borderRadius:99, fontWeight:800,
            background: server.status==='online'?'rgba(16,185,129,0.15)':server.status==='offline'?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.15)',
            color:      server.status==='online'?'#10b981':server.status==='offline'?'#ef4444':'#f59e0b',
          }}>● {server.status.toUpperCase()}</span>
        )}
        <div style={{ marginLeft:'auto', display:'flex', gap:10 }}>
          <span style={{ fontSize:11, color:'#1e3a5f' }}>Tab=autocomplete · ↑↓=history · Ctrl+C=cancel</span>
          <button onClick={()=>setLines([{type:'sys',text:'Terminal cleared.'}])} style={{ padding:'4px 10px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border2)', borderRadius:6, color:'#475569', fontSize:11, cursor:'pointer', fontFamily:'var(--sans)' }}>Clear</button>
        </div>
      </div>

      {/* Window */}
      <div style={{ background:'#020b18', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.6)' }}>
        {/* Titlebar */}
        <div style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 16px', background:'rgba(255,255,255,0.02)', borderBottom:'1px solid var(--border)' }}>
          {[['#ff5f57'],['#febc2e'],['#28c840']].map(([c],i) => (
            <div key={i} style={{ width:11, height:11, borderRadius:'50%', background:c, boxShadow:`0 0 5px ${c}90` }} />
          ))}
          <span style={{ marginLeft:12, fontSize:12, color:'#1e3a5f', fontFamily:'var(--mono)' }}>
            ssh root@{server?.ip||'localhost'} — {server?.name||'No server'}
          </span>
          <span style={{ marginLeft:'auto', fontSize:11, color:'#0f172a', fontFamily:'var(--mono)' }}>
            {new Date().toLocaleString()}
          </span>
        </div>

        {/* Output */}
        <div ref={bodyRef} onClick={()=>inputRef.current?.focus()} style={{ padding:'14px 18px', fontFamily:'var(--mono)', fontSize:13, lineHeight:1.8, minHeight:320, maxHeight:460, overflowY:'auto', cursor:'text', userSelect:'text' }}>
          {lines.map((l,i) => (
            <div key={i}>
              {l.type==='sep' && <div style={{ height:1, background:'rgba(255,255,255,0.04)', margin:'6px 0' }} />}
              {l.type==='sys' && <div style={{ color:'#1e3a5f' }}>{l.text}</div>}
              {l.type==='cmd' && (
                <div style={{ display:'flex', gap:8 }}>
                  <span style={{ color:'#22d3ee', flexShrink:0 }}>{l.prompt}</span>
                  <span style={{ color:'#e2e8f0' }}>{l.text}</span>
                </div>
              )}
              {l.type==='out' && <div style={{ color:'#475569', whiteSpace:'pre' }}>{l.text}</div>}
              {l.type==='err' && <div style={{ color:'#f87171' }}>{l.text}</div>}
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderTop:'1px solid rgba(255,255,255,0.04)', background:'rgba(255,255,255,0.01)' }}>
          <span style={{ color:'#22d3ee', fontFamily:'var(--mono)', fontSize:13, flexShrink:0, whiteSpace:'nowrap' }}>
            root@{server?.ip||'localhost'}:~#
          </span>
          <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey} autoFocus autoComplete="off" spellCheck={false}
            placeholder="Enter command…"
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#e2e8f0', fontFamily:'var(--mono)', fontSize:13, caretColor:'#22d3ee' }} />
          <div style={{ width:8, height:15, background:'#22d3ee', animation:'blink-cursor 1.1s step-end infinite', opacity:input?0:0.8, flexShrink:0 }} />
        </div>
      </div>
    </div>
  )
}
