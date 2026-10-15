import type { NumberLevel } from '@/types/game'

/**
 * Десять уровней игры «Цифры»: у каждой цифры своя машина, свой цвет и своя
 * порода зверей. Звери в одной машине все одинаковые, чтобы их легко считать,
 * а разные машины и звери между уровнями помогают малышу различать числа.
 * Чем больше число, тем вместительнее машина: от малолитражки до двухэтажного автобуса.
 */
export const NUMBER_LEVELS: readonly NumberLevel[] = [
  { value: 1, word: 'один', animal: 'bear', vehicle: 'hatch', animalName: 'медведь', color: '#f43f5e', shade: '#9f1239' },
  { value: 2, word: 'два', animal: 'bunny', vehicle: 'convertible', animalName: 'зайчик', color: '#f97316', shade: '#9a3412' },
  { value: 3, word: 'три', animal: 'cat', vehicle: 'taxi', animalName: 'котёнок', color: '#facc15', shade: '#854d0e' },
  { value: 4, word: 'четыре', animal: 'dog', vehicle: 'jeep', animalName: 'щенок', color: '#22c55e', shade: '#166534' },
  { value: 5, word: 'пять', animal: 'panda', vehicle: 'police', animalName: 'панда', color: '#3b82f6', shade: '#1e3a8a' },
  { value: 6, word: 'шесть', animal: 'frog', vehicle: 'ambulance', animalName: 'лягушонок', color: '#0ea5e9', shade: '#075985' },
  { value: 7, word: 'семь', animal: 'monkey', vehicle: 'firetruck', animalName: 'обезьянка', color: '#dc2626', shade: '#7f1d1d' },
  { value: 8, word: 'восемь', animal: 'pig', vehicle: 'tractor', animalName: 'поросёнок', color: '#a855f7', shade: '#581c87' },
  { value: 9, word: 'девять', animal: 'tiger', vehicle: 'pickup', animalName: 'тигрёнок', color: '#ec4899', shade: '#9d174d' },
  { value: 10, word: 'десять', animal: 'chick', vehicle: 'bus', animalName: 'цыплёнок', color: '#14b8a6', shade: '#115e59' },
]

export const MIN_LEVEL = NUMBER_LEVELS[0]!.value
export const MAX_LEVEL = NUMBER_LEVELS[NUMBER_LEVELS.length - 1]!.value

export function getNumberLevel(value: number): NumberLevel | undefined {
  return NUMBER_LEVELS.find((level) => level.value === value)
}

/** Число словом для озвучки счёта: 3 → «три». */
export function numberWord(value: number): string {
  return getNumberLevel(value)?.word ?? String(value)
}

/** Сколько зверей в ряду: 4 → 2×2, 6 → 3+3, 8 → 4+4, 10 → 5+5 (ровные ряды легче считать). */
const ANIMAL_COLUMNS = [1, 2, 3, 2, 3, 3, 4, 4, 5, 5] as const

export function animalColumns(value: number): number {
  return ANIMAL_COLUMNS[value - 1] ?? 5
}

/** id карточки для прогресса в сторе (`registerCorrect(mode, cardId)`). */
export function numberCardId(value: number): string {
  return `num-${value}`
}

/** id активности в прогрессе: `num-4:wheels`. */
export function activityCardId(value: number, activityId: string): string {
  return `${numberCardId(value)}:${activityId}`
}
