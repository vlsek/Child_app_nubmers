<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 2: «Крокодил кормит двух птенцов».
 * Над каждым голодным птенцом ягодка в облачке. Тап по птенцу: ягода летит ему, голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const BASKET = { x: 176, y: 252 }
const CHICKS = [
  { x: 298, y: 214 },
  { x: 390, y: 214 },
]

/** fed[i] — каким по счёту накормлен птенец i (0 — голодный). */
const fed = ref<number[]>([0, 0])
const flying = ref<number[]>([])
const count = computed(() => fed.value.filter(Boolean).length)
const mouth = ref(0)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('chicks-intro', 'Птенчики голодные! Накорми их!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function feed(i: number): Promise<void> {
  if (fed.value[i] || flying.value.includes(i)) return
  flying.value.push(i)
  mouth.value = 0.4
  await sleep(550)
  if (!alive) return
  mouth.value = 0
  const n = count.value + 1
  fed.value[i] = n
  const said = sayNumber(n)
  if (n < 2) return
  await said
  await sleep(500)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Накорми двух птенцов">
    <rect x="-20" y="276" width="480" height="60" fill="#4ade80" />
    <rect x="-20" y="272" width="480" height="8" fill="#22c55e" />

    <Crocodile x="-12" y="172" width="170" height="124" :mood="count >= 2 ? 'happy' : 'idle'" :mouth="mouth" :look="1" class="pointer-events-none" />

    <!-- Корзинка с ягодами -->
    <g :transform="`translate(${BASKET.x} ${BASKET.y})`">
      <circle v-for="(dx, k) in [-12, 12]" v-show="k >= flying.length" :key="k" :cx="dx" cy="-10" r="10" fill="#dc2626" stroke="#7f1d1d" stroke-width="3" />
      <path d="M-30 -10 H30 L22 20 H-22Z" fill="#d6a56b" stroke="#7c4a1e" stroke-width="4" stroke-linejoin="round" />
    </g>

    <!-- Птенцы -->
    <g v-for="(c, i) in CHICKS" :key="i" :transform="`translate(${c.x} ${c.y})`">
      <ellipse cx="0" cy="48" rx="46" ry="14" fill="#b9793a" stroke="#7c4a1e" stroke-width="4" />
      <g :class="fed[i] ? 'happy' : 'hungry'" @click="feed(i)">
        <g transform="translate(-42 -42) scale(.84)"><AnimalHead kind="chick" /></g>
        <circle r="54" fill="transparent" />
      </g>
      <!-- Желание: ягодка в облачке; после еды сердечко -->
      <g transform="translate(0 -72)">
        <ellipse rx="22" ry="17" fill="#fff" opacity=".9" stroke="#cbd5e1" stroke-width="3" />
        <circle v-if="!fed[i]" r="9" fill="#dc2626" stroke="#7f1d1d" stroke-width="2.5" />
        <path v-else class="heart" d="M0 8 C-18 -4 -8 -14 0 -6 C8 -14 18 -4 0 8Z" fill="#ec4899" />
      </g>
      <!-- Летящая ягода -->
      <circle v-if="flying.includes(i)" r="10" fill="#dc2626" stroke="#7f1d1d" stroke-width="3" class="berry" :style="{ '--dx': `${BASKET.x - c.x}px`, '--dy': `${BASKET.y - 10 - c.y}px` }" />
    </g>
  </svg>
</template>

<style scoped>
.hungry {
  cursor: pointer;
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: bounce 0.8s ease-in-out infinite;
}
@keyframes bounce {
  50% {
    transform: translateY(-8px);
  }
}
.happy {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: hop 0.4s ease-in-out 3;
}
@keyframes hop {
  50% {
    transform: translateY(-14px) scale(1.06);
  }
}
.berry {
  animation: fly 0.55s ease-in forwards;
}
@keyframes fly {
  from {
    transform: translate(var(--dx), var(--dy));
  }
  to {
    transform: translate(0, -12px) scale(.6);
    opacity: 0;
  }
}
.heart {
  animation: pop 0.35s ease-out;
}
@keyframes pop {
  from {
    transform: scale(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .hungry {
    animation: none;
  }
}
</style>
