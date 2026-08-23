'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormValues } from '@/lib/validations'

const inp = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--color-border)',
  padding: '12px 0',
  color: 'var(--color-text)',
  fontSize: '16px',
  fontFamily: 'inherit',
  outline: 'none',
  resize: 'vertical' as const,
  transition: 'border-color 0.2s',
}

export default function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit(data: ContactFormValues) {
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section style={{ padding: 'var(--section-gap) var(--container-pad)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Asymmetric layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '80px', alignItems: 'start' }}>
          {/* Left */}
          <div>
            <div className="text-label" style={{ marginBottom: '16px' }}>08 / Contact</div>
            <h2 style={{
              fontSize: 'clamp(36px, 5vw, 72px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
              color: 'var(--color-text)',
              marginBottom: '24px',
            }}>
              Let&apos;s<br />talk.
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '320px' }}>
              Open to internships, research collaborations, and interesting conversations. Feel free to reach out.
            </p>

            {/* Direct links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'GitHub', href: 'https://github.com/babul-kumar' },
                { label: 'LinkedIn', href: 'https://linkedin.com/in/babul-kumar' },
                { label: 'Kaggle', href: 'https://kaggle.com/babul-kumar' },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" style={{
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                >
                  <span style={{ fontSize: '18px', opacity: 0.4 }}>↗</span> {label}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div>
            {status === 'success' ? (
              <div style={{
                padding: '48px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>✓</div>
                <h3 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '8px' }}>Message sent</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>I&apos;ll get back to you soon.</p>
                <button onClick={() => setStatus('idle')} style={{
                  marginTop: '24px', background: 'none', border: '1px solid var(--color-border)',
                  borderRadius: '4px', padding: '10px 20px', cursor: 'pointer',
                  fontSize: '13px', color: 'var(--color-text)',
                }}>
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                    Name
                  </label>
                  <input
                    {...register('name')}
                    style={inp}
                    placeholder="Your name"
                    onFocus={(e) => (e.target.style.borderBottomColor = 'var(--color-accent)')}
                    onBlur={(e) => (e.target.style.borderBottomColor = 'var(--color-border)')}
                  />
                  {errors.name && <p style={{ fontSize: '12px', color: 'var(--color-accent)', marginTop: '4px' }}>{errors.name.message}</p>}
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                    Email
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    style={inp}
                    placeholder="your@email.com"
                    onFocus={(e) => (e.target.style.borderBottomColor = 'var(--color-accent)')}
                    onBlur={(e) => (e.target.style.borderBottomColor = 'var(--color-border)')}
                  />
                  {errors.email && <p style={{ fontSize: '12px', color: 'var(--color-accent)', marginTop: '4px' }}>{errors.email.message}</p>}
                </div>

                <div style={{ marginBottom: '40px' }}>
                  <label style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                    Message
                  </label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    style={inp}
                    placeholder="What's on your mind?"
                    onFocus={(e) => (e.target.style.borderBottomColor = 'var(--color-accent)')}
                    onBlur={(e) => (e.target.style.borderBottomColor = 'var(--color-border)')}
                  />
                  {errors.message && <p style={{ fontSize: '12px', color: 'var(--color-accent)', marginTop: '4px' }}>{errors.message.message}</p>}
                </div>

                {status === 'error' && (
                  <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--color-accent)' }}>
                    Something went wrong. Please try again.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    background: 'var(--color-text)',
                    color: 'var(--color-bg)',
                    border: 'none',
                    padding: '14px 32px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    letterSpacing: '0.04em',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    opacity: status === 'loading' ? 0.7 : 1,
                    transition: 'opacity 0.2s',
                    fontWeight: 500,
                  }}
                >
                  {status === 'loading' ? 'Sending…' : 'Send message →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  )
}
