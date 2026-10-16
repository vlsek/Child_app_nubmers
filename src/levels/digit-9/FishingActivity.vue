<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 9: «Крокодил ловит девять рыбок».
 * Тап по рыбке: она выпрыгивает из пруда в ведёрко, где сидит друг-тигрёнок, голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const BUCKET = { x: 404, y: 196 }
const COLORS = ['#fb923c', '#f472b6', '#facc15', '#38bdf8', '#a3e635', '#f87171', '#c084fc', '#fb923c', '#2dd4bf']
const FISH = Array.from({ length: 9 }, (_, i) => ({
  x: 120 + (i % 3) * 82 + (Math.floor(i / 3) % 2) * 20,
  y: 232 + Math.floor(i / 3) * 30,
  color: COLORS[i]!,
}))

/** caught[i] — какой по счёту выловлена рыбка i (0 — плавает). */
const caught = ref<number[]>(FISH.map(() => 0))
const count = computed(() => caught.value.filter(Boolean).length)
const mouth = ref(0)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('fishing-intro', 'Лови рыбок!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function catchFish(i: number): Promise<void> {
  if (caught.value[i]) return
  const n = count.value + 1
  caught.value[i] = n
  mouth.value = 0.4
  setTimeout(() => (mouth.value = 0), 400)
  const said = sayNumber(n)
  if (n < 9) return
  await said
  await sleep(700)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Поймай девять рыбок">
    <!-- Берега и пруд -->
    <rect x="-20" y="206" width="480" height="130" fill="#4ade80" />
    <path d="M92 212 H368 V300 Q368 318 350 318 H110 Q92 318 92 300Z" fill="#38bdf8" stroke="#0284c7" stroke-width="4" />
    <path d="M110 226 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#bae6fd" stroke-width="4" stroke-linecap="round" opacity=".8" />

    <Crocodile x="-14" y="98" width="170" height="124" :mood="count >= 9 ? 'happy' : 'idle'" :mouth="mouth" :look="1" class="pointer-events-none" />
    <!-- Удочка -->
    <g class="pointer-events-none" stroke="#7c4a1e" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M96 188 L196 120" /><path d="M196 120 Q204 170 200 228" stroke="#64748b" stroke-width="2.5" />
    </g>

    <!-- Друг и ведёрко -->
    <g transform="translate(366 118) scale(.6)" :class="count ? 'cheer' : ''"><AnimalHead :kind="level.animal" /></g>
    <g :transform="`translate(${BUCKET.x} ${BUCKET.y})`">
      <path d="M-24 -6 H24 L18 24 H-18Z" fill="#94a3b8" stroke="#475569" stroke-width="4" stroke-linejoin="round" />
      <ellipse cy="-6" rx="24" ry="6" fill="#38bdf8" stroke="#475569" stroke-width="3" />
    </g>

    <!-- Рыбки -->
    <g v-for="(f, i) in FISH" :key="i" :transform="`translate(${f.x} ${f.y})`">
      <g :class="caught[i] ? 'jump' : 'swim'" :style="{ '--dx': `${BUCKET.x - f.x}px`, '--dy': `${BUCKET.y - 8 - f.y}px`, animationDelay: caught[i] ? '0s' : `${-i * 0.37}s` }" @click="catchFish(i)">
        <ellipse rx="22" ry="13" :fill="f.color" stroke="#0f172a" stroke-opacity=".35" stroke-width="3" />
        <path d="M20 0 L36 -12 V12Z" :fill="f.color" stroke="#0f172a" stroke-opacity=".35" stroke-width="3" stroke-linejoin="round" />
        <circle cx="-10" cy="-3" r="3.5" fill="#fff" /><circle cx="-11" cy="-3" r="1.6" fill="#1e293b" />
        <circle r="34" fill="transparent" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.swim {
  cursor: pointer;
  animation: swim 2s ease-in-out infinite;
}
@keyframes swim {
  50% {
    transform: translate(8px, -5px);
  }
}
.jump {
  pointer-events: none;
  animation: jump 0.9s ease-in-out forwards;
}
@keyframes jump {
  0% {
    transform: translate(0, 0);
    opacity: 1;
  }
  50% {
    transform: translate(calc(var(--dx) * 0.5), calc(var(--dy) - 90px)) rotate(-20deg);
  }
  90% {
    transform: translate(var(--dx), var(--dy)) rotate(20deg);
    opacity: 1;
  }
  100% {
    transform: translate(var(--dx), var(--dy));
    opacity: 0;
  }
}
.cheer {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: hop 0.8s ease-in-out infinite;
}
@keyframes hop {
  50% {
    translate: 0 -6px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .swim,
  .cheer {
    animation: none;
  }
}
</style>
