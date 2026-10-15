import { NUMBER_LEVELS } from '@/data/numbersLevels'
import type { NumberLevel } from '@/types/game'

/**
 * Уровни режима «Найди цифру»: чем дальше, тем больше цифр в игре.
 * Каждый уровень называется по самой большой цифре (3, 5, 7, 10) и едет на её машине.
 */
export interface FindLevel {
  /** Номер уровня в карусели, с 1. */
  index: number
  /** Самая большая цифра: в раундах участвуют цифры от 1 до неё. */
  max: number
  /** Оформление (машина, звери, цвета) берём у одноимённой цифры. */
  look: NumberLevel
}

const MAXES = [3, 5, 7, 10] as const

export const FIND_LEVELS: readonly FindLevel[] = MAXES.map((max, i) => ({
  index: i + 1,
  max,
  look: NUMBER_LEVELS[max - 1]!,
}))

/** Сколько правильных ответов нужно, чтобы пройти уровень. */
export const FIND_ROUNDS = 5

/** Сколько вариантов ответа на экране. */
export const FIND_OPTIONS = 3

export function getFindLevel(index: number): FindLevel | undefined {
  return FIND_LEVELS.find((l) => l.index === index)
}

/** id уровня для прогресса в сторе. */
export function findCardId(index: number): string {
  return `find-${index}`
}

/** Случайный порядок (Fisher–Yates). */
export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/**
 * Раунды уровня: каждая цифра от 1 до max загадывается по разу, пока не кончатся
 * (дальше — по кругу заново), без повторов подряд. К каждой цифре — варианты ответа:
 * правильная и неправильные цифры, перемешанные.
 */
export function buildRounds(max: number): { target: number; options: number[] }[] {
  const pool = Array.from({ length: max }, (_, i) => i + 1)
  const targets: number[] = []
  while (targets.length < FIND_ROUNDS) {
    let batch = shuffle(pool)
    // на стыке партий не повторяем цифру подряд
    if (batch[0] === targets[targets.length - 1]) batch = [...batch.slice(1), batch[0]!]
    targets.push(...batch)
  }
  return targets.slice(0, FIND_ROUNDS).map((target) => {
    const wrong = shuffle(pool.filter((n) => n !== target)).slice(0, FIND_OPTIONS - 1)
    return { target, options: shuffle([target, ...wrong]) }
  })
}
