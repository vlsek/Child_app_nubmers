<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { SCALE, useTone } from '@/composables/useTone'
import { fanfare } from '@/composables/synth'
import { useDrag, type Pt } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 9: «Созвездие». На тёмном небе светятся девять точек. Звёздочки тащат на точки, между ними
 * протягиваются лучики (голос считает). Когда созвездие готово, оно вспыхивает и пролетает падающая звезда.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()
const { tone } = useTone()

const N = 9
const SLOTS: Pt[] = [80, 50, 86, 40, 76, 52, 90, 44, 70].map((y, k) => ({ x: 40 + k * 45, y }))
const HOMES: Pt[] = [
  { x: 200, y: 128 }, { x: 250, y: 128 }, { x: 300, y: 128 }, { x: 350, y: 128 }, { x: 400, y: 128 },
  { x: 225, y: 168 }, { x: 275, y: 168 }, { x: 325, y: 168 }, { x: 375, y: 168 },
]
const STAR = Array.from({ length: 10 }, (_, k) => {
  const a = -Math.PI / 2 + (k * Math.PI) / 5
  const r = k % 2 ? 7.5 : 18
  return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`
}).join(' ')

/** slotOf[i] — в какой точке стоит звезда i (-1: ещё не поставлена); order[i] — какой по счёту. */
const slotOf = ref<number[]>(HOMES.map(() => -1))
const order = ref<number[]>(HOMES.map(() => 0))
const filled = ref<boolean[]>(SLOTS.map(() => false))
const count = computed(() => order.value.filter(Boolean).length)
const done = ref(false)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const links = computed(() => SLOTS.slice(0, -1).map((s, k) => ({ a: s, b: SLOTS[k + 1]!, on: filled.value[k]! && filled.value[k + 1]! })))

onMounted(() => void sayLine('stars-intro', 'Собери созвездие!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

function nearestFree(p: Pt): { k: number; d: number } {
  let k = -1
  let d = Infinity
  SLOTS.forEach((s, j) => {
    if (filled.value[j]) return
    const dd = Math.hypot(p.x - s.x, p.y - s.y)
    if (dd < d) {
      d = dd
      k = j
    }
  })
  return { k, d }
}

const drag = useDrag<number>(svg, {
  canGrab: (i) => slotOf.value[i]! < 0,
  onDrop: (i, p) => {
    const { k, d } = nearestFree(p)
    if (k < 0 || d > 80) return false
    void place(i, k)
    return true
  },
  onTap: (i) => void place(i, filled.value.indexOf(false)),
})

async function place(i: number, k: number): Promise<void> {
  if (k < 0 || slotOf.value[i]! >= 0 || filled.value[k]) return
  const n = count.value + 1
  slotOf.value[i] = k
  filled.value[k] = true
  order.value[i] = n
  tone(SCALE[Math.min(n - 1, 9)]!, 0.5)
  const said = sayNumber(n)
  if (n < N) return
  await said
  done.value = true
  fanfare()
  await sleep(2200)
  if (alive) emit('complete')
}

function starStyle(i: number): Record<string, string> {
  const k = slotOf.value[i]!
  return { transform: `translate(${SLOTS[k]!.x}px, ${SLOTS[k]!.y}px)`, transition: 'transform .45s cubic-bezier(.3,1.5,.5,1)', pointerEvents: 'none' }
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Собери созвездие из девяти звёзд">
    <rect x="-800" y="-1200" width="2040" height="1462" fill="#1e1b4b" />
    <g fill="#fde68a" opacity=".7" class="pointer-events-none">
      <circle cx="20" cy="30" r="1.8" /><circle cx="140" cy="20" r="1.5" /><circle cx="250" cy="22" r="1.8" /><circle cx="430" cy="24" r="1.6" />
      <circle cx="30" cy="110" r="1.5" /><circle cx="160" cy="100" r="1.5" /><circle cx="420" cy="104" r="1.8" /><circle cx="-60" cy="60" r="2" /><circle cx="-200" cy="90" r="1.8" /><circle cx="520" cy="70" r="2" />
    </g>
    <path d="M-800 262 Q-300 214 120 246 T520 238 T1240 250 V262 Z" fill="#15803d" />
    <rect x="-800" y="262" width="2040" height="900" fill="#166534" />
    <rect x="-800" y="258" width="2040" height="8" fill="#22c55e" />

    <!-- Лучики между звёздами -->
    <g class="pointer-events-none" stroke-linecap="round">
      <line v-for="(l, j) in links" :key="`g${j}`" :x1="l.a.x" :y1="l.a.y" :x2="l.b.x" :y2="l.b.y" stroke="#fff" stroke-opacity=".18" stroke-width="2" stroke-dasharray="4 6" />
      <line v-for="(l, j) in links" :key="`l${j}`" :x1="l.a.x" :y1="l.a.y" :x2="l.b.x" :y2="l.b.y" stroke="#fde047" :stroke-width="done ? 4.5 : 3" :opacity="l.on ? 0.95 : 0" style="transition: opacity 0.4s" />
    </g>
    <!-- Точки-места -->
    <g class="pointer-events-none">
      <g v-for="(s, k) in SLOTS" :key="`s${k}`" :transform="`translate(${s.x} ${s.y})`">
        <circle r="14" fill="none" stroke="#fde68a" stroke-width="2.5" stroke-dasharray="4 4" :opacity="filled[k] ? 0 : 0.9" class="slot" />
        <circle r="3.5" fill="#fde68a" :opacity="filled[k] ? 0 : 0.9" />
      </g>
    </g>

    <!-- Падающая звезда в конце -->
    <g v-if="done" class="pointer-events-none">
      <g class="shoot">
        <line x1="-60" y1="-24" x2="0" y2="0" stroke="#fef9c3" stroke-width="4" stroke-linecap="round" opacity=".8" />
        <polygon :points="STAR" fill="#fde047" stroke="#ca8a04" stroke-width="2.5" stroke-linejoin="round" />
      </g>
    </g>

    <!-- Друзья смотрят в небо -->
    <AnimalFigure :kind="level.animal" flip :mood="done ? 'happy' : 'idle'" x="330" y="196" width="96" height="70" class="pointer-events-none" />
    <Crocodile x="-14" y="176" width="170" height="124" :mood="done ? 'happy' : 'idle'" :mouth="done ? 0.5 : 0" :look="1" class="pointer-events-none" />

    <!-- Звёздочки -->
    <g v-for="(h, i) in HOMES" :key="`st${i}`" :style="slotOf[i]! >= 0 ? starStyle(i) : drag.style(i, h)" @pointerdown="drag.start($event, i, h)">
      <g :class="{ twinkle: slotOf[i]! >= 0 || drag.active.value?.id !== i }" :style="{ animationDelay: `${-i * 0.35}s` }">
        <polygon :points="STAR" fill="#fde047" stroke="#ca8a04" stroke-width="3" stroke-linejoin="round" />
        <circle cx="-3" cy="-3" r="3" fill="#fff" opacity=".7" />
      </g>
      <circle r="28" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.twinkle {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: twinkle 1.8s ease-in-out infinite;
}
@keyframes twinkle {
  50% {
    scale: 1.12;
    opacity: 0.85;
  }
}
.slot {
  animation: pulse 1.4s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: 50% 50%;
}
@keyframes pulse {
  50% {
    scale: 1.18;
  }
}
.shoot {
  animation: shoot 1.6s ease-in forwards;
}
@keyframes shoot {
  from {
    transform: translate(-60px, -40px);
    opacity: 1;
  }
  to {
    transform: translate(520px, 150px);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .twinkle,
  .slot,
  .shoot {
    animation: none;
  }
}
</style>
