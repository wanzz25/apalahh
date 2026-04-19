import { useState } from 'react'
import { metricColor } from '../utils/helpers'

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
export function Sparkline({ data = [], color = '#3b82f6', height = 48, width = '100%' }) {
  if (!data || data.length < 2) return null
  const pts = data
  const max = Math.max(...pts, 1)
  const min = Math.min(...pts, 0)
  const range = max - min || 1
  const W = 200, H = height

  const coords = pts.map((v, i) => ({
    x: (i / (pts.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 6) - 3,
  }))
  const linePath  = coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath  = `${linePath} L${W},${H} L0,${H} Z`
  const gradId    = `sg-${color.replace(/[^a-z0-9]/gi, '')}-${Math.random().toString(36).slice(2,6)}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
      style={{ width, height, display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinejoin="round" strokeLinecap="round" />
      {/* Last point dot */}
      <circle cx={coords[coords.length-1].x} cy={coords[coords.length-1].y}
        r="3" fill={color} />
    </svg>
  )
}

// ─── RESOURCE BAR ─────────────────────────────────────────────────────────────
export function ResourceBar({ label, value = 0, icon: Icon, colorKey = 'blue' }) {
  const palettes = {
    blue:   { text: '#60a5fa', fill: '#3b82f6' },
    purple: { text: '#a78bfa', fill: '#8b5cf6' },
    orange: { text: '#fbbf24', fill: '#f59e0b' },
    green:  { text: '#34d399', fill: '#10b981' },
    red:    { text: '#f87171', fill: '#ef4444' },
  }
  const p    = palettes[colorKey] || palettes.blue
  const fill = metricColor(value)   // override with danger colors if high

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon && <Icon size={13} style={{ color: p.text }} />}
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: '#475569' }}>{label}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)',
          color: value >= 90 ? '#ef4444' : value >= 75 ? '#f59e0b' : '#e2e8f0' }}>
          {value}%
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)',
        borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          height: '100%', width: `${value}%`,
          background: fill,
          borderRadius: 99,
          transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 10px ${fill}70`,
        }} />
      </div>
    </div>
  )
}

// ─── MINI METRIC ─────────────────────────────────────────────────────────────
export function MiniMetric({ label, value = 0 }) {
  const c = value > 80 ? '#ef4444' : value > 60 ? '#f59e0b' : '#3b82f6'
  return (
    <div style={{ width: 78 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700,
          color: '#334155', letterSpacing: '0.08em' }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: c, fontFamily: 'var(--mono)' }}>
          {value}%
        </span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: c,
          borderRadius: 99, transition: 'width 0.7s ease',
          boxShadow: `0 0 6px ${c}80` }} />
      </div>
    </div>
  )
}

// ─── STATUS DOT ──────────────────────────────────────────────────────────────
export function StatusDot({ status }) {
  const colors = {
    online:   '#10b981',
    offline:  '#ef4444',
    warning:  '#f59e0b',
    checking: '#94a3b8',
  }
  const c = colors[status] || '#94a3b8'
  const anims = {
    online:   'pulse-green 2.5s infinite',
    offline:  'pulse-red 1.2s infinite',
    checking: 'spin 1s linear infinite',
    warning:  'none',
  }
  const isSpinner = status === 'checking'
  return (
    <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
      {status === 'online' && (
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          background: c,
          opacity: 0.4,
          animation: 'ping-ring 1.8s ease-out infinite',
        }} />
      )}
      <div style={{
        width: 10, height: 10, borderRadius: isSpinner ? 2 : '50%',
        background: isSpinner ? 'transparent' : c,
        border: isSpinner ? `2px solid ${c}` : 'none',
        borderTopColor: isSpinner ? 'transparent' : undefined,
        animation: anims[status] || 'none',
        boxShadow: !isSpinner ? `0 0 8px ${c}80` : 'none',
      }} />
    </div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'blue', sub, trend }) {
  const [hov, setHov] = useState(false)
  const colors = {
    blue:   { icon: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)' },
    green:  { icon: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)' },
    red:    { icon: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)' },
    purple: { icon: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)' },
    orange: { icon: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  }
  const c = colors[color] || colors.blue
  return (
    <div className="glass"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 16,
        padding: '22px 20px',
        transition: 'all 0.2s',
        borderColor: hov ? c.border : undefined,
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 8px 30px rgba(0,0,0,0.3)` : 'none',
        cursor: 'default',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ padding: '9px', background: c.bg, borderRadius: 10,
          border: `1px solid ${c.border}` }}>
          <Icon size={20} style={{ color: c.icon, display: 'block' }} />
        </div>
        {sub && (
          <span style={{ fontSize: 11, color: '#334155', background: 'rgba(255,255,255,0.03)',
            padding: '3px 9px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.05)',
            fontWeight: 600 }}>{sub}</span>
        )}
      </div>
      <p style={{ fontSize: 12, color: '#475569', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <h4 style={{ fontSize: 34, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value}</h4>
        {trend !== undefined && (
          <span style={{ fontSize: 12, color: trend >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  )
}

// ─── TAG BADGE ────────────────────────────────────────────────────────────────
export function TagBadge({ tag }) {
  const map = {
    production: { bg: 'rgba(239,68,68,0.1)',  color: '#f87171', border: 'rgba(239,68,68,0.2)' },
    prod:       { bg: 'rgba(239,68,68,0.1)',  color: '#f87171', border: 'rgba(239,68,68,0.2)' },
    database:   { bg: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: 'rgba(139,92,246,0.2)' },
    db:         { bg: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: 'rgba(139,92,246,0.2)' },
    web:        { bg: 'rgba(16,185,129,0.1)', color: '#34d399', border: 'rgba(16,185,129,0.2)' },
    nginx:      { bg: 'rgba(16,185,129,0.1)', color: '#34d399', border: 'rgba(16,185,129,0.2)' },
    dev:        { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
    testing:    { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
    staging:    { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
    api:        { bg: 'rgba(6,182,212,0.1)',  color: '#22d3ee', border: 'rgba(6,182,212,0.2)' },
  }
  const style = map[tag.toLowerCase()] || {
    bg: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'rgba(99,102,241,0.2)',
  }
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
      background: style.bg, color: style.color, border: `1px solid ${style.border}`,
      letterSpacing: '0.05em', textTransform: 'lowercase' }}>
      {tag}
    </span>
  )
}

// ─── FORM INPUT ───────────────────────────────────────────────────────────────
export function Input({ label, ...props }) {
  const [focus, setFocus] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 11, color: '#475569', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      )}
      <input
        {...props}
        onFocus={e => { setFocus(true); props.onFocus?.(e) }}
        onBlur={e => { setFocus(false); props.onBlur?.(e) }}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${focus ? 'rgba(59,130,246,0.5)' : 'var(--border2)'}`,
          boxShadow: focus ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none',
          borderRadius: 9,
          padding: '9px 13px',
          color: 'var(--text)',
          fontSize: 14,
          outline: 'none',
          fontFamily: 'var(--sans)',
          transition: 'all 0.2s',
          ...props.style,
        }}
      />
    </div>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 11, color: '#475569', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      )}
      <select
        {...props}
        style={{
          width: '100%',
          background: 'rgba(8,15,30,0.95)',
          border: '1px solid var(--border2)',
          borderRadius: 9,
          padding: '9px 13px',
          color: 'var(--text)',
          fontSize: 14,
          outline: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--sans)',
          ...props.style,
        }}>
        {children}
      </select>
    </div>
  )
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', disabled, style: s, ...props }) {
  const [hov, setHov] = useState(false)
  const variants = {
    primary: {
      background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
      color: '#fff',
      border: 'none',
      boxShadow: hov ? '0 4px 20px rgba(59,130,246,0.4)' : '0 2px 10px rgba(59,130,246,0.25)',
    },
    secondary: {
      background: hov ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
      color: '#94a3b8',
      border: '1px solid var(--border2)',
      boxShadow: 'none',
    },
    danger: {
      background: hov ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.1)',
      color: '#f87171',
      border: '1px solid rgba(239,68,68,0.25)',
      boxShadow: 'none',
    },
    ghost: {
      background: 'transparent',
      color: hov ? '#e2e8f0' : '#64748b',
      border: 'none',
      boxShadow: 'none',
    },
    success: {
      background: hov ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
      color: '#10b981',
      border: '1px solid rgba(16,185,129,0.25)',
      boxShadow: 'none',
    },
  }
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12 },
    md: { padding: '9px 18px', fontSize: 14 },
    lg: { padding: '12px 24px', fontSize: 15 },
    icon: { padding: '8px', fontSize: 14 },
  }
  const v = variants[variant] || variants.primary
  const sz = sizes[size] || sizes.md
  return (
    <button
      {...props}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...v, ...sz,
        borderRadius: 9,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        fontFamily: 'var(--sans)',
        transition: 'all 0.18s',
        transform: hov && !disabled ? 'translateY(-1px)' : 'none',
        whiteSpace: 'nowrap',
        ...s,
      }}>
      {children}
    </button>
  )
}
