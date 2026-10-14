import { ref, watch } from 'vue'
import type { AudioChannel } from '@/types/game'

/**
 * Простой менеджер звука.
 *
 * Состояние (mute и громкость) общее на всё приложение, поэтому лежит
 * на уровне модуля, а не внутри useAudio(): сколько бы компонентов ни
 * вызвали composable, они управляют одним и тем же звуком.
 */
const muted = ref(false)
const volumes = ref<Record<AudioChannel, number>>({
  music: 0.4,
  sfx: 0.8,
  voice: 1,
})

let music: HTMLAudioElement | null = null
let voice: HTMLAudioElement | null = null

/** Создаёт аудио-элемент; в окружении без Audio (SSR, тесты) возвращает null. */
function createAudio(src: string, channel: AudioChannel): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  const audio = new Audio(src)
  audio.volume = volumes.value[channel]
  audio.muted = muted.value
  return audio
}

/** Браузер может запретить автозапуск звука — для игры это не ошибка. */
function safePlay(audio: HTMLAudioElement | null): void {
  audio?.play().catch(() => {
    /* автозапуск заблокирован до первого касания — молча пропускаем */
  })
}

// Mute и громкость применяются сразу к тому, что играет сейчас.
watch(muted, (value) => {
  if (music) music.muted = value
  if (voice) voice.muted = value
})
watch(
  () => volumes.value.music,
  (value) => {
    if (music) music.volume = value
  },
)
watch(
  () => volumes.value.voice,
  (value) => {
    if (voice) voice.volume = value
  },
)

export function useAudio() {
  /** Короткий звуковой эффект: клик, «правильно», «ошибка». Можно играть внахлёст. */
  function playSfx(src: string): void {
    if (muted.value) return
    safePlay(createAudio(src, 'sfx'))
  }

  /** Голос диктора. Новая фраза обрывает предыдущую, чтобы не было каши. */
  function playVoice(src: string): void {
    if (muted.value) return
    voice?.pause()
    voice = createAudio(src, 'voice')
    safePlay(voice)
  }

  /** Фоновая музыка по кругу. Повторный вызов с тем же треком ничего не ломает. */
  function playMusic(src: string): void {
    if (music && music.src.endsWith(src)) {
      if (music.paused) safePlay(music)
      return
    }
    music?.pause()
    music = createAudio(src, 'music')
    if (music) {
      music.loop = true
      safePlay(music)
    }
  }

  function stopMusic(): void {
    music?.pause()
    music = null
  }

  function toggleMute(): void {
    muted.value = !muted.value
  }

  function setMuted(value: boolean): void {
    muted.value = value
  }

  function setVolume(channel: AudioChannel, value: number): void {
    volumes.value[channel] = Math.min(1, Math.max(0, value))
  }

  return {
    muted,
    volumes,
    playSfx,
    playVoice,
    playMusic,
    stopMusic,
    toggleMute,
    setMuted,
    setVolume,
  }
}
