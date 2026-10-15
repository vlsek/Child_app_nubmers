<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 3: «Крокодил задувает три свечки на торте друга».
 * Тап по свечке: крокодил дует, огонёк гаснет, голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const CANDLES = [
  { x: 252, color: '#38bdf8' },
  { x: 308, color: '#f472b6' },
  { x: 364, color: '#a3e635' },
]
const FLAME_Y = 128
const MOUTH = { x: 178, y: 236 }

/** out[i] — каким по счёту погасла свечка i (0 — горит). */
const out = ref<number[]>([0, 0, 0])
const count = computed(() => out.value.filter(Boolean).length)
const blowing = ref<number | null>(null)
const mouth = ref(0)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('candles-intro', 'Задуй свечки!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function blow(i: number): Promise<void> {
  if (out.value[i] || blowing.value !== null) return
  blowing.value = i
  mouth.value = 0.55
  await sleep(450)
  if (!alive) return
  const n = count.value + 1
  out.value[i] = n
  blowing.value = null
  mouth.value = 0
  const said = sayNumber(n)
  if (n < 3) return
  await said
  await sleep(400)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Задуй три свечки">
    <rect x="-20" y="262" width="480" height="70" fill="#fde68a" />
    <rect x="-20" y="258" width="480" height="8" fill="#fbbf24" />

    <!-- Друг в колпаке -->
    <g transform="translate(330 14) scale(.62)" class="friend">
      <AnimalHead :kind="level.animal" />
      <polygon points="50,-34 24,10 76,10" fill="#f472b6" stroke="#be185d" stroke-width="4" stroke-linejoin="round" />
      <circle cx="50" cy="-36" r="6" fill="#facc15" />
    </g>

    <!-- Торт -->
    <g stroke-linejoin="round">
      <rect x="214" y="212" width="190" height="52" rx="10" fill="#f9a8d4" stroke="#be185d" stroke-width="4" />
      <rect x="226" y="172" width="166" height="44" rx="10" fill="#fde68a" stroke="#b45309" stroke-width="4" />
      <path d="M226 190 q10 14 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" />
      <g v-for="(c, i) in CANDLES" :key="i">
        <rect :x="c.x - 7" y="140" width="14" height="34" rx="3" :fill="c.color" stroke="#0f172a" stroke-opacity=".4" stroke-width="2.5" />
        <path :d="`M${c.x} 140 v-8`" stroke="#334155" stroke-width="3" stroke-linecap="round" />
        <!-- Огонёк / дымок -->
        <g v-if="!out[i]" class="flame" :style="{ animationDelay: `${-i * 0.2}s` }" @click="blow(i)">
          <path :d="`M${c.x} ${FLAME_Y - 14} q14 18 0 30 q-14 -12 0 -30Z`" fill="#fb923c" stroke="#ea580c" stroke-width="2.5" />
          <path :d="`M${c.x} ${FLAME_Y + 2} q6 8 0 14 q-6 -6 0 -14Z`" fill="#fef08a" />
          <circle :cx="c.x" :cy="FLAME_Y + 4" r="34" fill="transparent" />
        </g>
        <path v-else class="smoke" :d="`M${c.x} ${FLAME_Y + 10} q-8 -14 0 -26 t0 -26`" fill="none" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
      </g>
    </g>

    <!-- Ветер: от крокодила к свече -->
    <g v-if="blowing !== null" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round">
      <path v-for="k in 3" :key="k" class="wind" :d="`M${MOUTH.x} ${MOUTH.y + (k - 2) * 8} Q${(MOUTH.x + CANDLES[blowing]!.x) / 2} ${FLAME_Y + 60 + k * 10} ${CANDLES[blowing]!.x - 12} ${FLAME_Y + 6 + (k - 2) * 6}`" />
    </g>

    <!-- Крокодил -->
    <Crocodile x="-8" y="168" width="200" height="146" :mood="count >= 3 ? 'happy' : 'idle'" :mouth="mouth" :look="1" class="pointer-events-none" />
  </svg>
</template>

<style scoped>
.flame {
  cursor: pointer;
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: flicker 0.5s ease-in-out infinite;
}
@keyframes flicker {
  50% {
    transform: scale(1.12, 0.94) rotate(3deg);
  }
}
.smoke {
  animation: smoke 1.2s ease-out forwards;
}
@keyframes smoke {
  from {
    opacity: 0.9;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-14px);
  }
}
.wind {
  stroke-dasharray: 220;
  animation: wind 0.45s ease-out forwards;
}
@keyframes wind {
  from {
    stroke-dashoffset: 220;
  }
  to {
    stroke-dashoffset: 0;
  }
}
.friend {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: cheer 1.2s ease-in-out infinite;
}
@keyframes cheer {
  50% {
    translate: 0 -5px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .flame,
  .friend {
    animation: none;
  }
}
</style>
