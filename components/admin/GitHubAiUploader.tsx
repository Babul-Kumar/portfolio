'use client'

import { useState, useRef } from 'react'
import {
  Sparkles,
  GitFork,
  Star,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Cpu,
  ArrowRight,
  ClipboardPaste,
  X,
} from 'lucide-react'
import type { GitHubProjectAnalysis } from '@/types'
import { toast } from 'sonner'
import StatusBadge from './StatusBadge'

export type AnalysisStage =
  | 'IDLE'
  | 'ANALYZING'
  | 'SUCCESS'
  | 'ERROR'

interface GitHubAiUploaderProps {
  onApplyAnalysis: (data: GitHubProjectAnalysis, mode: 'all' | 'empty-only') => void
  hasExistingData?: boolean | (() => boolean)
  disabled?: boolean
}

const ANALYSIS_STEPS = [
  'Validating GitHub repository URL…',
  'Fetching repository details & README.md…',
  'Inspecting dependency manifests & frameworks…',
  'Analyzing architecture with Gemini AI…',
  'Extracting structured fields & features…',
]

export default function GitHubAiUploader({
  onApplyAnalysis,
  hasExistingData = false,
  disabled = false,
}: GitHubAiUploaderProps) {
  const [repoUrl, setRepoUrl] = useState('')
  const [stage, setStage] = useState<AnalysisStage>('IDLE')
  const [activeStep, setActiveStep] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<GitHubProjectAnalysis | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'problem-solution' | 'architecture' | 'features'>('overview')

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setRepoUrl(text.trim())
        toast.info('Pasted URL from clipboard')
      }
    } catch {
      toast.error('Clipboard access not granted. Please paste manually.')
    }
  }

  async function runAnalysis(forceRefresh = false) {
    if (!repoUrl.trim()) {
      toast.error('Please enter a GitHub repository URL')
      return
    }

    setStage('ANALYZING')
    setErrorMessage(null)
    setActiveStep(0)

    // Animated stepper progression
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1200)

    try {
      const res = await fetch('/api/admin/projects/analyze-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl.trim(), forceRefresh }),
      })

      const data = await res.json()

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze repository')
      }

      setAnalysisResult(data.data)
      setStage('SUCCESS')
      toast.success(
        data.cached
          ? 'Repository analysis loaded from cache'
          : 'AI repository analysis completed successfully!'
      )
    } catch (err: unknown) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      setStage('ERROR')
      const msg = err instanceof Error ? err.message : 'Analysis failed'
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  function handleApplyClick() {
    if (!analysisResult) return

    const hasData =
      typeof hasExistingData === 'function' ? hasExistingData() : Boolean(hasExistingData)

    if (hasData) {
      setShowConflictDialog(true)
    } else {
      onApplyAnalysis(analysisResult, 'all')
      toast.success('Project form populated with AI analysis')
    }
  }

  function handleConfirmApply(mode: 'all' | 'empty-only') {
    if (!analysisResult) return
    onApplyAnalysis(analysisResult, mode)
    setShowConflictDialog(false)
    toast.success(
      mode === 'all'
        ? 'Overwrote form with AI analysis'
        : 'Populated empty fields with AI analysis'
    )
  }

  function handleReset() {
    setStage('IDLE')
    setAnalysisResult(null)
    setErrorMessage(null)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  return (
    <div
      style={{
        background: '#101318',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header Plaque */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'rgba(228, 93, 44, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E45D2C',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#F5F5F5', margin: 0 }}>
              AI GitHub Repository Import
            </h2>
          </div>
        </div>

        <StatusBadge type="ai" label="Gemini 2.5 Flash" />
      </div>

      <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.5, margin: '0 0 20px' }}>
        Paste a GitHub repository URL. Google Gemini will analyze the README, dependency
        manifests, and metadata to generate project descriptions, problem/solution narratives, tech
        stacks, and features.
      </p>

      {/* Input Group */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                runAnalysis()
              }
            }}
            placeholder="https://github.com/username/repository"
            disabled={stage === 'ANALYZING' || disabled}
            style={{
              width: '100%',
              background: '#0D0F14',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '11px 40px 11px 14px',
              color: '#F5F5F5',
              fontSize: '13px',
              fontFamily: 'var(--font-mono, monospace)',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
          />

          {repoUrl && (
            <button
              type="button"
              onClick={() => setRepoUrl('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#6B7280',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
              }}
              title="Clear input"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handlePaste}
          disabled={stage === 'ANALYZING' || disabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#D1D5DB',
            borderRadius: '8px',
            padding: '11px 14px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          title="Paste URL from clipboard"
        >
          <ClipboardPaste size={15} /> Paste
        </button>

        <button
          type="button"
          onClick={() => runAnalysis(false)}
          disabled={stage === 'ANALYZING' || !repoUrl.trim() || disabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background:
              stage === 'ANALYZING'
                ? '#333'
                : 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '11px 20px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: stage === 'ANALYZING' || !repoUrl.trim() ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(228, 93, 44, 0.25)',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
        >
          <Sparkles size={15} />
          {stage === 'ANALYZING' ? 'Analyzing Repository…' : 'Analyze Repository ✨'}
        </button>
      </div>

      {/* Analyzing Stepper */}
      {stage === 'ANALYZING' && (
        <div
          style={{
            background: '#0D0F14',
            border: '1px solid rgba(228, 93, 44, 0.25)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#FF8A3D',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '12px',
            }}
          >
            <Cpu size={16} className="animate-pulse" />
            <span>AI Repository Analysis in Progress…</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ANALYSIS_STEPS.map((step, idx) => {
              const isDone = idx < activeStep
              const isCurrent = idx === activeStep
              return (
                <div
                  key={step}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: isDone ? '#10B981' : isCurrent ? '#F5F5F5' : '#4B5563',
                    transition: 'color 0.2s',
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                  ) : isCurrent ? (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#E45D2C',
                        margin: '3px',
                        flexShrink: 0,
                      }}
                      className="animate-ping"
                    />
                  ) : (
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#374151',
                        margin: '4px',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span>{step}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error Notice */}
      {stage === 'ERROR' && errorMessage && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            color: '#FCA5A5',
            fontSize: '13px',
          }}
        >
          <AlertTriangle size={18} style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#FFFFFF' }}>Analysis Error:</strong> {errorMessage}
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => runAnalysis(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Retry Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Preview Card */}
      {stage === 'SUCCESS' && analysisResult && (
        <div
          style={{
            background: '#0D0F14',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          {/* Top Bar with Repo Meta */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              paddingBottom: '14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#F5F5F5',
                  letterSpacing: '-0.01em',
                }}
              >
                {analysisResult.title}
              </span>
              <StatusBadge type="category" label={analysisResult.category} />
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#E45D2C',
                }}
              >
                /{analysisResult.slug}
              </span>
            </div>

            {analysisResult.repo_metadata && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '12px',
                  color: '#9CA3AF',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={13} style={{ color: '#EAB308' }} /> {analysisResult.repo_metadata.stars}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <GitFork size={13} /> {analysisResult.repo_metadata.forks}
                </span>
                {analysisResult.repo_metadata.language && (
                  <span style={{ color: '#D1D5DB' }}>{analysisResult.repo_metadata.language}</span>
                )}
              </div>
            )}
          </div>

          {/* Extracted Technologies */}
          {analysisResult.technologies.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {analysisResult.technologies.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    background: '#151921',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#E5E7EB',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '14px',
              paddingBottom: '2px',
            }}
          >
            {[
              { id: 'overview', label: 'Overview & Pitch' },
              { id: 'problem-solution', label: 'Problem & Solution' },
              { id: 'architecture', label: 'Architecture & Results' },
              { id: 'features', label: `Features (${analysisResult.features.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  background: activeTab === tab.id ? '#1A1E27' : 'transparent',
                  border: 'none',
                  borderRadius: '6px 6px 0 0',
                  color: activeTab === tab.id ? '#FFFFFF' : '#9CA3AF',
                  fontSize: '12px',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  padding: '7px 12px',
                  cursor: 'pointer',
                  borderBottom:
                    activeTab === tab.id ? '2px solid #E45D2C' : '2px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {analysisResult.short_desc && (
                <p style={{ fontSize: '13px', color: '#F3F4F6', fontWeight: 500, margin: 0 }}>
                  {analysisResult.short_desc}
                </p>
              )}
              {analysisResult.description && (
                <p
                  style={{
                    fontSize: '12px',
                    color: '#9CA3AF',
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {analysisResult.description}
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Problem & Solution */}
          {activeTab === 'problem-solution' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div
                style={{
                  background: '#131720',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#E45D2C',
                    textTransform: 'uppercase',
                  }}
                >
                  Problem
                </span>
                <p style={{ fontSize: '12px', color: '#D1D5DB', marginTop: '6px', margin: 0 }}>
                  {analysisResult.problem || 'Not specified in repository'}
                </p>
              </div>

              <div
                style={{
                  background: '#131720',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#10B981',
                    textTransform: 'uppercase',
                  }}
                >
                  Solution
                </span>
                <p style={{ fontSize: '12px', color: '#D1D5DB', marginTop: '6px', margin: 0 }}>
                  {analysisResult.solution || 'Not specified in repository'}
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Architecture */}
          {activeTab === 'architecture' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {analysisResult.architecture && (
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#8A8F98' }}>
                    ARCHITECTURE & DATA FLOW
                  </span>
                  <p style={{ fontSize: '12px', color: '#D1D5DB', lineHeight: 1.5, margin: '4px 0 0' }}>
                    {analysisResult.architecture}
                  </p>
                </div>
              )}
              {analysisResult.results && (
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#8A8F98' }}>
                    BENCHMARKS & RESULTS
                  </span>
                  <p style={{ fontSize: '12px', color: '#D1D5DB', lineHeight: 1.5, margin: '4px 0 0' }}>
                    {analysisResult.results}
                  </p>
                </div>
              )}
              {analysisResult.challenges && (
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#8A8F98' }}>
                    CHALLENGES & TRADE-OFFS
                  </span>
                  <p style={{ fontSize: '12px', color: '#D1D5DB', lineHeight: 1.5, margin: '4px 0 0' }}>
                    {analysisResult.challenges}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Features */}
          {activeTab === 'features' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {analysisResult.features.map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#E5E7EB',
                  }}
                >
                  <CheckCircle2
                    size={14}
                    style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }}
                  />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '18px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => runAnalysis(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#9CA3AF',
                  padding: '7px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
                title="Bypass cache and analyze fresh repository commit"
              >
                <RotateCcw size={13} /> Re-analyze (Fresh)
              </button>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6B7280',
                  padding: '7px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>

            <button
              type="button"
              onClick={handleApplyClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              }}
            >
              <span>Apply to Form</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Conflict Resolution Modal Dialog */}
      {showConflictDialog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            padding: '20px',
          }}
          onClick={() => setShowConflictDialog(false)}
        >
          <div
            style={{
              background: '#13171F',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F5F5F5', margin: '0 0 8px' }}>
              Apply AI Analysis to Form
            </h3>
            <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.5, margin: '0 0 20px' }}>
              Your project form already has some manually entered text. How would you like to apply
              the AI analysis results?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => handleConfirmApply('empty-only')}
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F5F5F5',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, color: '#10B981', marginBottom: '2px' }}>
                  ✓ Apply only to empty fields (Recommended)
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  Preserves your existing manual edits and only fills blank fields.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmApply('all')}
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F5F5F5',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, color: '#FF8A3D', marginBottom: '2px' }}>
                  Overwrite all fields with AI data
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  Replaces title, descriptions, problem, solution, and tech stack with fresh AI analysis.
                </div>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowConflictDialog(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8A8F98',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: '6px 12px',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
