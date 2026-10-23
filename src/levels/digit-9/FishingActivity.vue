<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { splash } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 9: «Крокодил ловит девять рыбок».
 * Рыбку перетаскивают в ведёрко друга (или тапают: она сама летит в ведёрко), голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const BUCKET = { x: 50, y: 262 }
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

const svg = ref<SVGSVGElement | null>(null)
/** Рыбка в полёте к ведёрку. */
const flying = ref<number | null>(null)

const drag = useDrag<number>(svg, {
  canGrab: (i) => !caught.value[i] && flying.value === null,
  onDrop: (i, p) => near(p, BUCKET, 85) && start(i),
  onTap: (i) => void start(i),
})

function start(i: number): boolean {
  if (caught.value[i] || flying.value !== null) return false
  flying.value = i
  void catchFish(i)
  return true
}

function fishStyle(i: number): Record<string, string> {
  if (flying.value === i) {
    return { transform: `translate(${BUCKET.x}px, ${BUCKET.y - 6}px) scale(.5)`, transition: 'transform .42s ease-in' }
  }
  return drag.style(i, FISH[i]!)
}

async function catchFish(i: number): Promise<void> {
  await sleep(420)
  if (!alive) return
  const n = count.value + 1
  caught.value[i] = n
  flying.value = null
  mouth.value = 0.4
  setTimeout(() => (mouth.value = 0), 400)
  splash()
  const said = sayNumber(n)
  if (n < 9) return
  await said
  await sleep(700)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Поймай девять рыбок">
    <!-- Берега и пруд -->
    <rect x="-800" y="206" width="2040" height="130" fill="#4ade80" />
    <path d="M92 212 H368 V300 Q368 318 350 318 H110 Q92 318 92 300Z" fill="#38bdf8" stroke="#0284c7" stroke-width="4" />
    <path d="M110 226 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#bae6fd" stroke-width="4" stroke-linecap="round" opacity=".8" />

    <Crocodile x="-14" y="98" width="170" height="124" :mood="count >= 9 ? 'happy' : 'idle'" :mouth="mouth" :look="1" class="pointer-events-none" />
    <!-- Удочка -->
    <g class="pointer-events-none" stroke="#7c4a1e" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M96 188 L196 120" /><path d="M196 120 Q204 170 200 228" stroke="#64748b" stroke-width="2.5" />
    </g>

    <!-- Друг и ведёрко -->
    <AnimalFigure :kind="level.animal" flip :mood="count >= 9 ? 'happy' : 'idle'" x="306" y="112" width="134" height="98" class="pointer-events-none" />
    <circle v-if="count < 9" :cx="BUCKET.x" :cy="BUCKET.y" r="36" fill="#fff" fill-opacity=".2" stroke="#fff" stroke-width="4" stroke-dasharray="8 8" class="target pointer-events-none" />
    <g :transform="`translate(${BUCKET.x} ${BUCKET.y})`" class="pointer-events-none">
      <path d="M-24 -6 H24 L18 24 H-18Z" fill="#94a3b8" stroke="#475569" stroke-width="4" stroke-linejoin="round" />
      <ellipse cy="-6" rx="24" ry="6" fill="#38bdf8" stroke="#475569" stroke-width="3" />
    </g>

    <!-- Рыбки -->
    <template v-for="(f, i) in FISH" :key="i">
    <g v-if="!caught[i]" class="dragger" :style="fishStyle(i)" @pointerdown="drag.start($event, i, f)">
      <g class="swim" :style="{ animationDelay: `${-i * 0.37}s` }">
        <ellipse rx="22" ry="13" :fill="f.color" stroke="#0f172a" stroke-opacity=".35" stroke-width="3" />
        <path d="M20 0 L36 -12 V12Z" :fill="f.color" stroke="#0f172a" stroke-opacity=".35" stroke-width="3" stroke-linejoin="round" />
        <circle cx="-10" cy="-3" r="3.5" fill="#fff" /><circle cx="-11" cy="-3" r="1.6" fill="#1e293b" />
      </g>
      <circle r="34" fill="transparent" />
    </g>
    </template>
  </svg>
</template>

<style scoped>
.dragger {
  transform-box: view-box;
}
.swim {
  animation: swim 2s ease-in-out infinite;
}
@keyframes swim {
  50% {
    transform: translate(8px, -5px);
  }
}
.target {
  animation: blink 0.9s ease-in-out infinite;
}
@keyframes blink {
  50% {
    opacity: 0.35;
  }
}
@media (prefers-reduced-motion: reduce) {
  .swim,
  .target {
    animation: none;
  }
}
</style>
