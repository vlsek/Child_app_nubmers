import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAudio } from '@/composables/useAudio'
import { GIFT_OUTFITS, STARS_PER_GIFT } from '@/data/gifts'
import { activityCardId, MAX_LEVEL, MIN_LEVEL, numberCardId } from '@/data/numbersLevels'
import { activitiesFor } from '@/levels/registry'
import type { GameMode, ModeProgress, Progress, SoundSettings } from '@/types/game'

const STORAGE_KEY = 'kids-learning-game:v1'

function emptyModeProgress(): ModeProgress {
  return { learnedIds: [], streak: 0, bestStreak: 0, stars: 0 }
}

function emptyProgress(): Progress {
  return { learn: emptyModeProgress(), find: emptyModeProgress() }
}

/** Наклейка в альбоме: положение на странице в долях ширины и высоты (0…1), чтобы не зависеть от экрана. */
export interface StickerPos {
  x: number
  y: number
}

interface SavedState {
  /** Прогресс по режимам; в старых сохранениях режим «Учим цифры» назывался `numbers`. */
  progress: Partial<Progress> & { numbers?: ModeProgress }
  sound: SoundSettings
  /** Полученные наклейки: цифра уровня → положение в альбоме. */
  stickers?: Record<string, StickerPos>
  /** Сколько подарков (нарядов крокодила) уже открыто. */
  giftsOpened?: number
}

/** Начальное место наклейки в альбоме: две строки по пять, чтобы новые не лежали стопкой. */
export function defaultStickerPos(value: number): StickerPos {
  const i = value - 1
  return { x: 0.12 + (i % 5) * 0.19, y: i < 5 ? 0.3 : 0.62 }
}

/** Читаем наклейки из сохранённого: только цифры 1–10 и числа в пределах страницы. */
function cleanStickers(raw: SavedState['stickers']): Record<number, StickerPos> {
  const out: Record<number, StickerPos> = {}
  for (const [k, v] of Object.entries(raw ?? {})) {
    const n = Number(k)
    if (!Number.isInteger(n) || n < MIN_LEVEL || n > MAX_LEVEL) continue
    if (typeof v?.x !== 'number' || typeof v?.y !== 'number') continue
    out[n] = { x: Math.min(1, Math.max(0, v.x)), y: Math.min(1, Math.max(0, v.y)) }
  }
  return out
}

/** Собираем прогресс из сохранённого, подтягивая звёзды из старого режима `numbers`. */
function mergeProgress(saved: SavedState['progress'] | undefined): Progress {
  return {
    learn: saved?.learn ?? saved?.numbers ?? emptyModeProgress(),
    find: saved?.find ?? emptyModeProgress(),
  }
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
  const progress = ref<Progress>(mergeProgress(saved.progress))
  const soundMuted = ref(saved.sound?.muted ?? false)
  const stickers = ref<Record<number, StickerPos>>(cleanStickers(saved.stickers))
  /** Цифра наклейки, которую только что заработали: оболочка уровня может показать её (null — нет новой). */
  const newSticker = ref<number | null>(null)

  /** Открытые подарки: каждый надевает на крокодила следующий наряд. */
  const giftsOpened = ref(Math.min(GIFT_OUTFITS.length, Math.max(0, Math.floor(saved.giftsOpened ?? 0))))

  // Синхронизируем сохранённый mute с аудио-менеджером при старте.
  audio.setMuted(soundMuted.value)

  /** Какая машина по центру карусели в каждом режиме: чтобы после уровня вернуться к ней же. Не сохраняется. */
  const menuLevel = ref<Record<GameMode, number>>({ learn: 1, find: 1 })

  // --- getters ---
  const sound = computed<SoundSettings>(() => ({
    muted: soundMuted.value,
    musicVolume: audio.volumes.value.music,
    sfxVolume: audio.volumes.value.sfx,
    voiceVolume: audio.volumes.value.voice,
  }))

  const totalStars = computed(() => progress.value.learn.stars + progress.value.find.stars)

  /** Все наряды собраны: звёзды больше не копятся к подарку. */
  const allGifts = computed(() => giftsOpened.value >= GIFT_OUTFITS.length)
  /** Сколько подарков уже можно открыть (звёзд хватает, а подарок ещё не открыт). */
  const giftsReady = computed(() =>
    Math.max(0, Math.min(GIFT_OUTFITS.length, Math.floor(totalStars.value / STARS_PER_GIFT)) - giftsOpened.value),
  )
  /** Сколько звёзд уже собрано на следующий подарок (0…STARS_PER_GIFT). */
  const starsIntoGift = computed(() =>
    Math.min(STARS_PER_GIFT, Math.max(0, totalStars.value - giftsOpened.value * STARS_PER_GIFT)),
  )
  /** Наряд крокодила на главном экране и в альбоме. */
  const outfit = computed(() => GIFT_OUTFITS.slice(0, giftsOpened.value))

  const currentProgress = computed<ModeProgress | null>(() =>
    currentMode.value ? progress.value[currentMode.value] : null,
  )

  // --- actions ---
  function setMode(mode: GameMode | null): void {
    currentMode.value = mode
  }

  function setMenuLevel(mode: GameMode, value: number): void {
    menuLevel.value[mode] = value
  }

  /** Все задания уровня-цифры пройдены (разминка с друзьями тоже входит). */
  function levelDone(value: number): boolean {
    return activitiesFor(value).every((a) => hasLearned('learn', activityCardId(value, a.id)))
  }

  /**
   * Уровень пройден до конца: машина в карусели получает звезду, крокодил — наклейку в альбом.
   * Возвращает true, если это случилось впервые.
   */
  function finishLevel(value: number): boolean {
    const levelId = numberCardId(value)
    if (!hasLearned('learn', levelId)) progress.value.learn.learnedIds.push(levelId)
    if (stickers.value[value]) return false
    stickers.value[value] = defaultStickerPos(value)
    newSticker.value = value
    return true
  }

  /**
   * Активность уровня-цифры пройдена. Звезда даётся один раз за активность;
   * когда пройдены все задания уровня, он засчитывается целиком (звезда на машине и наклейка).
   * Возвращает true, если активность пройдена впервые.
   */
  function completeActivity(value: number, activityId: string): boolean {
    const key = activityCardId(value, activityId)
    const first = !hasLearned('learn', key)
    if (first) registerCorrect('learn', key)
    if (levelDone(value)) finishLevel(value)
    return first
  }

  /** Передвинуть наклейку в альбоме (доли страницы 0…1). */
  function moveSticker(value: number, pos: StickerPos): void {
    if (!stickers.value[value]) return
    stickers.value[value] = { x: Math.min(1, Math.max(0, pos.x)), y: Math.min(1, Math.max(0, pos.y)) }
  }

  /** Открыть подарок: крокодил получает следующий наряд. Возвращает false, если открывать нечего. */
  function openGift(): boolean {
    if (giftsReady.value <= 0) return false
    giftsOpened.value += 1
    return true
  }

  function clearNewSticker(): void {
    newSticker.value = null
  }

  /** Пройдена ли карточка (уровень) в режиме. */
  function hasLearned(mode: GameMode, cardId: string): boolean {
    return progress.value[mode].learnedIds.includes(cardId)
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
    // Наклейки принадлежат «Учим цифры»: сбросили всё или этот режим, альбом начинается заново.
    if (!mode) giftsOpened.value = 0
    if (!mode || mode === 'learn') {
      stickers.value = {}
      newSticker.value = null
    }
  }

  // Звезда на машине = уровень пройден целиком. В старых сохранениях её давали за первое задание: пересчитываем.
  {
    const p = progress.value.learn
    p.learnedIds = p.learnedIds.filter((id) => !/^num-\d+$/.test(id) || levelDone(Number(id.slice(4))))
    for (let v = MIN_LEVEL; v <= MAX_LEVEL; v++) {
      if (levelDone(v) && !stickers.value[v]) stickers.value[v] = defaultStickerPos(v)
      if (levelDone(v) && !p.learnedIds.includes(numberCardId(v))) p.learnedIds.push(numberCardId(v))
    }
  }

  // --- persistence ---
  watch(
    [progress, soundMuted, stickers, giftsOpened],
    () => {
      try {
        const data: SavedState = { progress: progress.value, sound: sound.value, stickers: stickers.value, giftsOpened: giftsOpened.value }
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
    menuLevel,
    stickers,
    newSticker,
    totalStars,
    allGifts,
    giftsReady,
    starsIntoGift,
    outfit,
    currentProgress,
    setMode,
    setMenuLevel,
    hasLearned,
    completeActivity,
    levelDone,
    finishLevel,
    moveSticker,
    openGift,
    clearNewSticker,
    toggleSound,
    registerCorrect,
    registerMistake,
    resetProgress,
  }
})
