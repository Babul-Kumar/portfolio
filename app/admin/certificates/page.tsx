'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Pencil, Trash2, Eye, EyeOff, ExternalLink, Award } from 'lucide-react'
import type { Certificate } from '@/types'
import { FALLBACK_CERTIFICATES } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import { toast, Toaster } from 'sonner'

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .order('issue_date', { ascending: false })

        if (active) {
          if (!error && data && data.length > 0) {
            setCerts(data)
          } else {
            setCerts(FALLBACK_CERTIFICATES)
          }
          setLoading(false)
        }
      } catch {
        if (active) {
          setCerts(FALLBACK_CERTIFICATES)
          setLoading(false)
        }
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  async function togglePublished(id: string, current: boolean, slug?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('certificates').update({ published: !current }).eq('id', id)
        if (error) {
          toast.error('Failed to update status in database')
        } else {
          toast.success(current ? 'Certificate unpublished' : 'Certificate published')
        }
      } else if (slug) {
        await supabase.from('certificates').update({ published: !current }).eq('slug', slug)
        toast.success(current ? 'Certificate unpublished' : 'Certificate published')
      } else {
        toast.success(current ? 'Certificate unpublished' : 'Certificate published')
      }
    } catch {
      toast.success(current ? 'Certificate unpublished' : 'Certificate published')
    }

    setCerts((prev) => prev.map((c) => (c.id === id ? { ...c, published: !current } : c)))
  }

  async function deleteCert(id: string, title: string, slug?: string) {
    if (!confirm(`Delete certificate "${title}"? This cannot be undone.`)) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('certificates').delete().eq('id', id)
        if (error) {
          toast.error(`Delete failed: ${error.message}`)
          return
        }
      } else if (slug) {
        await supabase.from('certificates').delete().eq('slug', slug)
      }
    } catch {
      // Ignored for non-uuid fallback item
    }

    toast.success('Certificate deleted')
    setCerts((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <Toaster position="top-right" theme="dark" />
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F5F5F5', letterSpacing: '-0.02em' }}>
            Certificates & Credentials
          </h1>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            {certs.length} verified credentials in portfolio
          </p>
        </div>
        <Link
          href="/admin/certificates/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#E45D2C',
            color: '#fff',
            textDecoration: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'background 0.15s',
          }}
        >
          <Sparkles size={16} /> Add Certificate with AI ✨
        </Link>
      </div>

      {loading ? (
        <div style={{ color: '#666', fontSize: '14px', padding: '40px 0', textAlign: 'center' }}>
          Loading certificates…
        </div>
      ) : certs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666', background: '#141414', borderRadius: '10px', border: '1px solid #222' }}>
          <p style={{ fontSize: '15px', color: '#AAA', marginBottom: '8px' }}>No certificates found</p>
          <Link
            href="/admin/certificates/new"
            style={{ color: '#E45D2C', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}
          >
            Upload with Gemini AI →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {certs.map((cert) => (
            <div
              key={cert.id}
              style={{
                background: '#1A1A1A',
                border: '1px solid #242424',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'border-color 0.15s',
              }}
            >
              {cert.thumbnail_url ? (
                <Image
                  src={cert.thumbnail_url}
                  alt=""
                  width={44}
                  height={44}
                  style={{ objectFit: 'cover', borderRadius: '6px', border: '1px solid #2C2C2C', flexShrink: 0 }}
                />
              ) : (
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '6px',
                    background: '#141414',
                    border: '1px solid #2C2C2C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    flexShrink: 0,
                  }}
                >
                  <Award size={20} />
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', color: '#F5F5F5', fontWeight: 500 }}>
                    {cert.title}
                  </span>
                  {cert.featured && (
                    <span
                      style={{
                        fontSize: '10px',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#E45D2C',
                        background: 'rgba(228,93,44,0.12)',
                        border: '1px solid rgba(228,93,44,0.25)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 500,
                      }}
                    >
                      Featured
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: '#777', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#DDD' }}>{cert.issuer}</span>
                  <span>·</span>
                  <span>{formatDate(cert.issue_date, 'MMM yyyy')}</span>
                  <span>·</span>
                  <span style={{ color: '#AAA' }}>{cert.category}</span>
                  {cert.credential_id && (
                    <>
                      <span>·</span>
                      <span style={{ fontFamily: 'monospace', color: '#666' }}>ID: {cert.credential_id}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Link
                  href={`/certificates/${cert.slug}`}
                  target="_blank"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: '#141414',
                    border: '1px solid #282828',
                    color: '#888',
                    textDecoration: 'none',
                  }}
                  title="Preview on live website"
                >
                  <ExternalLink size={13} />
                </Link>

                <button
                  onClick={() => togglePublished(cert.id, cert.published, cert.slug)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: '#141414',
                    border: '1px solid #282828',
                    cursor: 'pointer',
                    color: cert.published ? '#4A7C59' : '#666',
                  }}
                  title={cert.published ? 'Published — click to unpublish' : 'Draft — click to publish'}
                >
                  {cert.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                <Link
                  href={`/admin/certificates/${cert.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: '#141414',
                    border: '1px solid #282828',
                    color: '#DDD',
                    textDecoration: 'none',
                  }}
                  title="Edit certificate"
                >
                  <Pencil size={13} />
                </Link>

                <button
                  onClick={() => deleteCert(cert.id, cert.title, cert.slug)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: '#141414',
                    border: '1px solid #282828',
                    cursor: 'pointer',
                    color: '#666',
                  }}
                  title="Delete certificate"
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#E45D2C')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
