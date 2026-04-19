import { useState } from 'react'
import { X, Server } from 'lucide-react'
import { Input, Select, Button } from './ui'
import { PROVIDERS, OS_LIST, REGIONS } from '../utils/helpers'

export default function AddModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', ip: '', port: '22', provider: 'DigitalOcean',
    os: 'Ubuntu 22.04 LTS', region: 'Singapore (SGP1)',
    tags: '', notes: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Nama server wajib diisi.'); return }
    if (!form.ip.trim())   { setError('Alamat IP wajib diisi.');   return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 300)) // small UX delay
    onSave({ ...form })
    setSaving(false)
  }

  return (
    <div className="fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
      <div className="slide-right glass" style={{
        borderRadius: 20, width: '100%', maxWidth: 480,
        border: '1px solid var(--border2)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'rgba(59,130,246,0.12)',
              borderRadius: 9, border: '1px solid rgba(59,130,246,0.22)' }}>
              <Server size={16} style={{ color: '#60a5fa' }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 16 }}>Daftarkan VPS Baru</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={16} /></Button>
        </div>

        {/* Form */}
        <form onSubmit={submit}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 8, color: '#f87171', fontSize: 13,
              }}>⚠ {error}</div>
            )}

            <Input label="Nama Server" value={form.name} onChange={set('name')}
              placeholder="Production API Server" required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12 }}>
              <Input label="IP / Hostname" value={form.ip} onChange={set('ip')}
                placeholder="103.45.67.12" required />
              <Input label="Port" value={form.port} onChange={set('port')}
                placeholder="22" type="number" min="1" max="65535" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Select label="Provider" value={form.provider} onChange={set('provider')}>
                {PROVIDERS.map(p => <option key={p}>{p}</option>)}
              </Select>
              <Select label="Region" value={form.region} onChange={set('region')}>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </Select>
            </div>

            <Select label="Sistem Operasi" value={form.os} onChange={set('os')}>
              {OS_LIST.map(o => <option key={o}>{o}</option>)}
            </Select>

            <Input label="Tags (pisahkan koma)" value={form.tags} onChange={set('tags')}
              placeholder="production, api, web" />

            <Input label="Catatan (opsional)" value={form.notes} onChange={set('notes')}
              placeholder="Deskripsi singkat server..." />
          </div>

          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: 10,
          }}>
            <Button type="button" variant="secondary" style={{ flex: 1 }} onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" style={{ flex: 1 }} disabled={saving}>
              {saving ? '⏳ Menyimpan...' : '✓ Simpan Server'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
