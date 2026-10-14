import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAudio } from '@/composables/useAudio'
import type { GameMode, ModeProgress, Progress, SoundSettings } from '@/types/game'

const STORAGE_KEY = 'kids-learning-game:v1'

function emptyModeProgress(): ModeProgress {
  return { learnedIds: [], streak: 0, bestStreak: 0, stars: 0 }
}

function emptyProgress(): Progress {
  return { numbers: emptyModeProgress(), letters: emptyModeProgress() }
}

interface SavedState {
  progress: Progress
  sound: SoundSettings
}

/** Читаем сохранённое состояние; битый или отсутствующий JSON не должен ронять игру. */
function loadSaved(): Partial<SavedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<SavedState>) : {}
  } catch {
    return {}
  }
}

export const useGameStore = defineStore('game', () => {
  const audio = useAudio()
  const saved = loadSaved()

  // --- state ---
  const currentMode = ref<GameMode | null>(null)
  const progress = ref<Progress>({ ...emptyProgress(), ...saved.progress })
  const soundMuted = ref(saved.sound?.muted ?? false)

  // Синхронизируем сохранённый mute с аудио-менеджером при старте.
  audio.setMuted(soundMuted.value)

  // --- getters ---
  const sound = computed<SoundSettings>(() => ({
    muted: soundMuted.value,
    musicVolume: audio.volumes.value.music,
    sfxVolume: audio.volumes.value.sfx,
    voiceVolume: audio.volumes.value.voice,
  }))

  const totalStars = computed(
    () => progress.value.numbers.stars + progress.value.letters.stars,
  )

  const currentProgress = computed<ModeProgress | null>(() =>
    currentMode.value ? progress.value[currentMode.value] : null,
  )

  // --- actions ---
  function setMode(mode: GameMode | null): void {
    currentMode.value = mode
  }

  function toggleSound(): void {
    audio.toggleMute()
    soundMuted.value = audio.muted.value
  }

  /** Правильный ответ: +звезда, серия растёт, карточка считается освоенной. */
  function registerCorrect(mode: GameMode, cardId: string): void {
    const p = progress.value[mode]
    p.stars += 1
    p.streak += 1
    p.bestStreak = Math.max(p.bestStreak, p.streak)
    if (!p.learnedIds.includes(cardId)) p.learnedIds.push(cardId)
  }

  /** Ошибка: серия сбрасывается, но звёзды и освоенное остаются — ребёнка не наказываем. */
  function registerMistake(mode: GameMode): void {
    progress.value[mode].streak = 0
  }

  function resetProgress(mode?: GameMode): void {
    if (mode) progress.value[mode] = emptyModeProgress()
    else progress.value = emptyProgress()
  }

  // --- persistence ---
  watch(
    [progress, soundMuted],
    () => {
      try {
        const data: SavedState = { progress: progress.value, sound: sound.value }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {
        /* приватный режим или переполненное хранилище — играем без сохранения */
      }
    },
    { deep: true },
  )

  return {
    currentMode,
    progress,
    sound,
    totalStars,
    currentProgress,
    setMode,
    toggleSound,
    registerCorrect,
    registerMistake,
    resetProgress,
  }
})
