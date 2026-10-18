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
}>()

interface Slot {
  x: number
  y: number
  size: number
}

function grid(rect: Rect, n: number, cols: number): Slot[] {
  const rows = Math.ceil(n / cols)
  const size = Math.min(rect.w / cols, rect.h / rows)
  const top = rect.y + (rect.h - rows * size) / 2
  const slots: Slot[] = []
  for (let r = 0; r < rows; r++) {
    const inRow = r < rows - 1 ? cols : n - cols * (rows - 1)
    const left = rect.x + (rect.w - inRow * size) / 2
    for (let c = 0; c < inRow; c++) slots.push({ x: left + c * size, y: top + r * size, size })
  }
  return slots
}

const slots = computed<Slot[]>(() => {
  const { rects, count } = props
  if (rects.length === 1) return grid(rects[0]!, count, props.cols ?? animalColumns(count))
  const out: Slot[] = []
  let left = count
  rects.forEach((rect, i) => {
    const n = Math.ceil(left / (rects.length - i))
    left -= n
    out.push(...grid(rect, n, n))
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
        <AnimalFigure :kind="animal" :x="-slot.size * 0.1" :y="0" :width="slot.size * 1.2" :height="slot.size * 0.895" crop />
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
