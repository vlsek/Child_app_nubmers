<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { pop } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 5: «Пять пальчиков». У друга пять шариков, у крокодила поднята ладошка с пятью пальцами.
 * Каждый шарик несут к свободному пальчику (или тапают три раза, тогда он сам летит): шарик привязан,
 * голос считает. Когда заняты все пять пальцев, шарики подпрыгивают, а крокодил радуется.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()
const { sayNumber, sayLine, stopVoice } = useAudio()

/** Кончики пальцев: большой, указательный, средний, безымянный, мизинец. */
const TIPS = [
  { x: 176, y: 156 },
  { x: 196, y: 98 },
  { x: 224, y: 84 },
  { x: 252, y: 96 },
  { x: 274, y: 126 },
]
const COLORS = ['#ef4444', '#facc15', '#3b82f6', '#22c55e', '#ec4899']
const HOMES = [
  { x: 348, y: 120 },
  { x: 384, y: 108 },
  { x: 418, y: 124 },
  { x: 366, y: 150 },
  { x: 402, y: 156 },
]
const HAND_CENTER = { x: 224, y: 150 }

/** slot[i] — на какой палец привязан шарик i (-1 — у друга). */
const slot = ref<number[]>(HOMES.map(() => -1))
const flying = ref<number | null>(null)
const count = computed(() => slot.value.filter((s) => s >= 0).length)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('fingers-intro', 'Привяжи шарики на пальчики!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

/** Ближайший к точке свободный палец. */
function freeFinger(p: { x: number; y: number }): number {
  let best = -1
  let bd = Infinity
  TIPS.forEach((t, f) => {
    if (slot.value.includes(f)) return
    const d = Math.hypot(p.x - t.x, p.y - (t.y - 40))
    if (d < bd) {
      bd = d
      best = f
    }
  })
  return best
}

const drag = useDrag<number>(svg, {
  canGrab: (i) => slot.value[i]! < 0 && flying.value === null,
  onDrop: (i, p) => {
    if (!near(p, { x: HAND_CENTER.x, y: HAND_CENTER.y - 50 }, 110)) return false
    void attach(i, freeFinger(p))
    return true
  },
  onTap: (i) => void attach(i, freeFinger(HOMES[i]!), true),
})

async function attach(i: number, f: number, fly = false): Promise<void> {
  if (f < 0 || slot.value[i]! >= 0) return
  if (fly) {
    flying.value = i
    await sleep(450)
    if (!alive) return
  }
  slot.value[i] = f
  flying.value = null
  pop()
  const n = count.value
  const said = sayNumber(n)
  if (n < 5) return
  await said
  await sleep(1400)
  if (alive) emit('complete')
}

/** Где шарик: у друга, в полёте или над пальцем (веером, чтобы не слипались). */
function balloonPos(i: number): { x: number; y: number } {
  const f = slot.value[i]!
  if (f >= 0) return { x: TIPS[f]!.x + (f - 2) * 12, y: TIPS[f]!.y - 52 - (f % 2) * 16 }
  if (flying.value === i) {
    const t = TIPS[freeFinger(HOMES[i]!)]!
    return { x: t.x, y: t.y - 52 }
  }
  return HOMES[i]!
}
function balloonStyle(i: number): Record<string, string> {
  if (slot.value[i]! >= 0 || flying.value === i) {
    const p = balloonPos(i)
    return { transform: `translate(${p.x}px, ${p.y}px)`, transition: 'transform .5s cubic-bezier(.3,1.3,.5,1)' }
  }
  return drag.style(i, HOMES[i]!)
}
const all = computed(() => count.value >= 5)
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Привяжи пять шариков на пять пальчиков">
    <rect x="-800" y="-1200" width="2040" height="1462" fill="#bae6fd" />
    <rect x="-800" y="262" width="2040" height="900" fill="#4ade80" />
    <rect x="-800" y="258" width="2040" height="8" fill="#22c55e" />

    <Crocodile x="-30" y="140" width="180" height="132" :mood="all ? 'happy' : 'idle'" :mouth="all ? 0.25 : 0" :look="1" class="pointer-events-none" />

    <!-- Рука крокодила: предплечье и ладошка с пятью пальцами -->
    <g class="pointer-events-none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M118 238 L206 184" stroke="#166534" stroke-width="40" fill="none" />
      <path d="M118 238 L206 184" stroke="#5bbf4a" stroke-width="32" fill="none" />
      <template v-for="(t, f) in TIPS" :key="'o' + f">
        <path :d="`M${HAND_CENTER.x + (f - 2) * 9} ${HAND_CENTER.y + 8} L${t.x} ${t.y + 6}`" stroke="#166534" stroke-width="24" fill="none" />
      </template>
      <ellipse :cx="HAND_CENTER.x" :cy="HAND_CENTER.y + 14" rx="44" ry="34" fill="#166534" />
      <template v-for="(t, f) in TIPS" :key="'f' + f">
        <path :d="`M${HAND_CENTER.x + (f - 2) * 9} ${HAND_CENTER.y + 8} L${t.x} ${t.y + 6}`" stroke="#5bbf4a" stroke-width="17" fill="none" />
      </template>
      <ellipse :cx="HAND_CENTER.x" :cy="HAND_CENTER.y + 14" rx="39" ry="29" fill="#5bbf4a" />
      <ellipse :cx="HAND_CENTER.x + 4" :cy="HAND_CENTER.y + 24" rx="20" ry="12" fill="#bef264" opacity=".7" />
    </g>

    <!-- Подсказка: свободные пальчики мигают -->
    <template v-for="(t, f) in TIPS" :key="'h' + f">
      <circle v-if="!slot.includes(f) && !all" :cx="t.x" :cy="t.y" r="13" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="3" stroke-dasharray="5 5" class="ring pointer-events-none" />
    </template>

    <AnimalFigure :kind="level.animal" flip :mood="all ? 'happy' : 'idle'" x="338" y="192" width="102" height="75" class="pointer-events-none" />

    <!-- Шарики -->
    <g v-for="(c, i) in COLORS" :key="i" :style="balloonStyle(i)" @pointerdown="drag.start($event, i, HOMES[i]!)">
      <path v-if="slot[i]! < 0" :d="`M0 22 L${392 - HOMES[i]!.x} ${204 - HOMES[i]!.y}`" stroke="#475569" stroke-width="2" fill="none" />
      <path v-else :d="`M0 22 L${TIPS[slot[i]!]!.x - balloonPos(i).x} ${TIPS[slot[i]!]!.y - balloonPos(i).y}`" stroke="#475569" stroke-width="2" fill="none" />
      <g :class="all ? 'cheer' : 'sway'" :style="{ animationDelay: `${-i * 0.3}s` }">
        <ellipse rx="19" ry="23" :fill="c" stroke="#0f172a" stroke-opacity=".35" stroke-width="3" />
        <path d="M-9 -10 q-3 6 0 12" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".6" />
        <path d="M-5 24 L5 24 L0 19Z" :fill="c" stroke="#0f172a" stroke-opacity=".35" stroke-width="2" />
      </g>
      <circle v-if="slot[i]! < 0" r="36" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.sway { animation: sway 2.2s ease-in-out infinite; transform-origin: 0 24px; }
.cheer { animation: cheer 0.6s ease-in-out infinite; transform-origin: 0 24px; }
.ring { animation: ring 1.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes sway { 50% { transform: rotate(5deg); } }
@keyframes cheer { 50% { transform: translateY(-8px) rotate(-4deg); } }
@keyframes ring { 50% { opacity: 0.5; transform: scale(1.12); } }
@media (prefers-reduced-motion: reduce) { .sway, .cheer, .ring { animation: none; } }
</style>
