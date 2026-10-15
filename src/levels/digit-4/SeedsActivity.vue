<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
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

interface Seed {
  x: number
  y: number
  /** 0 — на арбузе, n — в ведре под номером n. */
  gone: number
  dragging: boolean
}
const seeds = ref<Seed[]>(HOMES.map((h) => ({ ...h, gone: 0, dragging: false })))
const removed = computed(() => seeds.value.filter((s) => s.gone).length)
const lid = ref(false)

const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('seeds-intro', 'Убери косточки из арбуза!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

function toSvg(e: PointerEvent): { x: number; y: number } {
  const m = svg.value?.getScreenCTM()
  if (!m) return { x: 0, y: 0 }
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
  return { x: p.x, y: p.y }
}

let grab: { i: number; dx: number; dy: number; sx: number; sy: number; moved: number } | null = null

function down(i: number, e: PointerEvent): void {
  const s = seeds.value[i]!
  if (s.gone) return
  const p = toSvg(e)
  grab = { i, dx: s.x - p.x, dy: s.y - p.y, sx: p.x, sy: p.y, moved: 0 }
  s.dragging = true
  ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
}

function move(e: PointerEvent): void {
  if (!grab) return
  const p = toSvg(e)
  const s = seeds.value[grab.i]!
  grab.moved = Math.max(grab.moved, Math.hypot(p.x - grab.sx, p.y - grab.sy))
  s.x = p.x + grab.dx
  s.y = p.y + grab.dy
}

async function up(): Promise<void> {
  if (!grab) return
  const { i, moved } = grab
  grab = null
  const s = seeds.value[i]!
  s.dragging = false
  const near = Math.hypot(s.x - BIN.x, s.y - BIN.y) < 60
  if (near || moved < 8) await drop(i)
  else {
    s.x = HOMES[i]!.x
    s.y = HOMES[i]!.y
  }
}

async function drop(i: number): Promise<void> {
  const s = seeds.value[i]!
  if (s.gone) return
  s.x = BIN.x
  s.y = BIN.y - 8
  s.gone = removed.value + 1
  const n = s.gone
  lid.value = true
  setTimeout(() => (lid.value = false), 350)
  const said = sayNumber(n)
  if (n < 4) return
  await said
  await sleep(300)
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
    @pointermove="move"
    @pointerup="up"
    @pointercancel="up"
  >
    <!-- Ломтик арбуза -->
    <path d="M52 110 A138 138 0 0 0 328 110Z" fill="#16a34a" stroke="#14532d" stroke-width="5" stroke-linejoin="round" />
    <path d="M64 110 A126 126 0 0 0 316 110Z" fill="#dcfce7" />
    <path d="M72 110 A118 118 0 0 0 308 110Z" fill="#ef4444" />
    <path d="M52 110 H328" stroke="#14532d" stroke-width="5" stroke-linecap="round" />

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
      v-for="(s, i) in seeds"
      :key="i"
      class="seed"
      :class="{ 'seed--gone': s.gone }"
      :style="{ transform: `translate(${s.x}px, ${s.y}px)`, transition: s.dragging ? 'none' : 'transform .35s ease-out, opacity .3s .25s' }"
      @pointerdown="down(i, $event)"
    >
      <ellipse rx="9" ry="14" transform="rotate(25)" fill="#1f2937" stroke="#0f172a" stroke-width="2" />
      <ellipse cx="-3" cy="-4" rx="2" ry="4" transform="rotate(25)" fill="#fff" opacity=".4" />
      <circle r="34" fill="transparent" />
    </g>

    <!-- Крокодил ждёт арбуз -->
    <Crocodile x="-12" y="196" width="150" height="110" :mood="removed >= 4 ? 'happy' : 'idle'" :mouth="removed >= 4 ? 0.4 : 0" :look="1" class="pointer-events-none" />
  </svg>
</template>

<style scoped>
.seed {
  cursor: grab;
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
  .seed {
    animation: none;
  }
}
</style>
