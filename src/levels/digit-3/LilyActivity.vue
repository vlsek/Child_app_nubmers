<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { boing, splash } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 3: «Прыжки по кувшинкам». Крокодил сидит на берегу, на пруду три кувшинки, на другом берегу ждёт друг.
 * Крокодила перетаскивают на следующую кувшинку (или тапают по кувшинке: он сам прыгает): бульк,
 * круги по воде, голос считает. С третьей кувшинки он прыгает к другу.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const SHORE = { x: 48, y: 236 }
const PADS = [
  { x: 130, y: 248 },
  { x: 220, y: 262 },
  { x: 308, y: 248 },
]
const FRIEND_SPOT = { x: 392, y: 236 }

/** pos: -1 берег, 0..2 кувшинка, 3 — у друга. */
const pos = ref(-1)
const rings = ref<{ id: number; x: number; y: number }[]>([])
const airborne = ref(false)
const svg = ref<SVGSVGElement | null>(null)
let ringId = 0
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const target = computed(() => (pos.value < 2 ? PADS[pos.value + 1]! : FRIEND_SPOT))
const crocAt = computed(() => (pos.value < 0 ? SHORE : pos.value <= 2 ? PADS[pos.value]! : FRIEND_SPOT))
const done = computed(() => pos.value >= 3)

onMounted(() => void sayLine('lily-intro', 'Прыгай по кувшинкам!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: () => !airborne.value && !done.value,
  onDrop: (_, p) => {
    if (!near(p, { x: target.value.x, y: target.value.y - 20 }, 80)) return false
    void hop()
    return true
  },
  onTap: () => void hop(),
})

async function hop(): Promise<void> {
  if (airborne.value || done.value) return
  airborne.value = true
  boing()
  await sleep(480)
  if (!alive) return
  const n = pos.value + 2
  pos.value++
  airborne.value = false
  if (pos.value <= 2) {
    splash()
    const id = ++ringId
    const pad = PADS[pos.value]!
    rings.value.push({ id, x: pad.x, y: pad.y + 6 })
    setTimeout(() => (rings.value = rings.value.filter((r) => r.id !== id)), 1400)
  }
  const said = sayNumber(Math.min(n - 1, 3))
  if (!done.value) return
  await said
  await sleep(900)
  if (alive) emit('complete')
}

const crocStyle = computed(() => drag.style(0, { x: crocAt.value.x, y: crocAt.value.y }))
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Перепрыгни три кувшинки">
    <!-- пруд и берега -->
    <path d="M-800 214 H1240 V340 H-800Z" fill="#38bdf8" />
    <path d="M-800 214 H-20 Q60 206 120 216 T260 214 T400 216 T460 214 H1240 V226 H-800Z" fill="#7dd3fc" />
    <g fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"><path d="M60 290 q14 -8 28 0 M300 296 q14 -8 28 0 M170 300 q12 -7 24 0" /></g>
    <path d="M-800 204 H88 Q100 232 70 262 H-800Z" fill="#4ade80" stroke="#15803d" stroke-width="4" stroke-linejoin="round" />
    <path d="M352 204 H1240 V262 H380 Q336 250 352 204Z" fill="#4ade80" stroke="#15803d" stroke-width="4" stroke-linejoin="round" />

    <!-- круги по воде -->
    <ellipse v-for="r in rings" :key="r.id" :cx="r.x" :cy="r.y" rx="30" ry="9" fill="none" stroke="#fff" stroke-width="3.5" class="ring pointer-events-none" />

    <!-- кувшинки -->
    <g v-for="(p, i) in PADS" :key="i" :transform="`translate(${p.x} ${p.y})`" class="pointer-events-none">
      <ellipse rx="34" ry="11" fill="#15803d" /><ellipse cy="-3" rx="34" ry="11" fill="#22c55e" stroke="#166534" stroke-width="3.5" />
      <path d="M0 -3 L34 -8" stroke="#38bdf8" stroke-width="5" />
      <g v-if="i === 1" transform="translate(-8 -6)"><circle r="6" fill="#f9a8d4" stroke="#be185d" stroke-width="2" /><circle r="2.5" fill="#fde047" /></g>
    </g>

    <!-- друг ждёт на берегу -->
    <AnimalFigure :kind="level.animal" flip :mood="done ? 'happy' : 'idle'" x="342" y="150" width="96" height="70" class="pointer-events-none" />

    <!-- Крокодил (с центром в точке посадки): прыгает дугой -->
    <g :style="crocStyle" @pointerdown="drag.start($event, 0, { x: crocAt.x, y: crocAt.y })">
      <g :class="{ jump: airborne }">
        <Crocodile x="-50" y="-84" width="100" height="73" :mood="done ? 'happy' : 'idle'" :mouth="airborne ? 0.5 : 0" :look="1" class="pointer-events-none" />
      </g>
      <circle cy="-40" r="46" fill="transparent" />
    </g>

    <!-- номера на кувшинках -->
    <g v-for="(p, i) in PADS" :key="`n${i}`" class="pointer-events-none">
      <g v-if="pos >= i" :transform="`translate(${p.x + 24} ${p.y - 30})`">
        <circle r="12" fill="#fff" stroke="#0f172a" stroke-opacity=".4" stroke-width="2.5" />
        <text y="1" text-anchor="middle" dominant-baseline="central" font-size="16" font-weight="900" fill="#0f172a" font-family="Nunito, 'Trebuchet MS', sans-serif">{{ i + 1 }}</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.ring {
  transform-box: fill-box;
  transform-origin: center;
  animation: ring 1.3s ease-out forwards;
}
@keyframes ring {
  from {
    transform: scale(0.4);
    opacity: 1;
  }
  to {
    transform: scale(1.7);
    opacity: 0;
  }
}
.jump {
  animation: jump 0.48s ease-in-out;
}
@keyframes jump {
  50% {
    transform: translateY(-34px) rotate(-8deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ring,
  .jump {
    animation: none;
  }
}
</style>
