<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { splash } from '@/composables/synth'
import { useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 5: «Крокодил поливает пять цветочков».
 * Лейку перетаскивают к бутону (или тапают по лейке/бутону, тогда она плывёт сама):
 * льётся вода, цветок распускается, голос считает. Друг радуется распустившимся цветам.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const FLOWERS = [178, 234, 290, 346, 402].map((x, i) => ({ x, color: ['#ef4444', '#f97316', '#facc15', '#ec4899', '#a855f7'][i]! }))
/** Центр лейки дома и над цветком (носик смотрит на бутон). */
const CAN_HOME = { x: 122, y: 226 }
/** Лейка висит левее и выше цветка: носик (≈ +50, +4 после наклона) прямо над бутоном. */
const potPos = (i: number) => ({ x: FLOWERS[i]!.x - 50, y: 128 })

/** bloom[i] — каким по счёту расцвёл цветок i (0 — бутон). */
const bloom = ref<number[]>([0, 0, 0, 0, 0])
const count = computed(() => bloom.value.filter(Boolean).length)
/** Над каким цветком лейка (-1 — у крокодила) и льётся ли вода. */
const at = ref(-1)
const pouring = ref(false)
const busy = ref(false)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))


onMounted(() => void sayLine('flowers-intro', 'Полей цветочки!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

/** Ближайший нераспустившийся бутон к лейке в точке p (в радиусе 75), иначе -1. */
function budNear(p: { x: number; y: number }): number {
  let best = -1
  let bd = Infinity
  FLOWERS.forEach((_, i) => {
    const d = Math.hypot(p.x - potPos(i).x, p.y - potPos(i).y)
    if (!bloom.value[i] && d < bd) {
      bd = d
      best = i
    }
  })
  return bd <= 90 ? best : -1
}

const drag = useDrag<number>(svg, {
  canGrab: () => !busy.value,
  onDrop: (_, p) => water(budNear(p)),
  // Тап по лейке: она плывёт к первому нераспустившемуся цветку.
  onTap: () => void water(bloom.value.findIndex((b) => !b)),
})

function water(i: number): boolean {
  if (i < 0 || bloom.value[i] || busy.value) return false
  busy.value = true
  void pour(i)
  return true
}

async function pour(i: number): Promise<void> {
  at.value = i
  await sleep(450)
  pouring.value = true
  await sleep(700)
  if (!alive) return
  const n = count.value + 1
  bloom.value[i] = n
  splash()
  const said = sayNumber(n)
  pouring.value = false
  at.value = -1
  busy.value = false
  if (n < 5) return
  await said
  await sleep(500)
  if (alive) emit('complete')
}

/** Над каким бутоном несут лейку прямо сейчас (-1, если ни над каким): она наклоняется и льёт. */
const hover = computed(() => {
  const a = drag.active.value
  return a ? budNear({ x: a.x, y: a.y }) : -1
})
const tilted = computed(() => pouring.value || hover.value >= 0)

const canStyle = computed(() =>
  at.value >= 0
    ? { transform: `translate(${potPos(at.value).x}px, ${potPos(at.value).y}px)`, transition: 'transform .45s ease-in-out' }
    : drag.style(0, CAN_HOME),
)
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Полей пять цветочков">
    <rect x="-20" y="262" width="480" height="70" fill="#4ade80" />
    <rect x="-20" y="258" width="480" height="8" fill="#22c55e" />

    <!-- Друг радуется -->
    <AnimalFigure :kind="level.animal" flip :mood="count >= 5 ? 'happy' : 'idle'" x="300" y="62" width="140" height="102" class="pointer-events-none" />

    <Crocodile x="-14" y="174" width="170" height="124" :mood="count >= 5 ? 'happy' : 'idle'" :mouth="0" :look="1" class="pointer-events-none" />

    <!-- Цветы -->
    <g v-for="(f, i) in FLOWERS" :key="i" :transform="`translate(${f.x} 262)`" @click="water(i)">
      <path d="M0 0 V-52" stroke="#15803d" stroke-width="6" stroke-linecap="round" />
      <path d="M0 -22 q-18 -4 -20 -18 q16 0 20 18Z" fill="#22c55e" stroke="#15803d" stroke-width="2.5" />
      <g transform="translate(0 -62)">
        <g v-if="bloom[i]" class="bloom">
          <circle v-for="a in 6" :key="a" cy="-16" r="12" :fill="f.color" stroke="#0f172a" stroke-opacity=".3" stroke-width="2.5" :transform="`rotate(${a * 60})`" />
          <circle r="10" fill="#fde047" stroke="#a16207" stroke-width="2.5" />
        </g>
        <ellipse v-else class="bud" rx="11" ry="15" fill="#86efac" stroke="#15803d" stroke-width="3" />
      </g>
      <rect x="-28" y="-100" width="56" height="106" fill="transparent" />
    </g>

    <!-- Лейка (рисуем с центром в 0,0, носик справа) -->
    <g :style="canStyle" @pointerdown="drag.start($event, 0, CAN_HOME)">
      <ellipse cx="0" cy="26" rx="34" ry="5" fill="#0f172a" opacity=".15" />
      <g :style="{ transform: `rotate(${tilted ? 28 : 0}deg)`, transition: 'transform .25s' }">
        <!-- задняя ручка -->
        <path d="M-24 -8 C-50 -10 -50 22 -22 16" fill="none" stroke="#0369a1" stroke-width="9" stroke-linecap="round" />
        <path d="M-24 -8 C-50 -10 -50 22 -22 16" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
        <!-- носик с трубкой -->
        <path d="M18 14 L44 -14 L50 -9 L24 22Z" fill="#0ea5e9" stroke="#0369a1" stroke-width="3.5" stroke-linejoin="round" />
        <!-- розетка (насадка) -->
        <path d="M40 -22 L56 -10 L52 -4 L38 -16Z" fill="#fbbf24" stroke="#b45309" stroke-width="3" stroke-linejoin="round" />
        <circle cx="53" cy="-5" r="1.4" fill="#92400e" /><circle cx="49" cy="-8" r="1.4" fill="#92400e" /><circle cx="55" cy="-9" r="1.4" fill="#92400e" />
        <!-- корпус -->
        <path d="M-26 -16 H22 L26 22 Q26 28 20 28 H-20 Q-26 28 -26 22Z" fill="#38bdf8" stroke="#0369a1" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M-26 6 H25 M-26 -5 H24" stroke="#0284c7" stroke-width="2.5" opacity=".7" />
        <path d="M-19 -9 V19" stroke="#e0f2fe" stroke-width="4" stroke-linecap="round" opacity=".8" />
        <!-- горловина с водой -->
        <ellipse cx="-2" cy="-16" rx="24" ry="5.5" fill="#0369a1" />
        <ellipse cx="-2" cy="-16.5" rx="19" ry="3.6" fill="#7dd3fc" />
        <!-- верхняя ручка -->
        <path d="M-15 -17 C-15 -46 11 -46 11 -17" fill="none" stroke="#0369a1" stroke-width="8" stroke-linecap="round" />
        <path d="M-15 -17 C-15 -46 11 -46 11 -17" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" />
        <!-- заклёпки -->
        <circle cx="-22" cy="-8" r="1.8" fill="#0369a1" /><circle cx="19" cy="-8" r="1.8" fill="#0369a1" />
        <!-- струя из насадки -->
        <g v-if="tilted" fill="none" stroke-linecap="round" class="pointer-events-none">
          <template v-for="(dx, k) in [-8, 0, 8]" :key="k">
            <path :d="`M${47 + dx * 0.4} -13 q${dx * 0.7} 26 ${dx * 1.1} 50`" stroke="#38bdf8" stroke-width="4" stroke-dasharray="9 7" class="stream" :style="{ animationDelay: `${k * 0.08}s` }" transform="rotate(-28 47 -13)" />
          </template>
        </g>
      </g>
      <circle r="46" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.bud {
  cursor: pointer;
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: bud 1.1s ease-in-out infinite;
}
@keyframes bud {
  50% {
    transform: scale(1.1);
  }
}
.bloom {
  animation: bloom 0.5s cubic-bezier(0.3, 1.5, 0.5, 1);
}
@keyframes bloom {
  from {
    transform: scale(0);
  }
}
.stream {
  animation: stream 0.35s linear infinite;
}
@keyframes stream {
  to {
    stroke-dashoffset: -16;
  }
}
@media (prefers-reduced-motion: reduce) {
  .bud {
    animation: none;
  }
}
</style>
