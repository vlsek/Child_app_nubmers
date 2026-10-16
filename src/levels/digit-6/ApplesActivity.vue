<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 6: «Собери шесть яблок в корзинку».
 * Крокодил держит корзинку, лягушонок смотрит. Тап по яблоку: оно падает в корзинку, голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const BASKET = { x: 170, y: 244 }
const APPLES = [
  { x: 250, y: 84 },
  { x: 308, y: 62 },
  { x: 366, y: 90 },
  { x: 270, y: 132 },
  { x: 330, y: 128 },
  { x: 390, y: 140 },
]

/** got[i] — каким по счёту собрано яблоко i (0 — висит). */
const got = ref<number[]>(APPLES.map(() => 0))
const count = computed(() => got.value.filter(Boolean).length)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('apples-intro', 'Собери яблочки!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function pick(i: number): Promise<void> {
  if (got.value[i]) return
  const n = count.value + 1
  got.value[i] = n
  const said = sayNumber(n)
  await sleep(500)
  if (!alive) return
  if (n < 6) return
  await said
  await sleep(300)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Собери шесть яблок">
    <rect x="-20" y="262" width="480" height="70" fill="#4ade80" />
    <rect x="-20" y="258" width="480" height="8" fill="#22c55e" />

    <!-- Дерево -->
    <rect x="316" y="150" width="30" height="112" rx="8" fill="#b9793a" stroke="#7c4a1e" stroke-width="4" />
    <g fill="#22c55e" stroke="#15803d" stroke-width="4">
      <circle cx="260" cy="110" r="56" /><circle cx="332" cy="86" r="64" /><circle cx="392" cy="116" r="50" />
    </g>

    <!-- Лягушонок под деревом -->
    <g transform="translate(364 202) scale(.6)" class="idle"><AnimalHead :kind="level.animal" /></g>

    <Crocodile x="-14" y="176" width="170" height="124" :mood="count >= 6 ? 'happy' : 'idle'" :mouth="0" :look="1" class="pointer-events-none" />

    <!-- Корзинка -->
    <g :transform="`translate(${BASKET.x} ${BASKET.y})`">
      <g v-for="k in count" :key="k" :transform="`translate(${-22 + ((k - 1) % 3) * 22} ${-6 - Math.floor((k - 1) / 3) * 14})`">
        <circle r="11" fill="#ef4444" stroke="#7f1d1d" stroke-width="3" />
      </g>
      <path d="M-34 -4 H34 L26 24 H-26Z" fill="#d6a56b" stroke="#7c4a1e" stroke-width="4" stroke-linejoin="round" />
    </g>

    <!-- Яблоки -->
    <g v-for="(a, i) in APPLES" :key="i" :transform="`translate(${a.x} ${a.y})`" @click="pick(i)">
      <g :class="got[i] ? 'fall' : 'apple'" :style="{ '--dx': `${BASKET.x - a.x}px`, '--dy': `${BASKET.y - 8 - a.y}px` }">
        <circle r="15" fill="#ef4444" stroke="#7f1d1d" stroke-width="3.5" />
        <path d="M0 -14 q2 -8 8 -9" fill="none" stroke="#15803d" stroke-width="3" stroke-linecap="round" />
        <ellipse cx="-5" cy="-5" rx="3" ry="5" fill="#fff" opacity=".45" />
        <circle r="30" fill="transparent" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.apple {
  cursor: pointer;
  animation: sway 1.6s ease-in-out infinite;
}
@keyframes sway {
  50% {
    transform: translateY(-3px);
  }
}
.fall {
  pointer-events: none;
  animation: fall 0.5s ease-in forwards;
}
@keyframes fall {
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(var(--dx), var(--dy));
    opacity: 0;
  }
}
.idle {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: hop 1.2s ease-in-out infinite;
}
@keyframes hop {
  50% {
    translate: 0 -5px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .apple,
  .idle {
    animation: none;
  }
}
</style>
