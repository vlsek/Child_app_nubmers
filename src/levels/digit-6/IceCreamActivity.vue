<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { drop, fanfare } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 6: «Мороженое». Из морозильника-тележки перетаскивают шесть шариков в вафельный рожок:
 * они складываются в башенку, голос считает. На шестом сверху появляется вишенка, крокодил радуется.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const N = 6
const TARGET = { x: 215, y: 140 }
const STACK_X = 215
const STACK_Y0 = 186
const STEP = 25
const SCOOPS = [
  { fill: '#f9a8d4', stroke: '#be185d', home: { x: 308, y: 62 } },
  { fill: '#fde047', stroke: '#a16207', home: { x: 356, y: 62 } },
  { fill: '#6ee7b7', stroke: '#047857', home: { x: 404, y: 62 } },
  { fill: '#c4b5fd', stroke: '#6d28d9', home: { x: 308, y: 114 } },
  { fill: '#fdba74', stroke: '#c2410c', home: { x: 356, y: 114 } },
  { fill: '#7dd3fc', stroke: '#0369a1', home: { x: 404, y: 114 } },
]

/** got[i] — каким по счёту шарик i лёг в рожок (0 — ещё в морозильнике). */
const got = ref<number[]>(SCOOPS.map(() => 0))
const count = computed(() => got.value.filter(Boolean).length)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('icecream-intro', 'Собери мороженое!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: (i) => !got.value[i],
  onDrop: (i, p) => near(p, TARGET, 100) && put(i),
  onTap: (i) => void put(i),
})

function placedStyle(n: number): Record<string, string> {
  return {
    transform: `translate(${STACK_X}px, ${STACK_Y0 - (n - 1) * STEP}px)`,
    transition: 'transform .45s cubic-bezier(.3,1.5,.5,1)',
    pointerEvents: 'none',
  }
}

function put(i: number): boolean {
  if (got.value[i]) return false
  void collect(i)
  return true
}

async function collect(i: number): Promise<void> {
  const n = count.value + 1
  got.value[i] = n
  drop()
  const said = sayNumber(n)
  if (n < N) return
  await said
  fanfare()
  await sleep(1400)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Собери шесть шариков мороженого">
    <rect x="-800" y="-1200" width="2040" height="1462" fill="#e0f2fe" />
    <rect x="-800" y="262" width="2040" height="900" fill="#bbf7d0" />
    <rect x="-800" y="258" width="2040" height="8" fill="#4ade80" />

    <!-- Морозильник-тележка -->
    <g>
      <rect x="282" y="24" width="150" height="238" rx="14" fill="#38bdf8" stroke="#0369a1" stroke-width="4" />
      <rect x="292" y="34" width="130" height="136" rx="10" fill="#e0f2fe" stroke="#0369a1" stroke-width="3" />
      <rect x="282" y="176" width="150" height="10" fill="#0ea5e9" />
      <circle cx="308" cy="62" r="25" fill="#bae6fd" /><circle cx="356" cy="62" r="25" fill="#bae6fd" /><circle cx="404" cy="62" r="25" fill="#bae6fd" />
      <circle cx="308" cy="114" r="25" fill="#bae6fd" /><circle cx="356" cy="114" r="25" fill="#bae6fd" /><circle cx="404" cy="114" r="25" fill="#bae6fd" />
    </g>

    <!-- Друг стоит перед тележкой -->
    <AnimalFigure :kind="level.animal" flip :mood="count >= N ? 'happy' : 'idle'" x="336" y="190" width="96" height="70" class="pointer-events-none" />

    <Crocodile x="-14" y="176" width="170" height="124" :mood="count >= N ? 'happy' : 'idle'" :mouth="count >= N ? 0.6 : 0" :look="1" class="pointer-events-none" />

    <!-- Рожок на подставке -->
    <path d="M192 194 H238 L216 254Z" fill="#f4c27a" stroke="#a16207" stroke-width="4" stroke-linejoin="round" />
    <path d="M200 204 L228 204 M205 216 L225 216 M210 228 L222 228 M200 204 L214 244 M228 204 L214 244" fill="none" stroke="#a16207" stroke-width="2" opacity=".5" />
    <path d="M194 236 H238 L242 262 H190Z" fill="#94a3b8" stroke="#475569" stroke-width="4" stroke-linejoin="round" />

    <!-- Зона цели -->
    <ellipse :cx="TARGET.x" cy="130" rx="46" ry="82" fill="#fde68a" fill-opacity=".25" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8 6" class="pointer-events-none" />

    <!-- Шарики -->
    <g
      v-for="(s, i) in SCOOPS"
      :key="i"
      :style="got[i] ? placedStyle(got[i]!) : drag.style(i, s.home)"
      @pointerdown="drag.start($event, i, s.home)"
    >
      <g :class="{ plop: !!got[i], idle: !got[i] && drag.active.value?.id !== i }" :style="{ animationDelay: `${-i * 0.3}s` }">
        <circle r="21" :fill="s.fill" :stroke="s.stroke" stroke-width="3.5" />
        <path d="M-17 8 q3 12 7 4 q4 9 8 0 q4 9 8 1 q4 8 7 -3" fill="none" :stroke="s.stroke" stroke-width="2.5" stroke-linecap="round" opacity=".45" />
        <ellipse cx="-7" cy="-8" rx="4" ry="6" fill="#fff" opacity=".5" />
      </g>
      <circle r="28" fill="transparent" />
    </g>

    <!-- Вишенка на макушке -->
    <g v-if="count >= N" :transform="`translate(${STACK_X} ${STACK_Y0 - (N - 1) * STEP - 30})`" class="pointer-events-none">
      <g class="cherry">
        <path d="M0 6 q-2 -14 8 -20" fill="none" stroke="#15803d" stroke-width="3" stroke-linecap="round" />
        <circle r="10" cy="8" fill="#dc2626" stroke="#7f1d1d" stroke-width="3" />
        <ellipse cx="-3" cy="5" rx="2.5" ry="3.5" fill="#fff" opacity=".5" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.idle {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: bob 1.6s ease-in-out infinite;
}
@keyframes bob {
  50% {
    translate: 0 -3px;
  }
}
.plop {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: plop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
}
@keyframes plop {
  0% {
    scale: 1.25 0.75;
  }
  60% {
    scale: 0.92 1.1;
  }
  100% {
    scale: 1 1;
  }
}
.cherry {
  animation: cherry-in 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
}
@keyframes cherry-in {
  from {
    transform: translateY(-30px) scale(0.2);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .idle,
  .plop,
  .cherry {
    animation: none;
  }
}
</style>
