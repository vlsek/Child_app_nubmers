<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { animalSound, boing } from '@/composables/synth'
import { inRect, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 10: «Крокодил возит десять цыплят на автобусе».
 * Цыплёнка на остановке перетаскивают в автобус (или тапают: он сам запрыгивает в окошко), голос считает.
 * Когда все десять внутри, автобус уезжает.
 */
const props = defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const SPOTS = Array.from({ length: 10 }, (_, i) => ({ x: 24 + (i % 5) * 36, y: i < 5 ? 232 : 268 }))
const WIN = (k: number) => ({ x: 224 + (k % 5) * 29, y: k < 5 ? 132 : 168 })
/** Дверь автобуса: цыплёнок сначала подпрыгивает к ней, потом садится. */
const DOOR = { x: 204, y: 226 }

const boarded = ref<number[]>(SPOTS.map(() => 0))
const count = computed(() => boarded.value.filter(Boolean).length)
const leaving = ref(false)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('bus-intro', 'Посади всех цыплят в автобус!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const svg = ref<SVGSVGElement | null>(null)
/** Цыплёнок в полёте к окошку. */
const flying = ref<number | null>(null)
/** Зона посадки: весь автобус с запасом. */
const BUS = { x: 186, y: 80, w: 250, h: 176 }

const drag = useDrag<number>(svg, {
  canGrab: (i) => !boarded.value[i] && flying.value === null,
  onDrop: (i, p) => inRect(p, BUS) && start(i),
  onTap: (i) => void start(i),
})

function start(i: number): boolean {
  if (boarded.value[i] || flying.value !== null) return false
  flying.value = i
  void board(i)
  return true
}

function chickStyle(i: number): Record<string, string> {
  if (flying.value === i) {
    return { transform: `translate(${DOOR.x}px, ${DOOR.y}px)`, transition: 'transform .42s ease-in-out' }
  }
  return drag.style(i, SPOTS[i]!)
}

async function board(i: number): Promise<void> {
  await sleep(420)
  if (!alive) return
  const n = count.value + 1
  boarded.value[i] = n
  flying.value = null
  boing()
  animalSound(props.level.animal)
  const said = sayNumber(n)
  if (n < 10) return
  await said
  await sleep(500)
  leaving.value = true
  await sleep(1600)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Посади десять цыплят в автобус">
    <rect x="-800" y="290" width="2040" height="40" fill="#64748b" />
    <rect x="-20" y="224" width="200" height="12" fill="#94a3b8" />

    <g :class="{ drive: leaving }">
      <!-- Автобус -->
      <rect x="196" y="92" width="228" height="150" rx="22" :fill="level.color" stroke="#0f172a" stroke-opacity=".35" stroke-width="4" />
      <rect x="206" y="104" width="148" height="88" rx="12" fill="#e0f2fe" />
      <rect x="360" y="104" width="54" height="88" rx="12" fill="#bae6fd" />
      <clipPath id="bus-cab"><rect x="360" y="104" width="54" height="88" rx="12" /></clipPath>
      <rect x="196" y="214" width="228" height="10" :fill="level.shade" />
      <circle cx="248" cy="250" r="22" fill="#1e293b" /><circle cx="248" cy="250" r="9" fill="#cbd5e1" />
      <circle cx="372" cy="250" r="22" fill="#1e293b" /><circle cx="372" cy="250" r="9" fill="#cbd5e1" />
      <g clip-path="url(#bus-cab)"><Crocodile x="342" y="126" width="84" height="62" :mood="count >= 10 ? 'happy' : 'idle'" :mouth="0" :look="1" class="pointer-events-none" /></g>
      <path d="M366 190 q14 -18 40 -4" fill="none" stroke="#0f172a" stroke-width="5" stroke-linecap="round" class="pointer-events-none" />
      <!-- Пассажиры внутри автобуса -->
      <template v-for="(_, i) in SPOTS" :key="i">
        <g v-if="boarded[i]" :transform="`translate(${WIN(boarded[i]! - 1).x - 18} ${WIN(boarded[i]! - 1).y - 14}) scale(.3)`" class="seat"><AnimalFigure :kind="level.animal" :x="-10" :y="0" :width="120" :height="89.5" crop /></g>
      </template>
    </g>

    <!-- Куда сажать: автобус -->
    <rect v-if="count < 10 && !leaving" :x="BUS.x + 4" :y="BUS.y + 4" :width="BUS.w - 8" :height="BUS.h - 8" rx="30" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-width="4" stroke-dasharray="8 8" class="target pointer-events-none" />

    <!-- Цыплята на остановке -->
    <template v-for="(s, i) in SPOTS" :key="'w' + i">
      <g v-if="!boarded[i]" class="dragger" :style="chickStyle(i)" @pointerdown="drag.start($event, i, s)">
        <g :class="flying === i ? 'hop' : 'wait'" :style="{ animationDelay: flying === i ? '0s' : `${-i * 0.2}s` }">
          <g transform="translate(-24 -22) scale(.46)"><AnimalFigure :kind="level.animal" :x="-10" :y="0" :width="120" :height="89.5" crop /></g>
        </g>
        <circle r="26" fill="transparent" />
      </g>
    </template>
  </svg>
</template>

<style scoped>
g {
  transform-box: fill-box;
}
.dragger {
  transform-box: view-box;
}
.wait {
  animation: bob 1.1s ease-in-out infinite;
}
@keyframes bob {
  50% { translate: 0 -5px; }
}
.target {
  animation: blink 0.9s ease-in-out infinite;
}
@keyframes blink {
  50% { opacity: .35; }
}
.seat {
  animation: seat 0.4s cubic-bezier(.3,1.6,.5,1) both;
}
@keyframes seat {
  from { scale: .4; translate: 0 16px; opacity: 0; }
}
.hop {
  animation: hop 0.42s ease-in-out;
}
@keyframes hop {
  50% { translate: 0 -34px; }
}
.drive {
  animation: drive 1.6s ease-in forwards;
}
@keyframes drive {
  to { translate: 460px 0; }
}
@media (prefers-reduced-motion: reduce) {
  .wait, .target, .hop, .seat { animation: none; }
}
</style>
