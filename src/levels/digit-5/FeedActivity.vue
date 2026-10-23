<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { chomp } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 5: «Покорми крокодила». Крокодил сидит с открытой пастью и голодный.
 * Яблоки несут ему в пасть (или тапают, тогда яблоко само летит): ам! пасть захлопывается,
 * крокодил жуёт, голос считает. Когда пятое съедено, крокодил довольно хлопает пастью.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const TOTAL = 5
const MOUTH = { x: 196, y: 176 }
const HOMES = [
  { x: 258, y: 262 },
  { x: 302, y: 270 },
  { x: 346, y: 262 },
  { x: 280, y: 232 },
  { x: 324, y: 232 },
]

/** eaten[i] — каким по счёту съедено яблоко i (0 — лежит). */
const eaten = ref<number[]>(HOMES.map(() => 0))
const count = computed(() => eaten.value.filter(Boolean).length)
const mouth = ref(0.75)
const flying = ref<number | null>(null)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('feed-intro', 'Покорми крокодила!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: (i) => !eaten.value[i] && flying.value === null,
  onDrop: (i, p) => {
    if (!near(p, MOUTH, 80)) return false
    void eat(i)
    return true
  },
  // Тап: яблоко само летит в пасть.
  onTap: (i) => void fly(i),
})

async function fly(i: number): Promise<void> {
  if (eaten.value[i] || flying.value !== null) return
  flying.value = i
  await sleep(420)
  await eat(i)
}

async function eat(i: number): Promise<void> {
  if (eaten.value[i]) return
  const n = count.value + 1
  eaten.value[i] = n
  flying.value = null
  mouth.value = 0.05
  chomp()
  const said = sayNumber(n)
  await sleep(260)
  if (!alive) return
  mouth.value = n < TOTAL ? 0.75 : 0.3
  if (n < TOTAL) return
  await said
  await sleep(500)
  if (alive) emit('complete')
}

/** Пока яблоко несут рядом с пастью: пасть раскрывается шире. */
const hovering = computed(() => {
  const a = drag.active.value
  return !!a && near({ x: a.x, y: a.y }, MOUTH, 80)
})
const mouthOpen = computed(() => (hovering.value ? 1 : mouth.value))

function appleStyle(i: number): Record<string, string> {
  if (flying.value === i) return { transform: `translate(${MOUTH.x}px, ${MOUTH.y}px) scale(.5)`, transition: 'transform .4s ease-in' }
  return drag.style(i, HOMES[i]!)
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Покорми крокодила пятью яблоками">
    <rect x="-800" y="262" width="2040" height="70" fill="#4ade80" />
    <rect x="-800" y="258" width="2040" height="8" fill="#22c55e" />

    <!-- Друг смотрит -->
    <AnimalFigure :kind="level.animal" flip :mood="count >= TOTAL ? 'happy' : 'idle'" x="340" y="182" width="108" height="79" class="pointer-events-none" />

    <Crocodile x="0" y="84" width="250" height="183" :mood="count >= TOTAL ? 'happy' : 'idle'" :mouth="mouthOpen" :look="1" class="pointer-events-none" />

    <!-- Яблоки (рисуем с центром в 0,0) -->
    <template v-for="(h, i) in HOMES" :key="i">
      <g v-if="!eaten[i]" :style="appleStyle(i)" @pointerdown="drag.start($event, i, h)">
        <ellipse cx="0" cy="20" rx="17" ry="4" fill="#0f172a" opacity=".15" />
        <path d="M0 -18 C-24 -22 -26 14 -12 20 C-6 23 -4 20 0 20 C4 20 6 23 12 20 C26 14 24 -22 0 -18Z" fill="#ef4444" stroke="#991b1b" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M-12 -8 q-4 8 0 14" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55" />
        <path d="M0 -18 q2 -9 7 -12" fill="none" stroke="#7c4a1e" stroke-width="3.5" stroke-linecap="round" />
        <path d="M3 -24 q10 -8 18 -2 q-6 8 -18 2Z" fill="#22c55e" stroke="#15803d" stroke-width="2.5" stroke-linejoin="round" />
        <circle r="34" fill="transparent" />
      </g>
    </template>
  </svg>
</template>
