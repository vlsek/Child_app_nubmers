import { ref, watch } from 'vue'
import musicUrl from '@/assets/audio/music/bouncy-piano-groove.mp3'
import {
  PRAISE_KEYS,
  RETRY_KEYS,
  numberKey,
  voiceText,
  voiceUrl,
  type PhraseKey,
  type VoiceKey,
} from '@/data/voice'
import type { AudioChannel } from '@/types/game'

/**
 * Менеджер звука.
 *
 * Состояние (mute и громкость) общее на всё приложение, поэтому лежит
 * на уровне модуля, а не внутри useAudio(): сколько бы компонентов ни
 * вызвали composable, они управляют одним и тем же звуком.
 */
const muted = ref(false)
const volumes = ref<Record<AudioChannel, number>>({
  music: 0.6,
  sfx: 0.8,
  voice: 1,
})

/** Пока говорит голос, музыка тише в столько раз: слова должны быть слышны. */
const DUCK = 0.4

let music: HTMLAudioElement | null = null
let voice: HTMLAudioElement | null = null
/** Завершает ожидание текущей реплики (и записанной, и синтезированной). */
let finishVoice: (() => void) | null = null

let ducked = false
let musicGain = 1
let rampTimer: ReturnType<typeof setInterval> | undefined

/** Создаёт аудио-элемент; в окружении без Audio (SSR, тесты) возвращает null. */
function createAudio(src: string, channel: AudioChannel): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  const audio = new Audio(src)
  audio.volume = Math.min(1, volumes.value[channel])
  audio.muted = muted.value
  return audio
}

/** Браузер может запретить автозапуск звука — для игры это не ошибка. */
function safePlay(audio: HTMLAudioElement | null): Promise<void> {
  return audio ? audio.play().catch(() => {}) : Promise.resolve()
}

function applyMusicVolume(): void {
  if (music) music.volume = Math.min(1, volumes.value.music * musicGain)
}

/** Плавно приглушаем музыку на время реплики и возвращаем обратно. */
function duck(on: boolean): void {
  ducked = on
  const goal = on ? DUCK : 1
  clearInterval(rampTimer)
  rampTimer = setInterval(() => {
    const diff = goal - musicGain
    if (Math.abs(diff) < 0.04) {
      musicGain = goal
      clearInterval(rampTimer)
    } else {
      musicGain += Math.sign(diff) * 0.06
    }
    applyMusicVolume()
  }, 30)
}

/** Обрывает синтезированную речь (если браузер её умеет). */
function stopSpeech(): void {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}

/** Обрывает всё, что сейчас говорит: запись и синтез. Ожидающие реплики завершаются. */
function stopVoice(): void {
  voice?.pause()
  stopSpeech()
  finishVoice?.()
}

// Mute и громкость применяются сразу к тому, что играет сейчас.
watch(muted, (value) => {
  if (music) music.muted = value
  if (voice) voice.muted = value
  if (value) stopSpeech()
})
watch(() => volumes.value.music, applyMusicVolume)
watch(
  () => volumes.value.voice,
  (value) => {
    if (voice) voice.volume = Math.min(1, value)
  },
)

// Свернули вкладку или приложение — музыка не должна играть в пустоту.
let musicWasPlaying = false
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      musicWasPlaying = !!music && !music.paused
      music?.pause()
      stopVoice()
    } else if (musicWasPlaying) {
      void safePlay(music)
    }
  })
}

export function useAudio() {
  /** Короткий звуковой эффект: клик, «правильно», «ошибка». Можно играть внахлёст. */
  function playSfx(src: string): void {
    if (muted.value) return
    void safePlay(createAudio(src, 'sfx'))
  }

  /**
   * Проигрывает запись голоса. Новая фраза обрывает предыдущую, чтобы не было каши.
   * Промис завершается, когда реплика закончилась (или её прервали / включили mute),
   * поэтому фразы можно выстраивать в цепочку: `await playVoice(a); await playVoice(b)`.
   */
  function playVoice(src: string): Promise<void> {
    stopVoice()
    if (muted.value) return Promise.resolve()
    return new Promise<void>((resolve) => {
      const audio = createAudio(src, 'voice')
      if (!audio) return resolve()
      voice = audio
      duck(true)
      let done = false
      const finish = () => {
        if (done) return
        done = true
        if (voice === audio) {
          voice = null
          finishVoice = null
          duck(false)
        }
        resolve()
      }
      finishVoice = finish
      audio.onended = finish
      audio.onerror = finish
      void safePlay(audio).then(() => {
        // play() отклонён (автозапуск запрещён) — ждать конца бессмысленно
        if (audio.paused && !audio.ended) finish()
      })
    })
  }

  /**
   * Запасной вариант: браузерный синтез речи. Нужен, если файла с записью нет.
   * Тоже возвращает промис, который завершается по окончании фразы.
   */
  function speak(text: string): Promise<void> {
    stopVoice()
    if (muted.value || typeof speechSynthesis === 'undefined') return Promise.resolve()
    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ru-RU'
      utterance.rate = 0.8
      utterance.pitch = 1.2
      utterance.volume = Math.min(1, volumes.value.voice)
      let done = false
      const finish = () => {
        if (done) return
        done = true
        if (finishVoice === finish) finishVoice = null
        resolve()
      }
      finishVoice = finish
      utterance.onend = finish
      utterance.onerror = finish
      // Некоторые браузеры не присылают onend: не зависаем дольше разумного
      setTimeout(finish, 600 + text.length * 120)
      speechSynthesis.speak(utterance)
    })
  }

  /** Сказать по ключу: записью, а если её нет, синтезом. */
  function say(key: VoiceKey): Promise<void> {
    const url = voiceUrl(key)
    return url ? playVoice(url) : speak(voiceText(key))
  }

  function sayNumber(value: number): Promise<void> {
    return say(numberKey(value))
  }

  let lastPraise: PhraseKey | null = null
  /** Случайная похвала, но не одна и та же два раза подряд. */
  function sayPraise(): Promise<void> {
    const options = PRAISE_KEYS.filter((k) => k !== lastPraise)
    lastPraise = options[Math.floor(Math.random() * options.length)]!
    return say(lastPraise)
  }

  let lastRetry: PhraseKey | null = null
  /** Мягкое подбадривание после ошибки. */
  function sayRetry(): Promise<void> {
    const options = RETRY_KEYS.filter((k) => k !== lastRetry)
    lastRetry = options[Math.floor(Math.random() * options.length)]!
    return say(lastRetry)
  }

  let greeted = false
  /** Приветствие «Привет! Давай учить цифры!» один раз за запуск; null, если уже звучало. */
  function greetOnce(): Promise<void> | null {
    if (greeted) return null
    greeted = true
    return say('hello')
  }

  /** Фоновая музыка по кругу. Повторный вызов с тем же треком ничего не ломает. */
  function playMusic(src: string = musicUrl): void {
    if (music && music.src.endsWith(src)) {
      if (music.paused) void safePlay(music)
      return
    }
    music?.pause()
    music = createAudio(src, 'music')
    if (music) {
      music.loop = true
      musicGain = ducked ? DUCK : 1
      applyMusicVolume()
      void safePlay(music)
    }
  }

  function stopMusic(): void {
    music?.pause()
    music = null
  }

  /**
   * Браузеры не дают играть звуку до первого касания. Музыку запускаем
   * в момент, когда малыш впервые тронул экран.
   */
  function startMusicOnFirstTouch(): void {
    if (typeof window === 'undefined') return
    const start = () => {
      playMusic()
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }
    window.addEventListener('pointerdown', start)
    window.addEventListener('keydown', start)
  }

  function toggleMute(): void {
    muted.value = !muted.value
  }

  function setMuted(value: boolean): void {
    muted.value = value
  }

  function setVolume(channel: AudioChannel, value: number): void {
    volumes.value[channel] = Math.max(0, value)
  }

  return {
    muted,
    volumes,
    playSfx,
    playVoice,
    speak,
    say,
    sayNumber,
    sayPraise,
    sayRetry,
    greetOnce,
    stopVoice,
    stopSpeech,
    playMusic,
    stopMusic,
    startMusicOnFirstTouch,
    toggleMute,
    setMuted,
    setVolume,
  }
}
