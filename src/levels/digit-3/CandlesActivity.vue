<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { SCALE, drop, pop, tone } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 3: «Крокодил задувает три свечки на торте друга».
 * Сначала свечки ПЕРЕТАСКИВАЮТ в торт (тап: свечка встаёт сама), потом ТАП по огоньку: крокодил дует, огонёк гаснет, голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const CANDLES = [
  { x: 252, color: '#38bdf8' },
  { x: 308, color: '#f472b6' },
  { x: 364, color: '#a3e635' },
]
const SLOT_Y = 157
const FLAME_Y = 128
const HOMES = [{ x: 56, y: 96 }, { x: 116, y: 96 }, { x: 176, y: 96 }]
const placed = ref<boolean[]>([false, false, false])
const svg = ref<SVGSVGElement | null>(null)

const count = computed(() => taken.value.filter(Boolean).length)
const mouth = ref(0)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('candles-intro', 'Расставь свечки на торте!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: (j) => !placed.value[j],
  onDrop: (j, p) => {
    const k = CANDLES.findIndex((c, idx) => !slotTaken(idx) && near(p, { x: c.x, y: SLOT_Y }, 56))
    if (k < 0) return false
    put(j, k)
    return true
  },
  onTap: (j) => put(j, CANDLES.findIndex((_, idx) => !slotTaken(idx))),
})
/** taken[k] — слот k торта занят какой-то свечкой. */
const taken = ref<boolean[]>([false, false, false])
const slotTaken = (k: number): boolean => !!taken.value[k]
function put(j: number, k: number): void {
  if (k < 0 || placed.value[j] || taken.value[k]) return
  placed.value[j] = true
  taken.value[k] = true
  drop()
  pop()
  void counted(count.value)
}

async function counted(n: number): Promise<void> {
  const said = sayNumber(n)
  if (n < 3) return
  await said
  // Свечки горят: крокодил радуется, звучит мелодия «С днём рождения»
  mouth.value = 0.5
  ;[0, 0, 1, 0, 3, 2].forEach((note, i) => tone(SCALE[note]!, 0.35, 'triangle', 0.25, i * 0.38))
  await sleep(2600)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Расставь три свечки на торте">
    <rect x="-800" y="262" width="2040" height="900" fill="#fde68a" />
    <rect x="-800" y="258" width="2040" height="8" fill="#fbbf24" />

    <!-- Друг в колпаке -->
    <AnimalFigure :kind="level.animal" flip hat="party" :mood="count >= 3 ? 'happy' : 'idle'" x="296" y="2" width="136" height="99" class="pointer-events-none" />

    <!-- Торт -->
    <g stroke-linejoin="round">
      <rect x="214" y="212" width="190" height="52" rx="10" fill="#f9a8d4" stroke="#be185d" stroke-width="4" />
      <rect x="226" y="172" width="166" height="44" rx="10" fill="#fde68a" stroke="#b45309" stroke-width="4" />
      <path d="M226 190 q10 14 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" />
      <g v-for="(c, i) in CANDLES" :key="i">
        <circle v-if="!taken[i]" :cx="c.x" :cy="SLOT_Y" r="9" fill="none" stroke="#be185d" stroke-opacity=".5" stroke-width="3" stroke-dasharray="4 4" />
        <g v-if="taken[i]">
          <rect :x="c.x - 7" y="140" width="14" height="34" rx="3" :fill="c.color" stroke="#0f172a" stroke-opacity=".4" stroke-width="2.5" />
          <path :d="`M${c.x} 140 v-8`" stroke="#334155" stroke-width="3" stroke-linecap="round" />
        </g>
        <!-- Огонёк / дымок -->
        <g v-if="taken[i]" class="flame" :style="{ animationDelay: `${-i * 0.2}s` }">
          <path :d="`M${c.x} ${FLAME_Y - 14} q14 18 0 30 q-14 -12 0 -30Z`" fill="#fb923c" stroke="#ea580c" stroke-width="2.5" />
          <path :d="`M${c.x} ${FLAME_Y + 2} q6 8 0 14 q-6 -6 0 -14Z`" fill="#fef08a" />
        </g>
      </g>
    </g>

    <!-- Свечки на столе: тащить в торт -->
    <g v-for="(h, j) in HOMES" :key="`h${j}`">
      <g v-if="!placed[j]" :style="drag.style(j, h)" @pointerdown="drag.start($event, j, h)">
        <g class="bob" :style="{ animationDelay: `${-j * 0.25}s` }">
          <rect x="-7" y="-17" width="14" height="34" rx="3" :fill="CANDLES[j]!.color" stroke="#0f172a" stroke-opacity=".4" stroke-width="2.5" />
          <path d="M0 -17 v-8" stroke="#334155" stroke-width="3" stroke-linecap="round" />
        </g>
        <circle r="38" fill="transparent" />
      </g>
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
.bob {
  animation: bob 1.3s ease-in-out infinite;
}
@keyframes bob {
  50% {
    transform: translateY(-4px);
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
@media (prefers-reduced-motion: reduce) {
  .flame,
  .bob {
    animation: none;
  }
}
</style>
