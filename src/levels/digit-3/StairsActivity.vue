<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 3: «Крокодил идёт к другу по лестнице из трёх ступенек».
 * Тап по светящейся ступеньке или по крокодилу: он прыгает на следующую, голос считает.
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

const crocPos = computed(() => {
  if (at.value === 0) return { x: 8, y: 262 - CROC_H + 6 }
  const s = STEPS[at.value - 1]!
  return { x: s.x + W / 2 - CROC_W / 2, y: s.top - CROC_H + 6 }
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
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Помоги крокодилу подняться на три ступеньки">
    <rect x="-20" y="262" width="480" height="70" fill="#4ade80" />
    <rect x="-20" y="258" width="480" height="8" fill="#22c55e" />

    <!-- Площадка и друг наверху -->
    <rect x="336" y="106" width="110" height="160" rx="6" fill="#d6a56b" stroke="#7c4a1e" stroke-width="4" />
    <g transform="translate(360 44) scale(.62)" class="friend"><AnimalHead :kind="level.animal" /></g>

    <!-- Ступеньки -->
    <g v-for="(s, i) in STEPS" :key="i" :class="{ next: at === i }" @click="climb">
      <rect :x="s.x" :y="s.top" :width="W" :height="262 - s.top" rx="6" fill="#d6a56b" stroke="#7c4a1e" stroke-width="4" />
      <rect :x="s.x + 4" :y="s.top + 4" :width="W - 8" height="9" rx="4" fill="#f0c98f" />
      <rect :x="s.x - 10" :y="s.top - 40" :width="W + 20" :height="262 - s.top + 40" fill="transparent" />
    </g>

    <!-- Крокодил -->
    <g :style="{ transform: `translate(${crocPos.x}px, ${crocPos.y}px)`, transition: 'transform .5s cubic-bezier(.3,1.4,.5,1)' }" @click="climb">
      <Crocodile :width="CROC_W" :height="CROC_H" :mood="at >= 3 ? 'happy' : 'idle'" :mouth="at >= 3 ? 0.4 : 0" :look="1" />
      <rect x="-10" y="-10" :width="CROC_W + 20" :height="CROC_H + 20" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
g {
  cursor: pointer;
}
.next rect:first-child {
  animation: glow 0.9s ease-in-out infinite;
}
@keyframes glow {
  50% {
    fill: #fde68a;
  }
}
.friend {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: cheer 1.2s ease-in-out infinite;
}
@keyframes cheer {
  50% {
    translate: 0 -5px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .next rect:first-child,
  .friend {
    animation: none;
  }
}
</style>
