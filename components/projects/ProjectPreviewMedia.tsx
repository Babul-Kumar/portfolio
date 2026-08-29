'use client'

import { useState } from 'react'
import { getProjectPublicAssetUrl } from '@/lib/supabase/storage'
import { CheckCircle2, Eye } from 'lucide-react'

interface ProjectPreviewMediaProps {
  imageUrl?: string | null
  title: string
  slug: string
  category?: string
  technologies?: string[]
  isFeatured?: boolean
  height?: string
  onPreviewClick?: () => void
}

export default function ProjectPreviewMedia({
  imageUrl,
  title,
  slug,
  technologies = [],
  isFeatured = false,
  height,
  onPreviewClick,
}: ProjectPreviewMediaProps) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const resolvedUrl = getProjectPublicAssetUrl(imageUrl)
  const containerHeight = height || (isFeatured ? '195px' : '155px')

  // 1. Real Uploaded Project Screenshot / Media Display
  if (resolvedUrl && !imageError) {
    return (
      <div
        className="project-media-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '100%',
          height: containerHeight,
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#0B0D13',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onPreviewClick ? 'pointer' : 'default',
        }}
        onClick={onPreviewClick ? (e) => {
          e.stopPropagation()
          e.preventDefault()
          onPreviewClick()
        } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvedUrl}
          alt={`Project visual preview for ${title}`}
          className="work-preview-media"
          onError={() => setImageError(true)}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
            transform: isHovered ? 'scale(1.025)' : 'scale(1)',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Hover / Corner Preview Button */}
        {onPreviewClick && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: isHovered ? 'rgba(6, 7, 9, 0.55)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: isHovered ? 'relative' : 'absolute',
                bottom: isHovered ? undefined : '10px',
                right: isHovered ? undefined : '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: isHovered ? 'rgba(14, 16, 23, 0.92)' : 'rgba(14, 16, 23, 0.75)',
                border: isHovered ? '1px solid var(--color-accent)' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '4px',
                padding: isHovered ? '6px 12px' : '4px 7px',
                color: isHovered ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.6), 0 0 10px var(--color-accent-glow)' : 'none',
                transition: 'all 0.2s ease',
                pointerEvents: 'auto',
              }}
            >
              <Eye size={isHovered ? 13 : 12} />
              {isHovered ? (
                <span>VIEW PREVIEW →</span>
              ) : (
                <span style={{ fontSize: '10px', opacity: 0.85 }}>PREVIEW</span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 2. High-Density Technical Code & Architecture Snippet Fallback
  const snippet = getProjectSnippet(slug, technologies)

  return (
    <div
      className="work-preview-media"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPreviewClick ? (e) => {
        e.stopPropagation()
        e.preventDefault()
        onPreviewClick()
      } : undefined}
      style={{
        width: '100%',
        height: containerHeight,
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        border: isHovered && onPreviewClick ? '1px solid var(--color-accent)' : '1px solid rgba(255, 255, 255, 0.09)',
        background: '#0D0F17',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-mono, monospace)',
        position: 'relative',
        cursor: onPreviewClick ? 'pointer' : 'default',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease',
      }}
    >
      {/* Mini Titlebar */}
      <div
        style={{
          height: '24px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '0 10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '9.5px',
          color: 'var(--color-text-muted)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }} />
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
          <span style={{ marginLeft: '4px', color: '#A0AEC0' }}>{snippet.fileName}</span>
        </div>

        <span
          style={{
            fontSize: '8.5px',
            color: 'var(--color-accent)',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {snippet.badge}
        </span>
      </div>

      {/* High-Density Code & Architecture Body */}
      <div
        style={{
          flex: 1,
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(13, 15, 23, 0.95) 0%, rgba(9, 11, 17, 0.98) 100%)',
          fontSize: '11px',
          lineHeight: 1.45,
          overflow: 'hidden',
        }}
      >
        {/* Real Code Snippet Lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {snippet.lines.map((line, i) => (
            <div
              key={i}
              style={{
                color: line.color,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '10.5px',
              }}
            >
              {line.text}
            </div>
          ))}
        </div>

        {/* Live Architecture Status Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '6px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '9.5px',
            color: 'var(--color-text-muted)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
            <CheckCircle2 size={10} />
            <span>{snippet.statusText}</span>
          </span>

          <span
            style={{
              color: 'var(--color-text-secondary)',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '1px 6px',
              borderRadius: '2px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {snippet.runtimeTag}
          </span>
        </div>
      </div>

      {onPreviewClick && isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(6, 7, 9, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(14, 16, 23, 0.95)',
              border: '1px solid var(--color-accent)',
              borderRadius: '4px',
              padding: '6px 12px',
              color: 'var(--color-accent)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(0,0,0,0.6), 0 0 10px var(--color-accent-glow)',
            }}
          >
            <Eye size={13} />
            <span>VIEW PREVIEW →</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface SnippetConfig {
  fileName: string
  badge: string
  lines: { text: string; color: string }[]
  statusText: string
  runtimeTag: string
}

function getProjectSnippet(slug: string, technologies: string[]): SnippetConfig {
  switch (slug) {
    case 'botbro-local-ai-desktop-orchestration-system':
      return {
        fileName: 'botbro_agent.py',
        badge: 'LOCAL_AGENT_ACTIVE',
        lines: [
          { text: 'engine = DesktopOrchestrator(model="qwen2.5:7b-coder")', color: '#93C5FD' },
          { text: 'intent = engine.parse_voice_intent(user_audio)', color: '#FCD34D' },
          { text: 'engine.execute_win32_action(intent.action_tree)', color: '#6EE7B7' },
          { text: '# Zero Cloud Latency · 18 Subsystems Connected', color: '#6B7280' },
        ],
        statusText: '18 Win32 APIs Active',
        runtimeTag: 'Ollama + Python',
      }

    case 'flight-delay-prediction-system':
      return {
        fileName: 'flight_delay_model.py',
        badge: 'ML_PIPELINE_OK',
        lines: [
          { text: 'model = RandomForestClassifier(n_estimators=100)', color: '#93C5FD' },
          { text: 'y_pred = model.predict(preprocessed_features)', color: '#FCD34D' },
          { text: 'score = roc_auc_score(y_test, y_pred) # 94.2%', color: '#6EE7B7' },
        ],
        statusText: 'Dataset: 434K Records',
        runtimeTag: 'Scikit-learn + Joblib',
      }

    case 'smart-system-monitor':
      return {
        fileName: 'system_telemetry.py',
        badge: 'HARDWARE_STREAM',
        lines: [
          { text: 'cpu_usage = psutil.cpu_percent(interval=1.0)', color: '#93C5FD' },
          { text: 'mem_info = psutil.virtual_memory() # 4.2GB/16GB', color: '#FCD34D' },
          { text: 'render_realtime_stream(cpu_usage, mem_info)', color: '#6EE7B7' },
        ],
        statusText: 'Polling: 1000ms Interval',
        runtimeTag: 'Python + psutil',
      }

    case 'steganography-detector':
      return {
        fileName: 'stego_forensics.py',
        badge: 'ENTROPY_ANALYSIS',
        lines: [
          { text: 'entropy = calculate_shannon_entropy(image_pixels)', color: '#93C5FD' },
          { text: 'lsb_bits = extract_lsb_plane(image_array, bit=0)', color: '#FCD34D' },
          { text: 'payload = detect_anomaly_distribution(lsb_bits)', color: '#6EE7B7' },
        ],
        statusText: 'LSB Bit Plane Scanned',
        runtimeTag: 'OpenCV + NumPy',
      }

    case 'ai-product-review-analyzer':
      return {
        fileName: 'review_nlp.py',
        badge: 'TRANSFORMER_NLP',
        lines: [
          { text: 'tokens = tokenizer(review_text, return_tensors="pt")', color: '#93C5FD' },
          { text: 'sentiment = transformer_model(**tokens).logits', color: '#FCD34D' },
          { text: 'aspects = extract_opinion_mining_pairs(tokens)', color: '#6EE7B7' },
        ],
        statusText: 'Inference: <35ms Latency',
        runtimeTag: 'Transformers + PyTorch',
      }

    case 'page-replacement-simulator':
    case 'efficient-page-replacement-algorithm-simulator':
      return {
        fileName: 'os_paging_sim.py',
        badge: 'PAGE_FAULT_ANALYTICS',
        lines: [
          { text: 'sim = MemoryPagingSimulator(frames=4, policy="LRU")', color: '#93C5FD' },
          { text: 'for ref in access_trace: sim.access(ref)', color: '#FCD34D' },
          { text: 'report = compare_fault_ratios(FIFO, LRU, OPT)', color: '#6EE7B7' },
        ],
        statusText: 'LRU Fault Ratio: 14.2%',
        runtimeTag: 'OS Architecture Sim',
      }

    case 'pollution-monitoring':
    case 'city-pollution-monitor':
      return {
        fileName: 'air_quality_portal.js',
        badge: 'AQI_TELEMETRY',
        lines: [
          { text: 'const aqiData = await fetchAirQualityIndex(station)', color: '#93C5FD' },
          { text: 'const { pm25, pm10 } = parsePollutants(aqiData)', color: '#FCD34D' },
          { text: 'renderRegionalHeatmap({ pm25, pm10, aqi })', color: '#6EE7B7' },
        ],
        statusText: 'Live Sensor Ingestion',
        runtimeTag: 'JavaScript + REST API',
      }

    default:
      return {
        fileName: `${slug.slice(0, 16)}.py`,
        badge: 'SYSTEM_READY',
        lines: [
          { text: `import ${technologies[0] || 'os'}`, color: '#93C5FD' },
          { text: `app = initialize_engine("${technologies[1] || 'core'}")`, color: '#FCD34D' },
          { text: 'app.start_service_daemon() # Ready', color: '#6EE7B7' },
        ],
        statusText: 'Service Status: OK',
        runtimeTag: technologies[0] || 'Python',
      }
  }
}
