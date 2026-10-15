import type { ActivityDef } from '@/types/activity'
import CountPreview from './shared/CountPreview.vue'
import TracePreview from './shared/TracePreview.vue'
import ColorPreview from './shared/ColorPreview.vue'

/**
 * Реестр активностей. Каждая цифра может положить свои активности в
 * `src/levels/digit-N/index.ts` (default-экспорт — массив ActivityDef); реестр
 * подхватывает их сам, править его не нужно. Общие активности (посчитай, напиши,
 * раскрась) есть у всех цифр.
 */
const own = import.meta.glob<{ default: ActivityDef[] }>('./digit-*/index.ts', { eager: true })

const count: ActivityDef = {
  id: 'count',
  title: 'Посчитай зверей',
  preview: CountPreview,
  component: () => import('./shared/CountActivity.vue'),
}
const trace: ActivityDef = {
  id: 'trace',
  title: 'Напиши цифру',
  preview: TracePreview,
  component: () => import('./shared/TraceActivity.vue'),
}
const color: ActivityDef = {
  id: 'color',
  title: 'Раскрась цифру',
  preview: ColorPreview,
  component: () => import('./shared/ColorActivity.vue'),
}

/** Активности цифры по порядку: счёт, затем свои (тематические), затем «напиши» и «раскрась». */
export function activitiesFor(value: number): ActivityDef[] {
  const mine = own[`./digit-${value}/index.ts`]?.default ?? []
  return [count, ...mine, trace, color]
}

export function findActivity(value: number, id: string): ActivityDef | undefined {
  return activitiesFor(value).find((a) => a.id === id)
}
