<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { drop } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 6: «Собери шесть яблок в корзинку».
 * Крокодил держит корзинку, лягушонок смотрит. Яблоко перетаскивают в корзинку (или тапают: тогда оно само летит), голос считает.
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
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('apples-intro', 'Собери яблочки!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: (i) => !got.value[i],
  onDrop: (i, p) => near(p, BASKET, 85) && pick(i),
  onTap: (i) => void pick(i),
})

function pick(i: number): boolean {
  if (got.value[i]) return false
  void collect(i)
  return true
}

async function collect(i: number): Promise<void> {
  const n = count.value + 1
  got.value[i] = n
  drop()
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
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Собери шесть яблок">
    <rect x="-800" y="262" width="2040" height="70" fill="#4ade80" />
    <rect x="-800" y="258" width="2040" height="8" fill="#22c55e" />

    <!-- Дерево -->
    <rect x="316" y="150" width="30" height="112" rx="8" fill="#b9793a" stroke="#7c4a1e" stroke-width="4" />
    <g fill="#22c55e" stroke="#15803d" stroke-width="4">
      <circle cx="260" cy="110" r="56" /><circle cx="332" cy="86" r="64" /><circle cx="392" cy="116" r="50" />
    </g>

    <!-- Лягушонок под деревом -->
    <g class="idle"><AnimalFigure :kind="level.animal" flip x="340" y="190" width="96" height="70" /></g>

    <Crocodile x="-14" y="176" width="170" height="124" :mood="count >= 6 ? 'happy' : 'idle'" :mouth="0" :look="1" class="pointer-events-none" />

    <!-- Корзинка -->
    <g :transform="`translate(${BASKET.x} ${BASKET.y})`">
      <g v-for="k in count" :key="k" :transform="`translate(${-22 + ((k - 1) % 3) * 22} ${-6 - Math.floor((k - 1) / 3) * 14})`">
        <circle r="11" fill="#ef4444" stroke="#7f1d1d" stroke-width="3" />
      </g>
      <path d="M-34 -4 H34 L26 24 H-26Z" fill="#d6a56b" stroke="#7c4a1e" stroke-width="4" stroke-linejoin="round" />
    </g>

    <!-- Корзинка: большая зона цели -->
    <ellipse :cx="BASKET.x" :cy="BASKET.y" rx="62" ry="40" fill="#fde68a" fill-opacity=".45" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8 6" class="pointer-events-none" />

    <!-- Яблоки -->
    <g
      v-for="(a, i) in APPLES"
      :key="i"
      :style="
        got[i]
          ? { transform: `translate(${BASKET.x}px, ${BASKET.y - 8}px) scale(.5)`, opacity: 0, transition: 'transform .5s ease-in, opacity .2s .35s', pointerEvents: 'none' }
          : drag.style(i, a)
      "
      @pointerdown="drag.start($event, i, a)"
    >
      <g :class="{ apple: !got[i] && drag.active.value?.id !== i }" :style="{ animationDelay: `${-i * 0.3}s` }">
        <circle r="15" fill="#ef4444" stroke="#7f1d1d" stroke-width="3.5" />
        <path d="M0 -14 q2 -8 8 -9" fill="none" stroke="#15803d" stroke-width="3" stroke-linecap="round" />
        <ellipse cx="-5" cy="-5" rx="3" ry="5" fill="#fff" opacity=".45" />
      </g>
      <circle r="30" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.apple {
  animation: sway 1.6s ease-in-out infinite;
}
@keyframes sway {
  50% {
    transform: translateY(-3px);
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
