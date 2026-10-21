/**
 * Звуки-«заглушки» на Web Audio: пока нет записанных эффектов, у каждого действия всё равно
 * есть звук (ding на счёте, pop, chomp, splash, fanfare). Файл ничего не знает про useAudio:
 * кнопка «без звука» вызывает `setSynthMuted`. Нет Web Audio: молча ничего не делает.
 */
let ctx: AudioContext | null = null
let muted = false

export function setSynthMuted(value: boolean): void {
  muted = value
}

/** Звукоряд до-мажор, 10 нот: до ре ми фа соль ля си до' ре' ми'. */
export const SCALE = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25]

function audio(): AudioContext | null {
  if (muted || typeof window === 'undefined') return null
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx ??= new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function envelope(c: AudioContext, t: number, peak: number, seconds: number, attack = 0.012): GainNode {
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds)
  return g
}

/** Одна нота. */
export function tone(freq: number, seconds = 0.45, type: OscillatorType = 'triangle', volume = 0.28, delay = 0): void {
  const c = audio()
  if (!c) return
  try {
    const t = c.currentTime + delay
    const osc = c.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    osc.connect(envelope(c, t, volume, seconds)).connect(c.destination)
    osc.start(t)
    osc.stop(t + seconds + 0.05)
  } catch {
    /* без звука */
  }
}

/** Шум (для всплеска, хлопка, «вжух»): `from`→`to` Гц фильтра. */
function noise(seconds: number, from: number, to: number, volume = 0.3, type: BiquadFilterType = 'bandpass', delay = 0): void {
  const c = audio()
  if (!c) return
  try {
    const t = c.currentTime + delay
    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const src = c.createBufferSource()
    src.buffer = buf
    const f = c.createBiquadFilter()
    f.type = type
    f.frequency.setValueAtTime(from, t)
    f.frequency.exponentialRampToValueAtTime(to, t + seconds)
    src.connect(f).connect(envelope(c, t, volume, seconds, 0.008)).connect(c.destination)
    src.start(t)
  } catch {
    /* без звука */
  }
}

/** Колокольчик на счёте: n-я нота звукоряда + нежная октава. */
export function ding(n: number): void {
  const f = SCALE[Math.min(Math.max(n, 1), SCALE.length) - 1]!
  tone(f, 0.55, 'sine', 0.22)
  tone(f * 2, 0.4, 'sine', 0.1, 0.01)
}

/** Хлопок пузыря / лопнувший шарик. */
export function pop(): void {
  tone(900, 0.09, 'sine', 0.3)
  noise(0.08, 3000, 1200, 0.25, 'highpass')
}

/** Ам! Крокодил смыкает пасть. */
export function chomp(): void {
  thump(120)
  noise(0.06, 2400, 800, 0.2, 'bandpass', 0.04)
}

/** Бум барабана: частота падает. */
export function thump(freq = 140): void {
  const c = audio()
  if (!c) return
  try {
    const t = c.currentTime
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq * 1.8, t)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.22)
    osc.connect(envelope(c, t, 0.5, 0.3, 0.004)).connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.35)
  } catch {
    /* без звука */
  }
}

/** Всплеск воды. */
export function splash(): void {
  noise(0.45, 1800, 400, 0.3, 'bandpass')
  noise(0.3, 3500, 900, 0.12, 'highpass', 0.05)
}

/** «Вжух»: что-то пролетело. */
export function whoosh(): void {
  noise(0.35, 400, 3200, 0.22, 'bandpass')
}

/** Прыжок-«боинг». */
export function boing(): void {
  const c = audio()
  if (!c) return
  try {
    const t = c.currentTime
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(220, t)
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.18)
    osc.connect(envelope(c, t, 0.28, 0.3, 0.01)).connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.35)
  } catch {
    /* без звука */
  }
}

/** Мягкий «шлёп» предмета, который опустили на место. */
export function drop(): void {
  tone(180, 0.14, 'sine', 0.3)
  noise(0.05, 1500, 600, 0.12, 'lowpass')
}

/** Ура! Задание пройдено: быстрое арпеджио вверх. */
export function fanfare(): void {
  ;[0, 2, 4, 7].forEach((k, i) => tone(SCALE[k]! * (k === 7 ? 1 : 1), 0.45, 'triangle', 0.22, i * 0.11))
  tone(SCALE[7]! * 2, 0.7, 'sine', 0.12, 0.45)
}
