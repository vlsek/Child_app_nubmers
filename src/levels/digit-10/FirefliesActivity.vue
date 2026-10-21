<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { drop } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 10: «Светлячки в банке». Тёмный вечерний луг, десять светлячков плавают в воздухе.
 * Светлячка берут и несут в банку (тап: он сам летит), банка светится всё ярче, голос считает.
 * Когда все десять в банке, она сияет как фонарик.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const N = 10
const JAR = { x: 300, y: 214 }
const HOMES = [
  { x: 60, y: 80 }, { x: 140, y: 60 }, { x: 210, y: 110 }, { x: 90, y: 150 }, { x: 170, y: 170 },
  { x: 250, y: 60 }, { x: 330, y: 100 }, { x: 390, y: 70 }, { x: 380, y: 140 }, { x: 40, y: 200 },
]
/** Места светлячков внутри банки (относительно центра банки). */
const SPOTS = [
  [-14, 22], [14, 18], [0, 6], [-18, -6], [18, -8], [-6, -22], [8, -26], [-20, 36], [20, 34], [0, 30],
]

/** inJar[i] — каким по счёту светлячок i сел в банку (0 — летает). */
const inJar = ref<number[]>(Array.from({ length: N }, () => 0))
const count = computed(() => inJar.value.filter(Boolean).length)
const flying = ref<number | null>(null)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('fireflies-intro', 'Поймай светлячков в банку!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: (i) => !inJar.value[i] && flying.value === null,
  onDrop: (i, p) => {
    if (!near(p, JAR, 70)) return false
    void catchIt(i)
    return true
  },
  onTap: (i) => void fly(i),
})

async function fly(i: number): Promise<void> {
  if (inJar.value[i] || flying.value !== null) return
  flying.value = i
  await sleep(420)
  await catchIt(i)
}

async function catchIt(i: number): Promise<void> {
  if (inJar.value[i]) return
  const n = count.value + 1
  inJar.value[i] = n
  flying.value = null
  drop()
  const said = sayNumber(n)
  if (n < N) return
  await said
  await sleep(1300)
  if (alive) emit('complete')
}

function flyStyle(i: number): Record<string, string> {
  if (flying.value === i) return { transform: `translate(${JAR.x}px, ${JAR.y}px)`, transition: 'transform .4s ease-in' }
  return drag.style(i, HOMES[i]!)
}

const glow = computed(() => 0.15 + count.value * 0.085)
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Поймай десять светлячков в банку">
    <defs>
      <linearGradient id="ff-night" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1e1b4b" /><stop offset="1" stop-color="#312e81" />
      </linearGradient>
      <radialGradient id="ff-glow"><stop offset="0" stop-color="#fef08a" stop-opacity=".95" /><stop offset="1" stop-color="#fef08a" stop-opacity="0" /></radialGradient>
      <clipPath id="ff-frame"><rect x="8" y="8" width="424" height="304" rx="30" /></clipPath>
    </defs>
    <g clip-path="url(#ff-frame)">
      <rect x="0" y="0" width="440" height="320" fill="url(#ff-night)" />
      <!-- звёзды и луна -->
      <g fill="#fff"><circle cx="40" cy="40" r="2" class="tw" /><circle cx="120" cy="30" r="1.6" class="tw d2" /><circle cx="200" cy="50" r="2" class="tw d3" /><circle cx="330" cy="34" r="1.8" class="tw" /><circle cx="400" cy="90" r="2" class="tw d2" /><circle cx="260" cy="26" r="1.5" class="tw d3" /></g>
      <circle cx="372" cy="52" r="24" fill="#fef9c3" /><circle cx="382" cy="46" r="21" fill="#312e81" />
      <!-- луг -->
      <path d="M0 262 Q80 240 160 258 T330 252 T440 258 V330 H0Z" fill="#14532d" />
      <path d="M0 280 Q100 262 200 278 T440 274 V330 H0Z" fill="#166534" />
      <g stroke="#14532d" stroke-width="4" stroke-linecap="round" fill="none"><path d="M30 290 v-18 M36 290 v-12 M240 292 v-16 M246 292 v-10 M410 288 v-14" /></g>
    </g>
    <rect x="8" y="8" width="424" height="304" rx="30" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" />

    <Crocodile x="12" y="194" width="140" height="102" :mood="count >= N ? 'happy' : 'idle'" :mouth="0" :look="1" class="pointer-events-none" />

    <!-- Банка -->
    <g :transform="`translate(${JAR.x} ${JAR.y})`">
      <circle r="80" fill="url(#ff-glow)" :opacity="glow" class="pointer-events-none" />
      <path d="M-34 -48 H34 V-40 Q50 -28 50 -6 V46 Q50 62 34 62 H-34 Q-50 62 -50 46 V-6 Q-50 -28 -34 -40Z" fill="#bfdbfe" fill-opacity=".28" stroke="#e0f2fe" stroke-width="4" stroke-linejoin="round" />
      <rect x="-38" y="-62" width="76" height="16" rx="5" fill="#f59e0b" stroke="#92400e" stroke-width="3.5" />
      <path d="M-40 -30 q-4 40 0 70" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round" />
      <!-- пойманные светлячки -->
      <g v-for="(n, i) in inJar" :key="i">
        <g v-if="n" :transform="`translate(${SPOTS[n - 1]![0]} ${SPOTS[n - 1]![1]})`" class="pointer-events-none">
          <circle r="11" fill="url(#ff-glow)" /><circle r="3.4" fill="#fde047" />
        </g>
      </g>
    </g>

    <!-- Светлячки (с центром в 0,0): снаружи перетаскивание, внутри лёгкое парение -->
    <template v-for="(h, i) in HOMES" :key="i">
      <g v-if="!inJar[i]" :style="flyStyle(i)" @pointerdown="drag.start($event, i, h)">
        <g class="bob" :style="{ animationDelay: `${-i * 0.45}s`, animationDuration: `${2.6 + (i % 3) * 0.5}s` }">
          <circle r="26" fill="url(#ff-glow)" opacity=".8" />
          <ellipse cx="-9" cy="-7" rx="9" ry="5" fill="#e0f2fe" fill-opacity=".85" transform="rotate(-25 -9 -7)" />
          <ellipse cx="9" cy="-7" rx="9" ry="5" fill="#e0f2fe" fill-opacity=".85" transform="rotate(25 9 -7)" />
          <ellipse rx="6" ry="9" fill="#451a03" stroke="#1c0a00" stroke-width="2" />
          <ellipse cy="5" rx="5" ry="5.5" fill="#fde047" />
          <circle cx="-2" cy="-5" r="1.4" fill="#fff" /><circle cx="2.4" cy="-5" r="1.4" fill="#fff" />
        </g>
        <circle r="34" fill="transparent" />
      </g>
    </template>
  </svg>
</template>

<style scoped>
.bob {
  animation: bob 3s ease-in-out infinite;
}
@keyframes bob {
  0%,
  100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(7px, -8px);
  }
  50% {
    transform: translate(-4px, -3px);
  }
  75% {
    transform: translate(-8px, 6px);
  }
}
.tw {
  animation: tw 2.4s ease-in-out infinite;
}
.d2 {
  animation-delay: -0.8s;
}
.d3 {
  animation-delay: -1.6s;
}
@keyframes tw {
  50% {
    opacity: 0.25;
  }
}
@media (prefers-reduced-motion: reduce) {
  .bob,
  .tw {
    animation: none;
  }
}
</style>
