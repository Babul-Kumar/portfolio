/**
 * Web Audio Synthesizer Micro-Haptics
 * Synthesizes subtle mechanical clicks, interface chirps, and telemetry pings
 * using native browser AudioContext (zero external audio files or downloads).
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null
  private enabled: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.enabled = localStorage.getItem('bk_sfx_enabled') === 'true'
      } catch {
        this.enabled = false
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public toggle(): boolean {
    this.enabled = !this.enabled
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bk_sfx_enabled', this.enabled ? 'true' : 'false')
      } catch {}
    }
    if (this.enabled) {
      this.playChirp()
    }
    return this.enabled
  }

  public setEnabled(val: boolean): void {
    this.enabled = val
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bk_sfx_enabled', val ? 'true' : 'false')
      } catch {}
    }
  }

  /**
   * Crisp, subtle mechanical key click (25ms)
   */
  public playClick(pitch = 640): void {
    if (!this.enabled) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(pitch, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.45, ctx.currentTime + 0.025)

      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.025)
    } catch {}
  }

  /**
   * Delicate telemetry hover tick (15ms)
   */
  public playHover(pitch = 880): void {
    if (!this.enabled) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(pitch, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.2, ctx.currentTime + 0.015)

      gain.gain.setValueAtTime(0.015, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.015)
    } catch {}
  }

  /**
   * Confirmation chirp (two-tone rising pulse)
   */
  public playChirp(): void {
    if (!this.enabled) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.setValueAtTime(780, now + 0.035)

      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.09)
    } catch {}
  }
}

export const sound = new SoundSynthesizer()

// Direct functional helper exports
export const isSfxEnabled = () => sound.isEnabled()
export const setSfxEnabled = (val: boolean) => sound.setEnabled(val)
export const toggleSfx = () => sound.toggle()
export const playMechanicalClick = (pitch?: number) => sound.playClick(pitch)
export const playHoverTick = (pitch?: number) => sound.playHover(pitch)
export const playChirp = () => sound.playChirp()
