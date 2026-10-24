<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { drop, whoosh } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 2: «Убери с дороги два камня». Крокодил на велосипеде ждёт: на дороге лежат два камня.
 * Камень перетаскивают в тачку у обочины (тап: камень сам закатывается в тачку), голос считает.
 * Когда дорога свободна, крокодил уезжает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const HOMES = [
  { x: 236, y: 266 },
  { x: 296, y: 268 },
]
const BARROW = { x: 372, y: 252 }
/** Где камень лежит в тачке (по порядку). */
const IN_BARROW = [
  { x: 358, y: 240 },
  { x: 386, y: 238 },
]

/** moved[i]: 0 — на дороге, n — в тачке под номером n. */
const moved = ref<number[]>([0, 0])
const count = computed(() => moved.value.filter(Boolean).length)
const riding = ref(false)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('bike-intro', 'Убери камни с дороги!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: (i) => !moved.value[i] && !riding.value,
  onDrop: (i, p) => near(p, BARROW, 78) && put(i),
  onTap: (i) => void put(i),
})

function put(i: number): boolean {
  if (moved.value[i] || count.value >= 2) return false
  const n = count.value + 1
  moved.value[i] = n
  void after(n)
  return true
}

async function after(n: number): Promise<void> {
  await sleep(380)
  if (!alive) return
  drop()
  const said = sayNumber(n)
  if (n < 2) return
  await said
  await sleep(300)
  if (!alive) return
  riding.value = true
  whoosh()
  await sleep(1700)
  if (alive) emit('complete')
}

const rockStyle = (i: number): Record<string, string> =>
  moved.value[i]
    ? { transform: `translate(${IN_BARROW[moved.value[i]! - 1]!.x}px, ${IN_BARROW[moved.value[i]! - 1]!.y}px)`, transition: 'transform .45s cubic-bezier(.3,1.3,.5,1)' }
    : drag.style(i, HOMES[i]!)
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Убери с дороги два камня">
    <!-- Обочина и дорога -->
    <rect x="-800" y="236" width="2040" height="900" fill="#4ade80" />
    <rect x="-800" y="232" width="2040" height="8" fill="#22c55e" />
    <rect x="-800" y="282" width="2040" height="900" fill="#9ca3af" />
    <rect x="-800" y="278" width="2040" height="8" fill="#6b7280" />
    <path d="M0 306 H440" stroke="#fff" stroke-width="4" stroke-dasharray="26 22" />

    <!-- Друг стоит на обочине у тачки -->
    <AnimalFigure :kind="level.animal" flip :mood="riding ? 'happy' : 'idle'" x="346" y="146" width="104" height="76" class="pointer-events-none" />

    <!-- Тачка -->
    <circle v-if="count < 2" :cx="BARROW.x" :cy="BARROW.y" r="52" fill="#fff" fill-opacity=".18" stroke="#fff" stroke-width="4" stroke-dasharray="8 8" class="target pointer-events-none" />
    <g class="pointer-events-none" stroke-linejoin="round" stroke-linecap="round">
      <path d="M338 234 H408 L396 262 H350Z" fill="#f59e0b" stroke="#b45309" stroke-width="4" />
      <path d="M408 236 L436 224 M338 240 L318 252" stroke="#92400e" stroke-width="6" fill="none" />
      <circle cx="372" cy="270" r="11" fill="#1f2937" stroke="#0f172a" stroke-width="3" /><circle cx="372" cy="270" r="4" fill="#cbd5e1" />
    </g>

    <!-- Камни -->
    <g v-for="(h, i) in HOMES" :key="i" :style="rockStyle(i)" @pointerdown="drag.start($event, i, h)">
      <g :class="{ wait: !moved[i] }" :style="{ animationDelay: `${-i * 0.5}s` }">
        <path d="M-24 14 Q-28 -4 -12 -14 Q4 -22 18 -10 Q30 2 24 14 Q0 20 -24 14Z" :fill="i ? '#94a3b8' : '#a8a29e'" stroke="#44403c" stroke-width="4" stroke-linejoin="round" />
        <path d="M-14 -4 Q-6 -12 6 -10" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5" />
        <path d="M6 4 l6 -3 M-8 8 l4 -2" stroke="#57534e" stroke-width="3" stroke-linecap="round" />
      </g>
      <circle v-if="!moved[i]" r="40" fill="transparent" />
    </g>

    <!-- Велосипед с крокодилом -->
    <g transform="translate(20 148)">
      <g :class="{ ride: riding }" stroke-linecap="round" stroke-linejoin="round">
        <g fill="none" stroke="#1f2937" stroke-width="6">
          <circle cx="40" cy="100" r="34" />
          <circle cx="150" cy="100" r="34" />
        </g>
        <g fill="none" stroke="#9ca3af" stroke-width="2"><path d="M40 66 V134 M6 100 H74 M150 66 V134 M116 100 H184" /></g>
        <g fill="none" stroke="#ef4444" stroke-width="7">
          <path d="M40 100 L88 100 L72 52 L134 52 L88 100 M134 52 L150 100" />
          <path d="M134 52 L134 34 L150 30 M60 46 H86" stroke="#1f2937" stroke-width="6" />
        </g>
        <Crocodile x="28" y="-44" width="120" height="88" :mood="riding ? 'happy' : 'idle'" :mouth="riding ? 0.5 : 0" :look="1" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
g {
  transform-box: view-box;
}
.wait {
  transform-box: fill-box;
  animation: wait 1.4s ease-in-out infinite;
}
@keyframes wait {
  50% {
    transform: translateY(-4px);
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
.ride {
  animation: ride 1.7s cubic-bezier(0.5, 0, 0.9, 0.6) forwards;
}
@keyframes ride {
  30% {
    transform: translate(-10px, -4px) rotate(-3deg);
  }
  to {
    transform: translate(520px, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .wait,
  .target,
  .ride {
    animation: none;
  }
}
</style>
