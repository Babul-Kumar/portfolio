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

  /**
   * Sci-Fi Quantum Transmission Warp & Delivery Chime (~1.2s)
   */
  public playTransmissionWarp(): void {
    if (!this.enabled) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      // Phase 1: Rising warp sweep
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.6)
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.045, now + 0.45)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.65)

      // Phase 2: Harmonic delivery triad chime (at t + 0.6s)
      const chimeNotes = [523.25, 659.25, 783.99] // C5, E5, G5
      chimeNotes.forEach((freq, idx) => {
        const cOsc = ctx.createOscillator()
        const cGain = ctx.createGain()
        cOsc.type = 'triangle'
        cOsc.frequency.setValueAtTime(freq, now + 0.6 + idx * 0.04)
        cGain.gain.setValueAtTime(0.03, now + 0.6 + idx * 0.04)
        cGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
        cOsc.connect(cGain)
        cGain.connect(ctx.destination)
        cOsc.start(now + 0.6 + idx * 0.04)
        cOsc.stop(now + 1.2)
      })
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
export const playTransmissionWarp = () => sound.playTransmissionWarp()

