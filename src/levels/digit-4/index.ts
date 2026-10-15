import type { ActivityDef } from '@/types/activity'
import WheelsPreview from './WheelsPreview.vue'
import DonutsPreview from './DonutsPreview.vue'
import SeedsPreview from './SeedsPreview.vue'

/** Цифра 4 (агент 1): активности, которых нет у других цифр. */
const activities: ActivityDef[] = [
  {
    id: 'wheels',
    title: 'Поставь четыре колеса',
    preview: WheelsPreview,
    component: () => import('./WheelsActivity.vue'),
  },
  {
    id: 'donuts',
    title: 'Накорми крокодила четырьмя пончиками',
    preview: DonutsPreview,
    component: () => import('./DonutsActivity.vue'),
  },
  {
    id: 'seeds',
    title: 'Убери четыре косточки из арбуза',
    preview: SeedsPreview,
    component: () => import('./SeedsActivity.vue'),
  },
]

export default activities
