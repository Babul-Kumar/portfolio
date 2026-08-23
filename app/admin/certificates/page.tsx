'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Certificate } from '@/types'
import { formatDate } from '@/lib/utils'

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .order('issue_date', { ascending: false })
    setCerts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function togglePublished(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('certificates').update({ published: !current }).eq('id', id)
    setCerts((prev) => prev.map((c) => c.id === id ? { ...c, published: !current } : c))
  }

  async function deleteCert(id: string) {
    if (!confirm('Delete this certificate? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('certificates').delete().eq('id', id)
    setCerts((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#F5F5F5' }}>Certificates</h1>
          <p style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>{certs.length} total</p>
        </div>
        <Link href="/admin/certificates/new" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#B65C3A', color: '#fff', textDecoration: 'none',
          padding: '10px 16px', borderRadius: '8px', fontSize: '13px',
        }}>
          <Plus size={15} /> Add Certificate
        </Link>
      </div>

      {loading ? (
        <div style={{ color: '#555', fontSize: '14px' }}>Loading…</div>
      ) : certs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
          <p>No certificates yet.</p>
          <Link href="/admin/certificates/new" style={{ color: '#B65C3A', fontSize: '13px' }}>Add your first certificate →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {certs.map((cert) => (
            <div key={cert.id} style={{
              background: '#1A1A1A', border: '1px solid #222', borderRadius: '8px',
              padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              {cert.thumbnail_url && (
                <img src={cert.thumbnail_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #2C2C2C' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', color: '#F5F5F5', fontWeight: 500, marginBottom: '2px' }}>
                  {cert.title}
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  {cert.issuer} · {formatDate(cert.issue_date)} · {cert.category}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button
                  onClick={() => togglePublished(cert.id, cert.published)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: cert.published ? '#4A7C59' : '#555', padding: '8px' }}
                >
                  {cert.published ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <Link href={`/admin/certificates/${cert.id}`} style={{ padding: '8px', color: '#555', display: 'flex' }}>
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => deleteCert(cert.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#555' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#C96B46')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
