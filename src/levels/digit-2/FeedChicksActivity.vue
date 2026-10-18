<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 2: «Крокодил кормит двух птенцов».
 * Над каждым голодным птенцом ягодка в облачке. Ягоду из корзинки несут птенцу пальцем.
 * Если просто ткнуть в ягоду (или в птенца), она сама летит к голодному птенцу. Голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const BASKET = { x: 176, y: 252 }
const CHICKS = [
  { x: 298, y: 214 },
  { x: 390, y: 214 },
]
/** Две ягоды лежат в корзинке. */
const BERRIES = [
  { x: 160, y: 236 },
  { x: 194, y: 236 },
]

/** fed[i] — каким по счёту накормлен птенец i (0 — голодный). */
const fed = ref<number[]>([0, 0])
/** target[b] — какому птенцу улетела ягода b (-1 — ещё в корзинке). */
const target = ref<number[]>([-1, -1])
const count = computed(() => fed.value.filter(Boolean).length)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('chicks-intro', 'Птенчики голодные! Накорми их!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

/** Ягода b достаётся птенцу c. */
async function feed(b: number, c: number): Promise<boolean> {
  if (b < 0 || c < 0 || fed.value[c] || target.value[b] >= 0 || target.value.includes(c)) return false
  target.value[b] = c
  await sleep(550)
  if (!alive) return true
  const n = count.value + 1
  fed.value[c] = n
  const said = sayNumber(n)
  if (n < 2) return true
  await said
  await sleep(500)
  if (alive) emit('complete')
  return true
}

/** Ближайший голодный птенец, к которому ещё ничего не летит. */
const hungry = (): number => CHICKS.findIndex((_, c) => !fed.value[c] && !target.value.includes(c))

const drag = useDrag<number>(svg, {
  canGrab: (b) => target.value[b]! < 0,
  onDrop: (b, p) => {
    const c = CHICKS.findIndex((k, i) => near(p, { x: k.x, y: k.y - 10 }, 70) && !fed.value[i] && !target.value.includes(i))
    if (c < 0) return false
    void feed(b, c)
    return true
  },
  onTap: (b) => void feed(b, hungry()),
})
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Накорми двух птенцов">
    <rect x="-20" y="276" width="480" height="60" fill="#4ade80" />
    <rect x="-20" y="272" width="480" height="8" fill="#22c55e" />

    <Crocodile x="-12" y="172" width="170" height="124" :mood="count >= 2 ? 'happy' : 'idle'" :mouth="0" :look="1" class="pointer-events-none" />

    <!-- Корзинка с ягодами -->
    <g :transform="`translate(${BASKET.x} ${BASKET.y})`">
      <path d="M-30 -10 H30 L22 20 H-22Z" fill="#d6a56b" stroke="#7c4a1e" stroke-width="4" stroke-linejoin="round" />
    </g>

    <!-- Ягоды: их можно нести к птенцам -->
    <g
      v-for="(h, b) in BERRIES"
      :key="b"
      :style="
        target[b]! >= 0
          ? { transform: `translate(${CHICKS[target[b]!]!.x}px, ${CHICKS[target[b]!]!.y - 12}px) scale(.5)`, opacity: 0, transition: 'transform .5s ease-in, opacity .2s .35s', pointerEvents: 'none' }
          : drag.style(b, h)
      "
      @pointerdown="drag.start($event, b, h)"
    >
      <circle r="15" fill="#dc2626" stroke="#7f1d1d" stroke-width="3" />
      <ellipse cx="-5" cy="-6" rx="4" ry="3" fill="#fff" opacity=".5" />
      <path d="M0 -15 q2 -6 8 -8" stroke="#16a34a" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <circle r="32" fill="transparent" />
    </g>

    <!-- Птенцы -->
    <g v-for="(c, i) in CHICKS" :key="i" :transform="`translate(${c.x} ${c.y})`">
      <ellipse cx="0" cy="48" rx="46" ry="14" fill="#b9793a" stroke="#7c4a1e" stroke-width="4" />
      <circle v-if="!fed[i]" cy="-4" r="44" fill="#fde68a" fill-opacity=".35" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="9 8" class="pointer-events-none" />
      <g :class="fed[i] ? 'happy' : 'hungry'" @click="feed(target.findIndex((t) => t < 0), i)">
        <g transform="translate(-42 -42) scale(.84)"><AnimalFigure kind="chick" :x="-10" :y="0" :width="120" :height="89.5" crop /></g>
        <circle r="54" fill="transparent" />
      </g>
      <!-- Желание: ягодка в облачке; после еды сердечко -->
      <g transform="translate(0 -72)">
        <ellipse rx="22" ry="17" fill="#fff" opacity=".9" stroke="#cbd5e1" stroke-width="3" />
        <circle v-if="!fed[i]" r="9" fill="#dc2626" stroke="#7f1d1d" stroke-width="2.5" />
        <path v-else class="heart" d="M0 8 C-18 -4 -8 -14 0 -6 C8 -14 18 -4 0 8Z" fill="#ec4899" />
      </g>
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
