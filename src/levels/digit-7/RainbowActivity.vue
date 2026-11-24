<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { SCALE, useTone } from '@/composables/useTone'
import { fanfare } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 7: «Радуга». С облачков каплями висят семь красок. Каплю тащат на небо, и в радуге загорается её дуга
 * (звучит нота, голос считает). Когда все семь дуг на месте, радуга играет мелодию, звери радуются.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()
const { tone } = useTone()

const N = 7
const COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#6366f1', '#a855f7']
const CX = 285
const CY = 258
const radius = (k: number): number => 148 - k * 14
const arc = (k: number): string => `M ${CX - radius(k)} ${CY} A ${radius(k)} ${radius(k)} 0 0 1 ${CX + radius(k)} ${CY}`
const HOMES = COLORS.map((_, i) => ({ x: 36 + i * 58, y: 44 }))

/** placed[i] — каким по счёту поставлена дуга i (0 — ещё нет). */
const placed = ref<number[]>(COLORS.map(() => 0))
const count = computed(() => placed.value.filter(Boolean).length)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('rainbow-intro', 'Нарисуй радугу!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: (i) => !placed.value[i],
  onDrop: (i, p) => near(p, { x: CX, y: CY }, 175) && p.y < 250 && put(i),
  onTap: (i) => void put(i),
})

function put(i: number): boolean {
  if (placed.value[i]) return false
  void paint(i)
  return true
}

async function paint(i: number): Promise<void> {
  const n = count.value + 1
  placed.value[i] = n
  tone(SCALE[i]!, 0.6)
  const said = sayNumber(n)
  if (n < N) return
  await said
  fanfare()
  for (const k of [0, 1, 2, 3, 4, 5, 6]) {
    if (!alive) return
    tone(SCALE[k]!, 0.5)
    await sleep(170)
  }
  await sleep(900)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Нарисуй радугу из семи красок">
    <rect x="-800" y="-1200" width="2040" height="1462" fill="#bae6fd" />
    <rect x="-800" y="262" width="2040" height="900" fill="#86efac" />
    <rect x="-800" y="258" width="2040" height="8" fill="#22c55e" />

    <!-- Облачка, с которых капают краски -->
    <g fill="#fff" stroke="#e0f2fe" stroke-width="3" class="pointer-events-none">
      <g v-for="(h, i) in HOMES" :key="i">
        <ellipse :cx="h.x" :cy="h.y - 6" rx="30" ry="20" />
        <ellipse :cx="h.x - 18" :cy="h.y + 2" rx="16" ry="12" />
        <ellipse :cx="h.x + 18" :cy="h.y + 2" rx="16" ry="12" />
      </g>
    </g>

    <!-- Места под дуги -->
    <path v-for="(_, k) in COLORS" :key="`g${k}`" :d="arc(k)" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="13" class="pointer-events-none" />
    <!-- Сами дуги -->
    <path
      v-for="(c, k) in COLORS"
      :key="`a${k}`"
      :d="arc(k)"
      fill="none"
      :stroke="c"
      stroke-width="14"
      pathLength="100"
      stroke-dasharray="100"
      :style="{ strokeDashoffset: placed[k] ? 0 : 100, transition: 'stroke-dashoffset .8s ease-out' }"
      class="pointer-events-none"
    />

    <!-- Звери под радугой -->
    <AnimalFigure :kind="level.animal" :mood="count >= N ? 'happy' : 'idle'" x="236" y="186" width="100" height="73" class="pointer-events-none" />
    <Crocodile x="-30" y="176" width="165" height="120" :mood="count >= N ? 'happy' : 'idle'" :mouth="0" :look="1" class="pointer-events-none" />

    <!-- Капли краски -->
    <g
      v-for="(c, i) in COLORS"
      :key="`d${i}`"
      :style="
        placed[i]
          ? { transform: `translate(${CX}px, ${CY - radius(i)}px) scale(.2)`, opacity: 0, transition: 'transform .5s ease-in, opacity .2s .35s', pointerEvents: 'none' }
          : drag.style(i, HOMES[i]!)
      "
      @pointerdown="drag.start($event, i, HOMES[i]!)"
    >
      <g :class="{ drip: !placed[i] && drag.active.value?.id !== i }" :style="{ animationDelay: `${-i * 0.25}s` }">
        <path d="M0 -26 C10 -12 20 -4 20 6 A20 20 0 0 1 -20 6 C-20 -4 -10 -12 0 -26Z" :fill="c" stroke="#0f172a" stroke-opacity=".35" stroke-width="3.5" />
        <ellipse cx="-7" cy="2" rx="3.5" ry="6" fill="#fff" opacity=".5" />
      </g>
      <circle r="30" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.drip {
  transform-box: fill-box;
  transform-origin: 50% 0;
  animation: drip 1.5s ease-in-out infinite;
}
@keyframes drip {
  50% {
    scale: 0.94 1.1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .drip {
    animation: none;
  }
}
</style>
