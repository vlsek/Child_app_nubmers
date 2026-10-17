<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
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
const potPos = (i: number) => ({ x: FLOWERS[i]!.x - 22, y: 180 })

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
  return bd <= 75 ? best : -1
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
  const said = sayNumber(n)
  pouring.value = false
  at.value = -1
  busy.value = false
  if (n < 5) return
  await said
  await sleep(500)
  if (alive) emit('complete')
}

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

    <!-- Лейка (рисуем с центром в 0,0) -->
    <g :style="canStyle" @pointerdown="drag.start($event, 0, CAN_HOME)">
      <g :style="{ transform: `rotate(${pouring ? 24 : 0}deg)`, transition: 'transform .25s' }">
        <g transform="translate(-22 -15)">
          <path d="M0 0 H34 L30 30 H4Z" fill="#38bdf8" stroke="#0369a1" stroke-width="3.5" stroke-linejoin="round" />
          <path d="M34 8 L52 -2 L54 4 L34 16" fill="#38bdf8" stroke="#0369a1" stroke-width="3" stroke-linejoin="round" />
          <path d="M2 8 q-16 -2 -10 14 q4 6 10 4" fill="none" stroke="#0369a1" stroke-width="4" stroke-linecap="round" />
          <g v-if="pouring" fill="#7dd3fc" stroke="none">
            <circle v-for="k in 5" :key="k" r="3.5" :cx="56" :cy="4" class="drop" :style="{ animationDelay: `${k * 0.1}s` }" />
          </g>
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
.drop {
  animation: drop 0.5s ease-in infinite;
}
@keyframes drop {
  from {
    transform: translate(0, 0);
    opacity: 1;
  }
  to {
    transform: translate(10px, 90px);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .bud {
    animation: none;
  }
}
</style>
