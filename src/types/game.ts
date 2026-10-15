import type { AnimalKind, VehicleKind } from '@/types/art'

/** Режим игры: «Учим цифры» (считаем зверей) или «Найди цифру» (узнаём цифру на слух). */
export type GameMode = 'learn' | 'find'

/** Игровая карточка с символом и озвучкой. */
export interface GameCard {
  id: string
  /** Что показываем ребёнку: «5» или «Б». */
  symbol: string
  /** Как произносится / подпись под карточкой: «пять», «Бэ». */
  label: string
  mode: GameMode
  /** Тайлвинд-класс или hex фона карточки. */
  color: string
  /** Путь к картинке-подсказке (необязательно). */
  image?: string
  /** Путь к озвучке карточки (необязательно). */
  voice?: string
}

/** Настройки звука. Громкость — от 0 до 1. */
export interface SoundSettings {
  muted: boolean
  musicVolume: number
  sfxVolume: number
  voiceVolume: number
}

/** Прогресс по одному режиму. */
export interface ModeProgress {
  /** id карточек, которые ребёнок уже освоил. */
  learnedIds: string[]
  /** Сколько правильных ответов подряд. */
  streak: number
  /** Лучшая серия за всё время. */
  bestStreak: number
  /** Всего звёздочек, заработанных в режиме. */
  stars: number
}

/** Прогресс по всем режимам. */
export type Progress = Record<GameMode, ModeProgress>

/** Состояние игрового стора. */
export interface GameState {
  currentMode: GameMode | null
  progress: Progress
  sound: SoundSettings
}

/** Типы звуковых каналов, которыми управляет useAudio. */
export type AudioChannel = 'music' | 'sfx' | 'voice'

/** Уровень игры «Цифры»: одна машина в пробке с N зверями внутри. */
export interface NumberLevel {
  /** Цифра уровня и одновременно число зверей в машине (1–10). */
  value: number
  /** Число словом для озвучки и подписей: «пять». */
  word: string
  /** Какой зверь сидит в машине. */
  animal: AnimalKind
  /** Какая это машина (у каждого уровня своя). */
  vehicle: VehicleKind
  /** Название зверя в единственном числе: «медведь». */
  animalName: string
  /** Основной цвет кузова (hex). */
  color: string
  /** Тёмный оттенок для обводки и теней (hex). */
  shade: string
}
