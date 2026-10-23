<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { pop } from '@/composables/synth'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 6: «Крокодил купается, лопай пузыри».
 * Над ванной плывут шесть пузырей. Тап: пузырь лопается, голос считает.
 * Друг-лягушонок сидит на краю ванны и смеётся.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const BUBBLES = [
  { x: 70, y: 120, r: 26 },
  { x: 150, y: 70, r: 22 },
  { x: 230, y: 110, r: 28 },
  { x: 310, y: 60, r: 24 },
  { x: 380, y: 120, r: 22 },
  { x: 190, y: 160, r: 18 },
]

/** popped[i] — каким по счёту лопнул пузырь i (0 — плывёт). */
const popped = ref<number[]>(BUBBLES.map(() => 0))
const count = computed(() => popped.value.filter(Boolean).length)
const surprise = ref(false)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('bubbles-intro', 'Лопай пузыри!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function pop(i: number): Promise<void> {
  if (popped.value[i]) return
  const n = count.value + 1
  popped.value[i] = n
  surprise.value = true
  setTimeout(() => (surprise.value = false), 300)
  pop()
  const said = sayNumber(n)
  if (n < 6) return
  await said
  await sleep(400)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Полопай шесть пузырей">
    <rect x="-20" y="290" width="480" height="40" fill="#bae6fd" />

    <!-- Крокодил в ванне -->
    <Crocodile x="96" y="150" width="210" height="154" :mood="count >= 6 ? 'happy' : 'idle'" :mouth="surprise ? 0.5 : 0" :look="0" class="pointer-events-none" />

    <!-- Ванна: закрывает крокодила по пояс -->
    <g stroke-linejoin="round">
      <path d="M40 232 H400 Q400 296 350 296 H90 Q40 296 40 232Z" fill="#fff" stroke="#38bdf8" stroke-width="5" />
      <path d="M52 244 H388" stroke="#7dd3fc" stroke-width="6" stroke-linecap="round" />
      <rect x="84" y="296" width="26" height="14" rx="6" fill="#38bdf8" />
      <rect x="330" y="296" width="26" height="14" rx="6" fill="#38bdf8" />
      <!-- Пена -->
      <g fill="#fff" stroke="#bae6fd" stroke-width="3">
        <circle cx="70" cy="228" r="16" /><circle cx="96" cy="222" r="12" /><circle cx="340" cy="226" r="16" /><circle cx="370" cy="228" r="13" /><circle cx="320" cy="220" r="10" />
      </g>
    </g>

    <!-- Друг на краю ванны -->
    <g transform="translate(360 168) scale(.6)" class="laugh"><AnimalFigure :kind="level.animal" :x="-10" :y="0" :width="120" :height="89.5" crop /></g>

    <!-- Пузыри -->
    <g v-for="(b, i) in BUBBLES" :key="i" :transform="`translate(${b.x} ${b.y})`">
      <g v-if="!popped[i]" class="bubble" :style="{ animationDelay: `${-i * 0.5}s` }" @click="pop(i)">
        <circle :r="b.r" fill="#e0f2fe" fill-opacity=".55" stroke="#38bdf8" stroke-width="3" />
        <path :d="`M${-b.r * 0.55} ${-b.r * 0.2} A${b.r * 0.6} ${b.r * 0.6} 0 0 1 ${-b.r * 0.1} ${-b.r * 0.6}`" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" />
        <circle :r="b.r + 18" fill="transparent" />
      </g>
      <g v-else class="burst" stroke="#38bdf8" stroke-width="4" stroke-linecap="round">
        <path v-for="a in 8" :key="a" :d="`M0 ${-b.r - 4} V${-b.r - 16}`" :transform="`rotate(${a * 45})`" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.bubble {
  cursor: pointer;
  animation: float 2.6s ease-in-out infinite;
}
@keyframes float {
  50% {
    transform: translateY(-10px);
  }
}
.burst {
  animation: burst 0.4s ease-out forwards;
}
@keyframes burst {
  from {
    transform: scale(0.5);
    opacity: 1;
  }
  to {
    transform: scale(1.4);
    opacity: 0;
  }
}
.laugh {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: hop 1s ease-in-out infinite;
}
@keyframes hop {
  50% {
    translate: 0 -5px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .bubble,
  .laugh {
    animation: none;
  }
}
</style>
