import { NUMBER_LEVELS } from '@/data/numbersLevels'
import type { NumberLevel } from '@/types/game'

/**
 * Уровни режима «Найди цифру»: три ступени сложности. Чем дальше, тем больше вариантов
 * на экране: 3 → 5 → 10. Ступень называется по самой большой цифре (3, 5, 10) и едет на её машине.
 */
export interface FindLevel {
  /** Номер уровня в карусели, с 1. */
  index: number
  /** Самая большая цифра: в раундах участвуют цифры от 1 до неё. */
  max: number
  /** Сколько вариантов ответа на экране (совпадает с max: все цифры ступени перед глазами). */
  options: number
  /** Оформление (машина, звери, цвета) берём у одноимённой цифры. */
  look: NumberLevel
}

const MAXES = [3, 5, 10] as const

export const FIND_LEVELS: readonly FindLevel[] = MAXES.map((max, i) => ({
  index: i + 1,
  max,
  options: max,
  look: NUMBER_LEVELS[max - 1]!,
}))

/** Сколько правильных ответов нужно, чтобы пройти уровень. */
export const FIND_ROUNDS = 5

/** Сколько вариантов на первой ступени (оставлено для совместимости). */
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
export function buildRounds(max: number, optionCount = Math.min(max, FIND_OPTIONS)): { target: number; options: number[] }[] {
  const pool = Array.from({ length: max }, (_, i) => i + 1)
  const targets: number[] = []
  while (targets.length < FIND_ROUNDS) {
    let batch = shuffle(pool)
    // на стыке партий не повторяем цифру подряд
    if (batch[0] === targets[targets.length - 1]) batch = [...batch.slice(1), batch[0]!]
    targets.push(...batch)
  }
  return targets.slice(0, FIND_ROUNDS).map((target) => {
    const wrong = shuffle(pool.filter((n) => n !== target)).slice(0, optionCount - 1)
    return { target, options: shuffle([target, ...wrong]) }
  })
}

/** Где на сцене 440×X стоят плитки с цифрами («зверь за табличкой»). */
export interface FindLayout {
  /** Ширина плитки (и зверя) в единицах сцены. */
  w: number
  /** Центр плитки по x и y земли под ней, по порядку вариантов. */
  spots: { cx: number; ground: number }[]
  /** Высота сцены (ширина всегда 440). */
  height: number
}

/** Где начинается трава: выше стоит крокодил, ниже плитки. */
export const FIND_GRASS_Y = 96
/** Высота плитки относительно её ширины: табличка + голова зверя над ней. */
export const FIND_TILE_RATIO = 1.3

const ROWS_LAND: Record<number, number[]> = { 3: [3], 5: [5], 10: [5, 5] }
const ROWS_PORT: Record<number, number[]> = { 3: [3], 5: [3, 2], 10: [3, 3, 2, 2] }
const WIDTH_LAND: Record<number, number> = { 3: 118, 5: 80, 10: 80 }

/**
 * Раскладка плиток: в горизонтали 3 → один ряд, 5 → один ряд, 10 → два ряда по 5;
 * в портрете сцена выше и рядов больше (по 3), чтобы плитки оставались крупными.
 */
export function findLayout(count: number, portrait: boolean): FindLayout {
  const rows = (portrait ? ROWS_PORT : ROWS_LAND)[count] ?? [count]
  const w = portrait ? 120 : (WIDTH_LAND[count] ?? 80)
  const pitch = w + 6
  const tileH = w * FIND_TILE_RATIO
  const spots: FindLayout['spots'] = []
  rows.forEach((k, r) => {
    const ground = FIND_GRASS_Y + 4 + (r + 1) * tileH + r * 6
    for (let i = 0; i < k; i++) spots.push({ cx: 220 + (i - (k - 1) / 2) * pitch, ground })
  })
  const last = spots[spots.length - 1]!
  return { w, spots, height: Math.round(last.ground + 14) }
}
