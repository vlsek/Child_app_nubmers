<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { boing } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 2: «Два на качелях». Крокодил сидит на одном конце доски, другой конец высоко в воздухе.
 * Друга тащат на пустое место (или тапают три раза): доска выравнивается и качается, голос считает «один, два».
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()
const { sayNumber, sayLine, stopVoice } = useAudio()

const PIVOT = { x: 220, y: 238 }
const TILT = -12
const SEAT_LOCAL = { x: 100, y: -12 }
const rad = (TILT * Math.PI) / 180
/** Где пустое место в мире, пока доска наклонена. */
const SEAT = {
  x: PIVOT.x + SEAT_LOCAL.x * Math.cos(rad) - SEAT_LOCAL.y * Math.sin(rad),
  y: PIVOT.y + SEAT_LOCAL.x * Math.sin(rad) + SEAT_LOCAL.y * Math.cos(rad),
}
const HOME = { x: 392, y: 230 }

const seated = ref(false)
const rocking = ref(false)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('seesaw-intro', 'Посади друга на качели!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: () => !seated.value,
  onDrop: (_, p) => {
    if (!near(p, SEAT, 80)) return false
    void sit()
    return true
  },
  onTap: () => void sit(),
})

async function sit(): Promise<void> {
  if (seated.value) return
  seated.value = true
  boing()
  await sleep(700)
  if (!alive) return
  rocking.value = true
  await sayNumber(1)
  if (!alive) return
  await sayNumber(2)
  await sleep(1200)
  if (!alive) return
  rocking.value = false
  await sleep(500)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Посади друга на качели: двое на качелях">
    <rect x="-800" y="-1200" width="2040" height="1462" fill="#bae6fd" />
    <rect x="-800" y="262" width="2040" height="900" fill="#4ade80" />
    <rect x="-800" y="258" width="2040" height="8" fill="#22c55e" />
    <g class="pointer-events-none" fill="#fff" opacity=".9"><ellipse cx="90" cy="60" rx="34" ry="14" /><ellipse cx="330" cy="40" rx="30" ry="12" /></g>

    <!-- Опора -->
    <path :d="`M${PIVOT.x} ${PIVOT.y} L${PIVOT.x - 34} 264 H${PIVOT.x + 34}Z`" fill="#a16207" stroke="#713f12" stroke-width="4" stroke-linejoin="round" class="pointer-events-none" />

    <!-- Доска с седоками -->
    <g :transform="`translate(${PIVOT.x} ${PIVOT.y})`" class="pointer-events-none">
      <g class="board" :class="{ rock: rocking }" :style="{ transform: `rotate(${seated ? 0 : TILT}deg)` }">
        <rect x="-125" y="-10" width="250" height="13" rx="6" fill="#f59e0b" stroke="#92400e" stroke-width="4" />
        <rect x="-18" y="-14" width="36" height="8" rx="3" fill="#92400e" />
        <Crocodile x="-152" y="-80" width="100" height="73" :mood="seated ? 'happy' : 'idle'" :look="1" />
        <g v-if="seated" transform="translate(100 -12)">
          <AnimalFigure :kind="level.animal" flip mood="happy" x="-45" y="-62" width="90" height="66" />
        </g>
      </g>
    </g>

    <!-- Куда посадить: мягкое кольцо у пустого конца -->
    <circle v-if="!seated" :cx="SEAT.x" :cy="SEAT.y - 20" r="48" fill="#fff" fill-opacity=".25" stroke="#fff" stroke-width="4" stroke-dasharray="8 8" class="ring pointer-events-none" />

    <!-- Друг ждёт на земле: тащить на качели -->
    <g v-if="!seated" :style="drag.style(0, HOME)" @pointerdown="drag.start($event, 0, HOME)">
      <AnimalFigure :kind="level.animal" flip x="-48" y="-35" width="96" height="70" class="pointer-events-none" />
      <circle r="52" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.board { transition: transform 0.6s cubic-bezier(0.3, 1.4, 0.5, 1); transform-origin: 0 0; }
.rock { animation: rock 1.3s ease-in-out 2; }
.ring { animation: ring 1.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes rock {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
}
@keyframes ring { 50% { opacity: 0.5; transform: scale(1.06); } }
@media (prefers-reduced-motion: reduce) { .rock, .ring { animation: none; } }
</style>
