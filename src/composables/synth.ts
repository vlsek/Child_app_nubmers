/**
 * Звуки-«заглушки» на Web Audio: пока нет записанных эффектов, у каждого действия всё равно
 * есть звук (ding на счёте, pop, chomp, splash, fanfare). Файл ничего не знает про useAudio:
 * кнопка «без звука» вызывает `setSynthMuted`. Нет Web Audio: молча ничего не делает.
 */
let ctx: AudioContext | null = null
let muted = false
/** Громкость канала «эффекты» (0…1); задаёт useAudio. */
let sfxVolume = 0.8
let master: GainNode | null = null

export function setSynthMuted(value: boolean): void {
  muted = value
  if (value) stopRecordedSfx()
}

export function setSynthVolume(value: number): void {
  sfxVolume = Math.min(1, Math.max(0, value))
  if (master) master.gain.value = sfxVolume
}

/** Свернули приложение: Web Audio засыпает, а при возврате просыпается. */
export function suspendSynth(): void {
  if (ctx && ctx.state === 'running') void ctx.suspend().catch(() => {})
}
export function resumeSynth(): void {
  if (ctx && ctx.state === 'suspended' && !muted) void ctx.resume().catch(() => {})
}

/** Общий регулятор громкости: все синтез-звуки идут через него. */
function dest(c: AudioContext): AudioNode {
  if (!master || master.context !== c) {
    master = c.createGain()
    master.gain.value = sfxVolume
    master.connect(dest(c))
  }
  return master
}

/**
 * Записанные эффекты: файлы `src/assets/audio/sfx/<имя>.mp3`. Если есть `pop.mp3`, `pop-2.mp3`,
 * `pop-3.mp3`, играет случайный из них, но не один и тот же два раза подряд. Нет файла: звучит синтез,
 * поэтому все вызовы `pop()`, `chomp()` и других подхватят записи без правок в заданиях.
 */
const sfxFiles = import.meta.glob('@/assets/audio/sfx/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const sfxUrls: Record<string, string[]> = {}
for (const [path, url] of Object.entries(sfxFiles)) {
  const file = path.split('/').pop()!.replace(/\.mp3$/, '')
  const base = file.replace(/-\d+$/, '')
  ;(sfxUrls[base] ??= []).push(url)
}
const lastSfx: Record<string, number> = {}
const playing = new Set<HTMLAudioElement>()

/** Есть ли записанный эффект с таким именем. */
export function hasSfx(name: string): boolean {
  return !!sfxUrls[name]?.length
}

function stopRecordedSfx(): void {
  playing.forEach((a) => a.pause())
  playing.clear()
}

/** Играет записанный эффект; false, если записи нет (тогда вызывающий включает синтез). */
export function playRecorded(name: string): boolean {
  const list = sfxUrls[name]
  if (!list?.length || typeof Audio === 'undefined') return false
  if (muted) return true
  let i = Math.floor(Math.random() * list.length)
  if (list.length > 1 && i === lastSfx[name]) i = (i + 1) % list.length
  lastSfx[name] = i
  const a = new Audio(list[i])
  a.volume = sfxVolume
  playing.add(a)
  const done = () => playing.delete(a)
  a.onended = done
  a.onerror = done
  a.play().catch(done)
  return true
}

/** Звукоряд до-мажор, 10 нот: до ре ми фа соль ля си до' ре' ми'. */
export const SCALE = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25]

function audio(): AudioContext | null {
  if (muted || typeof window === 'undefined') return null
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx ??= new AC()
    if (ctx.state === 'suspended' && !(typeof document !== 'undefined' && document.hidden)) void ctx.resume()
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
    osc.connect(envelope(c, t, volume, seconds)).connect(dest(c))
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
    src.connect(f).connect(envelope(c, t, volume, seconds, 0.008)).connect(dest(c))
    src.start(t)
  } catch {
    /* без звука */
  }
}

/** Колокольчик на счёте: n-я нота звукоряда + нежная октава. */
export function ding(n: number): void {
  if (playRecorded(`ding-${Math.min(Math.max(n, 1), SCALE.length)}`)) return
  const f = SCALE[Math.min(Math.max(n, 1), SCALE.length) - 1]!
  tone(f, 0.55, 'sine', 0.22)
  tone(f * 2, 0.4, 'sine', 0.1, 0.01)
}

/** Хлопок пузыря / лопнувший шарик. */
export function pop(): void {
  if (playRecorded('pop')) return
  noise(0.09, 6000, 1500, 0.55, 'highpass')
  noise(0.05, 2500, 900, 0.3, 'bandpass', 0.005)
  glide([1300, 260], 0.08, 'triangle', 0.3, 4000)
}

/** Ам! Крокодил смыкает пасть. */
export function chomp(): void {
  if (playRecorded('chomp')) return
  thump(120)
  noise(0.06, 2400, 800, 0.2, 'bandpass', 0.04)
}

/** Бум барабана: частота падает. */
export function thump(freq = 140): void {
  if (playRecorded('thump')) return
  const c = audio()
  if (!c) return
  try {
    const t = c.currentTime
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq * 1.8, t)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.22)
    osc.connect(envelope(c, t, 0.5, 0.3, 0.004)).connect(dest(c))
    osc.start(t)
    osc.stop(t + 0.35)
  } catch {
    /* без звука */
  }
}

/** Всплеск воды. */
export function splash(): void {
  if (playRecorded('splash')) return
  noise(0.45, 1800, 400, 0.3, 'bandpass')
  noise(0.3, 3500, 900, 0.12, 'highpass', 0.05)
}

/** «Вжух»: что-то пролетело. */
export function whoosh(): void {
  if (playRecorded('whoosh')) return
  noise(0.35, 400, 3200, 0.22, 'bandpass')
}

/** Прыжок-«боинг». */
export function boing(): void {
  if (playRecorded('boing')) return
  const c = audio()
  if (!c) return
  try {
    const t = c.currentTime
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(220, t)
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.18)
    osc.connect(envelope(c, t, 0.28, 0.3, 0.01)).connect(dest(c))
    osc.start(t)
    osc.stop(t + 0.35)
  } catch {
    /* без звука */
  }
}

/** Мягкий «шлёп» предмета, который опустили на место. */
export function drop(): void {
  if (playRecorded('drop')) return
  tone(180, 0.14, 'sine', 0.3)
  noise(0.05, 1500, 600, 0.12, 'lowpass')
}

/** Ура! Задание пройдено: быстрое арпеджио вверх. */
export function fanfare(): void {
  if (playRecorded('fanfare')) return
  ;[0, 2, 4, 7].forEach((k, i) => tone(SCALE[k]! * (k === 7 ? 1 : 1), 0.45, 'triangle', 0.22, i * 0.11))
  tone(SCALE[7]! * 2, 0.7, 'sine', 0.12, 0.45)
}

/** Множитель высоты для голосов зверей: каждый раз чуть другой, чтобы не надоедало. */
let bend = 1

/** Нота со скольжением: частота идёт по точкам `freqs` за `seconds`, звук проходит через фильтр. */
function glide(freqs: number[], seconds: number, type: OscillatorType, volume: number, cutoff = 4000, delay = 0): void {
  const c = audio()
  if (!c) return
  try {
    const t = c.currentTime + delay
    const osc = c.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(freqs[0]! * bend, t)
    freqs.slice(1).forEach((f, i) => osc.frequency.linearRampToValueAtTime(f * bend, t + (seconds * (i + 1)) / (freqs.length - 1)))
    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = cutoff
    osc.connect(filter).connect(envelope(c, t, volume, seconds, 0.02)).connect(dest(c))
    osc.start(t)
    osc.stop(t + seconds + 0.05)
  } catch {
    /* без звука */
  }
}

/** Голос зверя (синтез, пока нет записей): кот мяукает, собака гавкает, свинья хрюкает и так далее. */
let lastAnimal = ''
let lastBend = 1
export function animalSound(kind: string): void {
  // Записи: animal-cat.mp3, animal-cat-2.mp3 … (случайная, не повторяется подряд)
  if (playRecorded(`animal-${kind}`)) {
    lastAnimal = kind
    return
  }
  // Синтез: высота плавает ±10%, подряд один и тот же зверь звучит заметно иначе
  let next = 0.9 + Math.random() * 0.22
  if (kind === lastAnimal && Math.abs(next - lastBend) < 0.07) next = lastBend > 1 ? next - 0.1 : next + 0.1
  bend = next
  lastAnimal = kind
  lastBend = next
  try {
    synthAnimal(kind)
  } finally {
    bend = 1
  }
}

function synthAnimal(kind: string): void {
  switch (kind) {
    case 'cat':
      glide([480, 900, 760, 520], 0.55, 'sawtooth', 0.16, 2400)
      break
    case 'dog':
      glide([420, 220], 0.14, 'sawtooth', 0.26, 1100)
      glide([420, 210], 0.16, 'sawtooth', 0.26, 1100, 0.22)
      break
    case 'pig':
      glide([200, 150, 230, 140], 0.4, 'sawtooth', 0.2, 800)
      noise(0.18, 900, 300, 0.12, 'lowpass', 0.05)
      break
    case 'frog':
      for (let i = 0; i < 3; i++) glide([140, 260, 170], 0.1, 'square', 0.12, 1200, i * 0.13)
      break
    case 'chick':
      for (let i = 0; i < 3; i++) glide([1900, 2700, 2200], 0.09, 'sine', 0.16, 5000, i * 0.12)
      break
    case 'bunny':
      glide([1100, 1500], 0.1, 'sine', 0.14, 4000)
      glide([1300, 1700], 0.1, 'sine', 0.14, 4000, 0.14)
      break
    case 'monkey':
      glide([480, 760, 520], 0.2, 'triangle', 0.22, 3000)
      glide([560, 900, 600], 0.2, 'triangle', 0.22, 3000, 0.24)
      glide([520, 820, 460], 0.28, 'triangle', 0.22, 3000, 0.48)
      break
    case 'tiger':
      glide([170, 110, 85], 0.75, 'sawtooth', 0.24, 700)
      noise(0.6, 600, 200, 0.14, 'lowpass')
      break
    case 'bear':
      glide([120, 95, 80], 0.65, 'sawtooth', 0.26, 420)
      noise(0.5, 400, 150, 0.12, 'lowpass')
      break
    case 'panda':
      glide([420, 540, 430, 520], 0.45, 'triangle', 0.22, 2600)
      break
    default:
      tone(520, 0.2, 'triangle', 0.2)
  }
}

const SIMPLE: Record<string, () => void> = { pop, chomp, thump, splash, whoosh, boing, drop, fanfare }

/** Эффект по имени: запись `sfx/<имя>.mp3`, а если её нет, синтез. Неизвестное имя молчит. */
export function playSfxByName(name: string): void {
  if (playRecorded(name)) return
  SIMPLE[name]?.()
}
