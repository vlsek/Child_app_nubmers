<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 7: «Крокодил-пожарный тушит семь огоньков».
 * В домике горит семь огоньков, в окошке ждёт обезьянка. Тап по огоньку: струя воды,
 * огонёк гаснет паром, голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const NOZZLE = { x: 150, y: 232 }
const FLAMES = [
  { x: 252, y: 130 },
  { x: 320, y: 130 },
  { x: 388, y: 130 },
  { x: 252, y: 198 },
  { x: 388, y: 198 },
  { x: 320, y: 86 },
  { x: 320, y: 244 },
]

/** out[i] — каким по счёту потушен огонёк i (0 — горит). */
const out = ref<number[]>(FLAMES.map(() => 0))
const count = computed(() => out.value.filter(Boolean).length)
const spraying = ref<number | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('fire-intro', 'Потуши огоньки!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function extinguish(i: number): Promise<void> {
  if (out.value[i]) return
  spraying.value = i
  await sleep(380)
  if (!alive) return
  const n = count.value + 1
  out.value[i] = n
  spraying.value = null
  const said = sayNumber(n)
  if (n < 7) return
  await said
  await sleep(500)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Потуши семь огоньков">
    <rect x="-20" y="262" width="480" height="70" fill="#9ca3af" />
    <rect x="-20" y="258" width="480" height="8" fill="#6b7280" />

    <!-- Домик -->
    <g stroke-linejoin="round" stroke="#7c4a1e" stroke-width="4">
      <path d="M214 100 L320 36 L426 100Z" fill="#b45309" />
      <rect x="222" y="100" width="196" height="162" fill="#fde68a" />
      <g fill="#bae6fd" stroke="#0369a1">
        <rect x="232" y="108" width="40" height="44" rx="4" /><rect x="300" y="108" width="40" height="44" rx="4" /><rect x="368" y="108" width="40" height="44" rx="4" />
        <rect x="232" y="176" width="40" height="44" rx="4" /><rect x="368" y="176" width="40" height="44" rx="4" /><rect x="300" y="176" width="40" height="44" rx="4" />
      </g>
      <rect x="298" y="224" width="44" height="38" rx="4" fill="#b9793a" />
    </g>
    <!-- Обезьянка в окошке -->
    <g transform="translate(305 180) scale(.3)"><AnimalHead :kind="level.animal" /></g>

    <Crocodile x="-14" y="170" width="170" height="124" :mood="count >= 7 ? 'happy' : 'idle'" :mouth="spraying !== null ? 0.35 : 0" :look="1" class="pointer-events-none" />
    <!-- Каска -->
    <path d="M24 196 q22 -26 50 -6 l-4 10 h-44Z" fill="#ef4444" stroke="#991b1b" stroke-width="4" stroke-linejoin="round" class="pointer-events-none" />

    <!-- Струя воды -->
    <path v-if="spraying !== null" class="water" :d="`M${NOZZLE.x} ${NOZZLE.y} Q${(NOZZLE.x + FLAMES[spraying]!.x) / 2} ${Math.min(NOZZLE.y, FLAMES[spraying]!.y) - 50} ${FLAMES[spraying]!.x} ${FLAMES[spraying]!.y + 8}`" fill="none" stroke="#38bdf8" stroke-width="9" stroke-linecap="round" />

    <!-- Огоньки -->
    <g v-for="(f, i) in FLAMES" :key="i" :transform="`translate(${f.x} ${f.y})`">
      <g v-if="!out[i]" class="flame" :style="{ animationDelay: `${-i * 0.17}s` }" @click="extinguish(i)">
        <path d="M0 -26 q22 28 0 46 q-22 -18 0 -46Z" fill="#fb923c" stroke="#ea580c" stroke-width="3" />
        <path d="M0 -6 q9 12 0 22 q-9 -10 0 -22Z" fill="#fef08a" />
        <circle r="34" fill="transparent" />
      </g>
      <g v-else class="steam" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2.5">
        <circle cx="-6" cy="0" r="8" /><circle cx="6" cy="-6" r="10" /><circle cx="0" cy="-16" r="7" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.flame {
  cursor: pointer;
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: flicker 0.55s ease-in-out infinite;
}
@keyframes flicker {
  50% {
    transform: scale(1.12, 0.94) rotate(3deg);
  }
}
.steam {
  animation: steam 1s ease-out forwards;
}
@keyframes steam {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-24px);
  }
}
.water {
  stroke-dasharray: 400;
  animation: spray 0.38s ease-out forwards;
}
@keyframes spray {
  from {
    stroke-dashoffset: 400;
  }
  to {
    stroke-dashoffset: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .flame {
    animation: none;
  }
}
</style>
