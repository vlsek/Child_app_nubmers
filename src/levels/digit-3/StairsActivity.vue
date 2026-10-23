<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { boing } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 3: «Крокодил идёт к другу по лестнице из трёх ступенек».
 * Крокодила тащат пальцем на светящуюся ступеньку. Если просто ткнуть (в него или в ступеньку),
 * он сам прыгает на следующую. Голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

/** Ступеньки слева направо: верхняя грань y и левый край x. */
const STEPS = [
  { x: 96, top: 226 },
  { x: 176, top: 186 },
  { x: 256, top: 146 },
]
const W = 80
const CROC_W = 100
const CROC_H = 73

/** Сколько ступенек пройдено; крокодил стоит на ступеньке number (0 — на земле). */
const at = ref(0)
let alive = true
let busy = false
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Центр крокодила, когда он стоит на ступеньке number (0 — на земле). */
const centerAt = (k: number) => {
  if (k === 0) return { x: 8 + CROC_W / 2, y: 262 - CROC_H / 2 + 6 }
  const s = STEPS[k - 1]!
  return { x: s.x + W / 2, y: s.top - CROC_H / 2 + 6 }
}
const home = computed(() => centerAt(at.value))
const svg = ref<SVGSVGElement | null>(null)

/** Куда надо донести крокодила: следующая ступенька. */
const drag = useDrag<number>(svg, {
  canGrab: () => !busy && at.value < 3,
  onDrop: (_, p) => {
    if (at.value >= 3 || !near(p, centerAt(at.value + 1), 80)) return false
    void climb()
    return true
  },
  onTap: () => void climb(),
})

onMounted(() => void sayLine('stairs-intro', 'Помоги крокодилу подняться!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function climb(): Promise<void> {
  if (busy || at.value >= 3) return
  busy = true
  at.value++
  boing()
  const said = sayNumber(at.value)
  await sleep(550)
  busy = false
  if (at.value < 3) return
  await said
  await sleep(500)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Помоги крокодилу подняться на три ступеньки">
    <rect x="-20" y="262" width="480" height="70" fill="#4ade80" />
    <rect x="-20" y="258" width="480" height="8" fill="#22c55e" />

    <!-- Площадка и друг наверху -->
    <rect x="336" y="106" width="110" height="160" rx="6" fill="#d6a56b" stroke="#7c4a1e" stroke-width="4" />
    <AnimalFigure :kind="level.animal" flip :mood="at >= 3 ? 'happy' : 'idle'" x="336" y="28" width="104" height="76" class="pointer-events-none" />

    <!-- Ступеньки -->
    <g v-for="(s, i) in STEPS" :key="i" :class="{ next: at === i }" style="cursor: pointer" @click="climb">
      <rect :x="s.x" :y="s.top" :width="W" :height="262 - s.top" rx="6" fill="#d6a56b" stroke="#7c4a1e" stroke-width="4" />
      <rect :x="s.x + 4" :y="s.top + 4" :width="W - 8" height="9" rx="4" fill="#f0c98f" />
      <rect :x="s.x - 10" :y="s.top - 40" :width="W + 20" :height="262 - s.top + 40" fill="transparent" />
    </g>

    <!-- Куда нести: пунктирный круг на следующей ступеньке -->
    <circle v-if="at < 3" :cx="centerAt(at + 1).x" :cy="centerAt(at + 1).y" r="52" fill="#fde68a" fill-opacity=".35" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="9 8" class="pointer-events-none" />

    <!-- Крокодил -->
    <g :style="drag.style(0, home)" @pointerdown="drag.start($event, 0, home)">
      <g :transform="`translate(${-CROC_W / 2} ${-CROC_H / 2})`">
        <Crocodile :width="CROC_W" :height="CROC_H" :mood="at >= 3 ? 'happy' : 'idle'" :mouth="at >= 3 ? 0.4 : 0" :look="1" />
      </g>
      <rect :x="-CROC_W / 2 - 10" :y="-CROC_H / 2 - 10" :width="CROC_W + 20" :height="CROC_H + 20" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
g {
  transform-box: view-box;
}
.next rect:first-child {
  animation: glow 0.9s ease-in-out infinite;
}
@keyframes glow {
  50% {
    fill: #fde68a;
  }
}
@media (prefers-reduced-motion: reduce) {
  .next rect:first-child {
    animation: none;
  }
}
</style>
