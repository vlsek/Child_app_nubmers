import type { NumberLevel } from '@/types/game'

/**
 * Десять уровней игры «Цифры»: у каждой машины своя цифра, свой цвет
 * и своя порода зверей. Один и тот же зверь в машине нужен, чтобы
 * ребёнку было легко считать (все одинаковые), а разные звери между
 * машинами делают пробку весёлой и помогают различать уровни.
 */
export const NUMBER_LEVELS: readonly NumberLevel[] = [
  { value: 1, word: 'один', animal: '🐻', animalName: 'медведь', color: '#ef4444', shade: '#b91c1c' },
  { value: 2, word: 'два', animal: '🐰', animalName: 'зайчик', color: '#f97316', shade: '#c2410c' },
  { value: 3, word: 'три', animal: '🐱', animalName: 'котёнок', color: '#facc15', shade: '#a16207' },
  { value: 4, word: 'четыре', animal: '🐶', animalName: 'щенок', color: '#22c55e', shade: '#15803d' },
  { value: 5, word: 'пять', animal: '🐼', animalName: 'панда', color: '#14b8a6', shade: '#0f766e' },
  { value: 6, word: 'шесть', animal: '🐸', animalName: 'лягушонок', color: '#0ea5e9', shade: '#0369a1' },
  { value: 7, word: 'семь', animal: '🐵', animalName: 'обезьянка', color: '#3b82f6', shade: '#1d4ed8' },
  { value: 8, word: 'восемь', animal: '🐷', animalName: 'поросёнок', color: '#a855f7', shade: '#7e22ce' },
  { value: 9, word: 'девять', animal: '🐯', animalName: 'тигрёнок', color: '#ec4899', shade: '#be185d' },
  { value: 10, word: 'десять', animal: '🐥', animalName: 'цыплёнок', color: '#84cc16', shade: '#4d7c0f' },
]

export const MIN_LEVEL = NUMBER_LEVELS[0]!.value
export const MAX_LEVEL = NUMBER_LEVELS[NUMBER_LEVELS.length - 1]!.value

export function getNumberLevel(value: number): NumberLevel | undefined {
  return NUMBER_LEVELS.find((level) => level.value === value)
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
