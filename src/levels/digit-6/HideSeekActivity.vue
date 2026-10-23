<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { pop } from '@/composables/synth'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 6: «Прятки». Шесть кустиков, за каждым прячется зверёк. Тап по кустику:
 * он трясётся, зверёк выскакивает («ку-ку!»), голос считает, крокодил радуется.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const N = 6
const BUSHES = [
  { x: 205, y: 142 },
  { x: 295, y: 142 },
  { x: 385, y: 142 },
  { x: 205, y: 236 },
  { x: 295, y: 236 },
  { x: 385, y: 236 },
]

/** found[i] — каким по счёту найден зверёк за кустом i (0 — прячется). */
const found = ref<number[]>(BUSHES.map(() => 0))
const shake = ref<number[]>(BUSHES.map(() => 0))
const count = computed(() => found.value.filter(Boolean).length)
const hop = ref(0)
const mouth = ref(0)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('hide-intro', 'Найди, кто спрятался!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function look(i: number): Promise<void> {
  shake.value[i]!++
  if (found.value[i]) return
  await sleep(320)
  if (!alive || found.value[i]) return
  const n = count.value + 1
  found.value[i] = n
  hop.value++
  mouth.value = 0.5
  setTimeout(() => (mouth.value = 0), 400)
  pop()
  const said = sayNumber(n)
  if (n < N) return
  await said
  await sleep(700)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Найди шестерых зверьков за кустами">
    <rect x="-20" y="262" width="480" height="70" fill="#4ade80" />
    <rect x="-20" y="258" width="480" height="8" fill="#22c55e" />

    <defs><clipPath id="hs-clip"><rect x="-70" y="-110" width="140" height="132" /></clipPath></defs>

    <Crocodile :key="hop" x="-20" y="170" width="190" height="139" :mood="count >= N ? 'happy' : 'idle'" :mouth="mouth" :look="1" class="pointer-events-none animate-pop" />

    <g v-for="(b, i) in BUSHES" :key="i" :transform="`translate(${b.x} ${b.y})`" class="cursor-pointer" @pointerdown.prevent="look(i)">
      <!-- Зверёк: за кустом, выскакивает вверх -->
      <g clip-path="url(#hs-clip)" class="pointer-events-none">
      <g :style="{ transform: `translateY(${found[i] ? -24 : 40}px)`, transition: 'transform .4s cubic-bezier(.3,1.7,.5,1)' }">
        <AnimalFigure :kind="level.animal" :x="-46" :y="-62" :width="92" :height="67" :mood="found[i] ? 'happy' : 'idle'" />
      </g>
      </g>
      <!-- Куст -->
      <g :key="shake[i]" :class="{ shake: shake[i] }">
        <ellipse cx="0" cy="26" rx="46" ry="6" fill="#0f172a" opacity=".15" />
        <g stroke="#166534" stroke-width="3.5" stroke-linejoin="round">
          <circle cx="-26" cy="8" r="22" fill="#22c55e" />
          <circle cx="26" cy="8" r="22" fill="#22c55e" />
          <circle cx="0" cy="-2" r="28" fill="#4ade80" />
        </g>
        <path d="M-12 -18 q8 -8 18 -4" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".4" />
        <g fill="#ef4444" stroke="#991b1b" stroke-width="2"><circle cx="-24" cy="10" r="4" /><circle cx="14" cy="14" r="4" /><circle cx="30" cy="2" r="4" /></g>
      </g>
      <!-- Номер найденного -->
      <g v-if="found[i]" class="pointer-events-none">
        <circle cx="38" cy="-46" r="13" fill="#fff" stroke="#0f172a" stroke-opacity=".4" stroke-width="2.5" />
        <text x="38" y="-45" text-anchor="middle" dominant-baseline="central" font-size="17" font-weight="900" fill="#0f172a" font-family="Nunito, 'Trebuchet MS', sans-serif">{{ found[i] }}</text>
      </g>
      <circle r="46" cy="0" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.shake {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: shake 0.4s ease-in-out;
}
@keyframes shake {
  20% {
    transform: rotate(-6deg) scale(1.04);
  }
  50% {
    transform: rotate(6deg) scale(1.04);
  }
  80% {
    transform: rotate(-3deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .shake {
    animation: none;
  }
}
</style>
