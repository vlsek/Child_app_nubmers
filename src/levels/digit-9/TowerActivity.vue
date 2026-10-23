<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { drop } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 9: «Построй башню из девяти кубиков».
 * Кубик перетаскивают на башню (или тапают: он сам летит на башню), на нём цифра по счёту,
 * кубики встают по порядку. Друг рядом радуется, когда башня готова. Крокодил подбадривает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6']
const SIZE = 28
const TOWER_X = 316
const homes = Array.from({ length: 9 }, (_, i) =>
  i < 5 ? { x: 128 + i * 32, y: 262 - SIZE / 2 } : { x: 144 + (i - 5) * 32, y: 262 - SIZE * 1.5 },
)
const towerPos = (k: number) => ({ x: TOWER_X, y: 262 - SIZE / 2 - k * SIZE })

/** order[i] — каким по счёту кубик i встал на башню (0 — лежит). */
const order = ref<number[]>(homes.map(() => 0))
const count = computed(() => order.value.filter(Boolean).length)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('tower-intro', 'Построй башню!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const svg = ref<SVGSVGElement | null>(null)

const drag = useDrag<number>(svg, {
  canGrab: (i) => !order.value[i],
  onDrop: (i, p) => near(p, towerPos(count.value), 90) && place(i),
  onTap: (i) => void place(i),
})

function place(i: number): boolean {
  if (order.value[i] || count.value >= 9) return false
  const n = count.value + 1
  order.value[i] = n
  void finish(n)
  return true
}

async function finish(n: number): Promise<void> {
  drop()
  const said = sayNumber(n)
  if (n < 9) return
  await said
  await sleep(900)
  if (alive) emit('complete')
}

function pos(i: number): { x: number; y: number } {
  const n = order.value[i]!
  return n ? towerPos(n - 1) : homes[i]!
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Построй башню из девяти кубиков">
    <rect x="-800" y="262" width="2040" height="70" fill="#4ade80" />
    <rect x="-800" y="258" width="2040" height="8" fill="#22c55e" />

    <Crocodile x="-14" y="150" width="140" height="102" :mood="count >= 9 ? 'happy' : 'idle'" :mouth="count >= 9 ? 0.4 : 0" :look="1" class="pointer-events-none" />

    <!-- Друг наблюдает за стройкой -->
    <AnimalFigure :kind="level.animal" :mood="count >= 9 ? 'happy' : 'idle'" x="364" y="212" width="76" height="55" class="pointer-events-none" />

    <!-- Куда ставить: следующее место на башне -->
    <g v-if="count < 9" :style="{ transform: `translate(${towerPos(count).x}px, ${towerPos(count).y}px)`, transition: 'transform .4s' }" class="pointer-events-none">
      <rect :x="-SIZE / 2 - 4" :y="-SIZE / 2 - 4" :width="SIZE + 8" :height="SIZE + 8" rx="8" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="4" stroke-dasharray="6 6" class="target" />
    </g>

    <!-- Кубики -->
    <g
      v-for="(c, i) in COLORS"
      :key="i"
      :style="drag.style(i, pos(i))"
      :class="{ placed: order[i] }"
      @pointerdown="drag.start($event, i, pos(i))"
    >
      <rect :x="-SIZE / 2" :y="-SIZE / 2" :width="SIZE" :height="SIZE" rx="5" :fill="c" stroke="#0f172a" stroke-opacity=".4" stroke-width="3" />
      <rect :x="-SIZE / 2 + 4" :y="-SIZE / 2 + 4" :width="SIZE - 8" height="5" rx="2" fill="#fff" opacity=".4" />
      <text v-if="order[i]" y="7" text-anchor="middle" font-size="19" font-weight="900" fill="#fff" stroke="#0f172a" stroke-opacity=".5" stroke-width="1">{{ order[i] }}</text>
      <rect :x="-SIZE" :y="-SIZE" :width="SIZE * 2" :height="SIZE * 2" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
g {
  transform-box: view-box;
}
.placed {
  pointer-events: none;
}
.target {
  animation: blink 0.9s ease-in-out infinite;
}
@keyframes blink {
  50% {
    opacity: 0.4;
  }
}
@media (prefers-reduced-motion: reduce) {
  .target {
    animation: none;
  }
}
</style>
