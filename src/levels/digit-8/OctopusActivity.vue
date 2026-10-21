<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { drop } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 8: «Носки для осьминога». У осьминога восемь холодных щупалец, а на верёвке сушатся восемь носков.
 * Носок несут к щупальцу (или тапают: он сам летит к свободному), щупальце надевает его, осьминог хихикает.
 * Когда все восемь одеты, осьминог пританцовывает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const N = 8
const LEGS = Array.from({ length: N }, (_, i) => ({ x: 64 + i * 44, y: 266 }))
const COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899']
const HOMES = COLORS.map((_, i) => ({ x: 54 + i * 47, y: 60 }))

/** onLeg[sock] — на какой ноге носок (-1 — на верёвке). */
const onLeg = ref<number[]>(Array.from({ length: N }, () => -1))
const dressed = computed(() => onLeg.value.filter((l) => l >= 0).length)
const order = ref<number[]>(Array.from({ length: N }, () => 0))
const giggle = ref(0)
const flying = ref<number | null>(null)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('octopus-intro', 'Одень осьминогу носочки!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const freeLegs = () => LEGS.map((_, i) => i).filter((i) => !onLeg.value.includes(i))

function legNear(p: { x: number; y: number }): number {
  let best = -1
  let bd = Infinity
  for (const i of freeLegs()) {
    const d = Math.hypot(p.x - LEGS[i]!.x, p.y - (LEGS[i]!.y - 6))
    if (d < bd) {
      bd = d
      best = i
    }
  }
  return bd <= 62 ? best : -1
}

const drag = useDrag<number>(svg, {
  canGrab: (s) => onLeg.value[s]! < 0 && flying.value === null,
  onDrop: (s, p) => {
    const leg = legNear(p)
    if (leg < 0) return false
    void put(s, leg)
    return true
  },
  onTap: (s) => void fly(s),
})

async function fly(s: number): Promise<void> {
  if (flying.value !== null || onLeg.value[s]! >= 0) return
  const leg = freeLegs()[0]
  if (leg === undefined) return
  flying.value = s
  await sleep(450)
  await put(s, leg)
}

async function put(s: number, leg: number): Promise<void> {
  onLeg.value[s] = leg
  flying.value = null
  const n = dressed.value
  order.value[s] = n
  giggle.value++
  drop()
  const said = sayNumber(n)
  if (n < N) return
  await said
  await sleep(1200)
  if (alive) emit('complete')
}

function sockStyle(s: number): Record<string, string> {
  if (flying.value === s) {
    const leg = freeLegs()[0]!
    return { transform: `translate(${LEGS[leg]!.x}px, ${LEGS[leg]!.y - 6}px)`, transition: 'transform .45s ease-in-out' }
  }
  const l = onLeg.value[s]!
  if (l >= 0) return { transform: `translate(${LEGS[l]!.x}px, ${LEGS[l]!.y - 6}px)` }
  return drag.style(s, HOMES[s]!)
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Надень восемь носков осьминогу">
    <!-- Подводный фон -->
    <rect x="-20" y="286" width="480" height="50" fill="#fcd34d" />
    <path d="M-20 286 Q60 274 130 286 T280 286 T440 286 T520 286" fill="#fde68a" />

    <!-- Верёвка с носками -->
    <path d="M10 40 Q220 62 430 40" fill="none" stroke="#7c4a1e" stroke-width="4" stroke-linecap="round" />

    <!-- Осьминог -->
    <g :key="giggle" class="octo" :class="{ dance: dressed >= N }">
      <!-- щупальца -->
      <g fill="none" stroke-linecap="round" stroke="#a855f7">
        <path v-for="(l, i) in LEGS" :key="i" :d="`M${160 + i * 17} 196 C${160 + i * 17} 244 ${l.x} 232 ${l.x} ${l.y - 14}`" stroke-width="17" />
      </g>
      <g fill="none" stroke-linecap="round" stroke="#d8b4fe" opacity=".5">
        <path v-for="(l, i) in LEGS" :key="`h${i}`" :d="`M${160 + i * 17 - 3} 200 C${160 + i * 17 - 3} 242 ${l.x - 3} 232 ${l.x - 3} ${l.y - 20}`" stroke-width="4" />
      </g>
      <!-- голова -->
      <ellipse cx="220" cy="150" rx="92" ry="70" fill="#a855f7" stroke="#6b21a8" stroke-width="5" />
      <ellipse cx="190" cy="108" rx="34" ry="16" fill="#fff" opacity=".28" transform="rotate(-18 190 108)" />
      <g fill="#c084fc" opacity=".8"><circle cx="270" cy="112" r="7" /><circle cx="292" cy="136" r="5" /><circle cx="150" cy="130" r="6" /></g>
      <!-- лицо -->
      <circle cx="188" cy="150" r="19" fill="#fff" stroke="#6b21a8" stroke-width="4" /><circle cx="190" cy="152" r="9" fill="#1e1b4b" /><circle cx="193" cy="148" r="3" fill="#fff" />
      <circle cx="252" cy="150" r="19" fill="#fff" stroke="#6b21a8" stroke-width="4" /><circle cx="254" cy="152" r="9" fill="#1e1b4b" /><circle cx="257" cy="148" r="3" fill="#fff" />
      <ellipse cx="168" cy="176" rx="10" ry="6" fill="#f9a8d4" opacity=".7" /><ellipse cx="272" cy="176" rx="10" ry="6" fill="#f9a8d4" opacity=".7" />
      <path :d="dressed >= N ? 'M200 178 Q220 204 240 178 Q220 190 200 178Z' : 'M202 178 Q220 192 238 178'" :fill="dressed >= N ? '#be185d' : 'none'" stroke="#6b21a8" stroke-width="4" stroke-linecap="round" />
    </g>

    <!-- Носки (с центром в 0,0; верх с манжетой) -->
    <g v-for="(c, s) in COLORS" :key="s" :style="sockStyle(s)" @pointerdown="drag.start($event, s, HOMES[s]!)">
      <!-- прищепка -->
      <rect v-if="onLeg[s]! < 0" x="-4" y="-34" width="8" height="14" rx="2" fill="#f59e0b" stroke="#92400e" stroke-width="2" />
      <path d="M-12 -20 H12 V6 Q12 18 22 18 Q26 30 8 30 H-8 Q-14 30 -14 20Z" :fill="c" stroke="#0f172a" stroke-opacity=".4" stroke-width="3" stroke-linejoin="round" />
      <rect x="-13" y="-22" width="26" height="9" rx="3" fill="#fff" stroke="#0f172a" stroke-opacity=".3" stroke-width="2.5" />
      <path d="M-12 -2 H12 M-12 8 H12" stroke="#fff" stroke-width="3" opacity=".6" />
      <circle r="34" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.octo {
  transform-box: view-box;
  transform-origin: 50% 90%;
  animation: giggle 0.5s ease-out;
}
.dance {
  animation: dance 0.8s ease-in-out infinite;
}
@keyframes giggle {
  25% {
    transform: scale(1.03, 0.97) rotate(-1.5deg);
  }
  60% {
    transform: scale(0.98, 1.03) rotate(1.5deg);
  }
}
@keyframes dance {
  0%,
  100% {
    transform: rotate(-3deg) translateY(0);
  }
  50% {
    transform: rotate(3deg) translateY(-8px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .octo,
  .dance {
    animation: none;
  }
}
</style>
