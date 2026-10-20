<script setup lang="ts">
import { computed } from 'vue'
import AnimalFigure from './AnimalFigure.vue'
import type { AnimalKind } from '@/types/art'
import { animalColumns } from '@/data/numbersLevels'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Пассажиры в транспорте: расставляет `count` голов зверей по одной или нескольким
 * прямоугольным областям (окно, кузов, второй этаж автобуса) ровными рядами.
 * Несколько областей — это несколько этажей: зверей делим между ними поровну.
 */
const props = defineProps<{
  rects: Rect[]
  count: number
  animal: AnimalKind
  /** Сколько зверей в ряду; по умолчанию как в animalColumns(). */
  cols?: number
  /** Сколько показать (по умолчанию все `count`): автобус делит зверей по этажам. */
  n?: number
  /** Ровная посадка в ряд с малым перекрытием (автобус). */
  spread?: boolean
  /** Прижать зверей к правому краю области (к водителю). */
  right?: boolean
}>()

interface Slot {
  x: number
  y: number
  size: number
}

/** Звери сидят «толпой»: ряды и соседи перекрывают друг друга, нижний ряд опирается на борт. */
const PITCH_Y = 0.79
const W = 1.4
const H = W * (160 / 220)

function grid(rect: Rect, n: number, cols: number, pitchX: number, right: boolean): Slot[] {
  const rows = Math.ceil(n / cols)
  const size = Math.min(rect.w / (W + pitchX * (cols - 1)), rect.h / (H + PITCH_Y * (rows - 1)))
  const bottom = rect.y + rect.h
  const slots: Slot[] = []
  for (let r = 0; r < rows; r++) {
    const inRow = r < rows - 1 ? cols : n - cols * (rows - 1)
    const total = size * (W + pitchX * (inRow - 1))
    const left = rect.x + (right ? rect.w - total : (rect.w - total) / 2)
    const y = bottom - size * H - (rows - 1 - r) * PITCH_Y * size
    for (let c = 0; c < inRow; c++) slots.push({ x: left + c * pitchX * size, y, size })
  }
  return slots
}

const pitch = computed(() => (props.spread ? 1.18 : 0.98))

const slots = computed<Slot[]>(() => {
  const { rects } = props
  const count = props.n ?? props.count
  if (rects.length === 1) return grid(rects[0]!, count, props.cols ?? animalColumns(count), pitch.value, !!props.right)
  const out: Slot[] = []
  let left = count
  rects.forEach((rect, i) => {
    const n = Math.ceil(left / (rects.length - i))
    left -= n
    out.push(...grid(rect, n, n, pitch.value, !!props.right))
  })
  return out
})
</script>

<template>
  <g>
    <g
      v-for="(slot, i) in slots"
      :key="i"
      :transform="`translate(${slot.x} ${slot.y})`"
    >
      <!-- Каждый пассажир чуть покачивается, в своём темпе -->
      <g class="bob" :style="{ animationDelay: `${-(i * 0.37) % 1.8}s` }">
        <AnimalFigure :kind="animal" :x="0" :y="0" :width="slot.size * W" :height="slot.size * H" seated />
      </g>
    </g>
  </g>
</template>

<style scoped>
.bob {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: bob 1.8s ease-in-out infinite;
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }
  50% {
    transform: translateY(-4px) rotate(2deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bob {
    animation: none;
  }
}
</style>
