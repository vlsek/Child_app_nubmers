<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { chomp, pop } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 4: «Убери из арбуза четыре косточки».
 * Косточку можно перетащить в ведро или просто тапнуть — тогда она сама долетит.
 * Каждая косточка в ведре — голосом «один, два, три, четыре».
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const BIN = { x: 372, y: 236 }
const HOMES = [
  { x: 150, y: 150 },
  { x: 232, y: 166 },
  { x: 116, y: 206 },
  { x: 196, y: 222 },
]

/** gone[i]: 0 — косточка на арбузе, n — в ведре под номером n. */
const gone = ref<number[]>(HOMES.map(() => 0))
const removed = computed(() => gone.value.filter(Boolean).length)
const lid = ref(false)
const eating = ref(false)
const bite = ref(0)

const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('seeds-intro', 'Убери косточки из арбуза!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

/** Перетащили косточку в ведро или просто тапнули: тогда она долетает сама. */
const drag = useDrag<number>(svg, {
  canGrab: (i) => !gone.value[i],
  onDrop: (i, p) => near(p, BIN, 80) && drop(i),
  onTap: (i) => void drop(i),
})

function drop(i: number): boolean {
  if (gone.value[i] || removed.value >= 4) return false
  const n = removed.value + 1
  gone.value[i] = n
  lid.value = true
  setTimeout(() => (lid.value = false), 350)
  void finish(n)
  return true
}

async function finish(n: number): Promise<void> {
  pop()
  const said = sayNumber(n)
  if (n < 4) return
  await said
  await sleep(400)
  if (!alive) return
  // Крокодил съедает арбуз: ломтик летит в пасть, пасть жуёт
  eating.value = true
  bite.value = 0.9
  for (let k = 0; k < 4; k++) {
    await sleep(380)
    if (!alive) return
    chomp()
    bite.value = k % 2 ? 0.9 : 0.15
  }
  bite.value = 0.2
  await sleep(500)
  if (alive) emit('complete')
}
</script>

<template>
  <svg
    ref="svg"
    viewBox="0 0 440 320"
    class="mx-auto h-full max-h-[34rem] w-full touch-none"
    role="img"
    aria-label="Убери из арбуза четыре косточки в ведро"
  >
    <!-- Ломтик арбуза (в конце летит в пасть крокодила) -->
    <g :class="{ eat: eating }" class="slice">
    <path d="M52 110 A138 138 0 0 0 328 110Z" fill="#16a34a" stroke="#14532d" stroke-width="5" stroke-linejoin="round" />
    <path d="M64 110 A126 126 0 0 0 316 110Z" fill="#dcfce7" />
    <path d="M72 110 A118 118 0 0 0 308 110Z" fill="#ef4444" />
    <path d="M52 110 H328" stroke="#14532d" stroke-width="5" stroke-linecap="round" />
    </g>

    <!-- Друг держит ведро -->
    <AnimalFigure :kind="level.animal" flip :mood="removed >= 4 ? 'happy' : 'idle'" x="306" y="116" width="134" height="98" class="pointer-events-none" />

    <!-- Ведро: большая мигающая зона, куда нести косточки -->
    <circle v-if="removed < 4" :cx="BIN.x" :cy="BIN.y + 22" r="52" fill="#fff" fill-opacity=".25" stroke="#fff" stroke-width="4" stroke-dasharray="8 8" class="target pointer-events-none" />

    <!-- Ведро -->
    <g :style="{ transform: `translate(${BIN.x}px, ${BIN.y + 20}px)`, transformOrigin: '0 0' }">
      <g :class="{ lid }">
        <path d="M-38 -10 L-30 56 H30 L38 -10Z" fill="#94a3b8" stroke="#475569" stroke-width="4" stroke-linejoin="round" />
        <path d="M-14 4 V46 M0 4 V46 M14 4 V46" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
      </g>
    </g>
    <g :style="{ transform: `translate(${BIN.x}px, ${BIN.y + 10}px) rotate(${lid ? -14 : 0}deg)`, transformOrigin: '0 0', transition: 'transform .15s' }">
      <rect x="-44" y="-8" width="88" height="12" rx="6" fill="#64748b" stroke="#475569" stroke-width="4" />
    </g>

    <!-- Косточки -->
    <g
      v-for="(_, i) in HOMES"
      :key="i"
      class="seed"
      :class="{ 'seed--gone': gone[i] }"
      :style="gone[i] ? { transform: `translate(${BIN.x}px, ${BIN.y - 8}px)`, transition: 'transform .35s ease-out, opacity .3s .25s' } : drag.style(i, HOMES[i]!)"
      @pointerdown="drag.start($event, i, HOMES[i]!)"
    >
      <ellipse rx="9" ry="14" transform="rotate(25)" fill="#1f2937" stroke="#0f172a" stroke-width="2" />
      <ellipse cx="-3" cy="-4" rx="2" ry="4" transform="rotate(25)" fill="#fff" opacity=".4" />
      <circle r="34" fill="transparent" />
    </g>

    <!-- Крокодил ждёт арбуз -->
    <Crocodile x="-12" y="196" width="150" height="110" :mood="removed >= 4 ? 'happy' : 'idle'" :mouth="eating ? bite : removed >= 4 ? 0.5 : 0" :look="1" class="pointer-events-none" />
  </svg>
</template>

<style scoped>
.slice {
  transform-box: view-box;
  transform-origin: 190px 110px;
}
.eat {
  animation: eat 1.5s ease-in forwards;
}
@keyframes eat {
  60% {
    transform: translate(-100px, 120px) scale(0.5) rotate(-20deg);
    opacity: 1;
  }
  100% {
    transform: translate(-110px, 150px) scale(0.05) rotate(-30deg);
    opacity: 0;
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
.seed {
  transform-box: view-box;
  animation: wobble 1.6s ease-in-out infinite;
}
.seed--gone {
  opacity: 0;
  pointer-events: none;
  animation: none;
}
@keyframes wobble {
  50% {
    translate: 0 -3px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .seed,
  .target {
    animation: none;
  }
}
</style>
