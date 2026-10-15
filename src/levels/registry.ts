import type { ActivityDef } from '@/types/activity'

/**
 * Реестр заданий. Каждая цифра может положить свои задания в
 * `src/levels/digit-N/index.ts` (default-экспорт — массив ActivityDef); реестр
 * подхватывает их сам, править его не нужно.
 *
 * Последовательность уровня-цифры: сначала общая лёгкая разминка «крокодил и друзья»
 * (считаем зверей), затем свои задания цифры по порядку.
 */
const own = import.meta.glob<{ default: ActivityDef[] }>('./digit-*/index.ts', { eager: true })

const friends: ActivityDef = {
  id: 'friends',
  title: 'Крокодил и друзья: посчитай зверей',
  component: () => import('./shared/FriendsActivity.vue'),
}

export function activitiesFor(value: number): ActivityDef[] {
  return [friends, ...(own[`./digit-${value}/index.ts`]?.default ?? [])]
}

/**
 * Сложные для 3–4 лет задания: в последовательность НЕ входят (малышу тяжело).
 * Остаются в проекте на будущее, например для режима «старше».
 */
export const ADVANCED_ACTIVITIES: ActivityDef[] = [
  { id: 'trace', title: 'Напиши цифру', component: () => import('./shared/TraceActivity.vue') },
  { id: 'color', title: 'Раскрась цифру', component: () => import('./shared/ColorActivity.vue') },
]
