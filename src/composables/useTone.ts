import { useAudio } from './useAudio'

let ctx: AudioContext | null = null

/**
 * Простые ноты через Web Audio: для заданий-инструментов (барабан, ксилофон), пока нет записанных звуков.
 * Уважает кнопку «без звука». Если Web Audio недоступно, молча ничего не делает.
 */
export function useTone() {
  const { muted } = useAudio()

  function tone(freq: number, seconds = 0.45, type: OscillatorType = 'triangle', volume = 0.28): void {
    if (muted.value || typeof window === 'undefined') return
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx ??= new AC()
      if (ctx.state === 'suspended') void ctx.resume()
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(volume, t + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + seconds + 0.05)
    } catch {
      /* без звука */
    }
  }

  /** Короткий «бум» барабана: частота падает. */
  function thump(freq = 140): void {
    if (muted.value || typeof window === 'undefined') return
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx ??= new AC()
      if (ctx.state === 'suspended') void ctx.resume()
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq * 1.8, t)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.22)
      gain.gain.setValueAtTime(0.5, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.35)
    } catch {
      /* без звука */
    }
  }

  return { tone, thump }
}

/** Звукоряд до-мажор: до ре ми фа соль ля си до-второй октавы. */
export const SCALE = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25]
