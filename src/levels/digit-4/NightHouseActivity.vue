<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import { useAudio } from '@/composables/useAudio'
import { drop, pop } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/** Цифра 4: «Ночной дом». В тёмном доме четыре окна: лампочки тащат в окна, в каждом загорается свет и жилец машет. */
const props = defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()
const { sayNumber, sayLine, stopVoice } = useAudio()

const WIN = [
  { x: 150, y: 120 },
  { x: 290, y: 120 },
  { x: 150, y: 216 },
  { x: 290, y: 216 },
]
const HOMES = [0, 1, 2, 3].map((i) => ({ x: 70 + i * 100, y: 296 }))
/** lit[i] — окно i горит; bulb[j] — лампочка j уже вкручена. */
const lit = ref<boolean[]>([false, false, false, false])
const used = ref<boolean[]>([false, false, false, false])
const svg = ref<SVGSVGElement | null>(null)
const count = computed(() => lit.value.filter(Boolean).length)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('house-intro', 'Зажги свет в окнах!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: (j) => !used.value[j],
  onDrop: (j, p) => {
    const w = WIN.findIndex((c, k) => !lit.value[k] && near(p, c, 64))
    if (w < 0) return false
    void place(j, w)
    return true
  },
  onTap: (j) => void place(j, lit.value.findIndex((v) => !v)),
})

async function place(j: number, w: number): Promise<void> {
  if (w < 0 || used.value[j] || lit.value[w]) return
  used.value[j] = true
  lit.value[w] = true
  drop()
  pop()
  const n = count.value
  const said = sayNumber(n)
  if (n < 4) return
  await said
  await sleep(1300)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Зажги четыре окна">
    <rect x="-20" y="-20" width="480" height="300" fill="#172554" />
    <circle cx="380" cy="40" r="20" fill="#fef9c3" class="pointer-events-none" /><circle cx="388" cy="34" r="18" fill="#172554" class="pointer-events-none" />
    <g fill="#fef9c3" class="pointer-events-none"><circle cx="40" cy="30" r="2.5" /><circle cx="110" cy="62" r="2" /><circle cx="330" cy="28" r="2.5" /><circle cx="70" cy="110" r="2" /></g>
    <path d="M-20 262 H460 V340 H-20Z" fill="#14532d" />

    <!-- дом -->
    <g class="pointer-events-none">
      <path d="M96 262 V88 H344 V262Z" fill="#b45309" stroke="#451a03" stroke-width="5" stroke-linejoin="round" />
      <path d="M80 92 L220 18 L360 92Z" fill="#991b1b" stroke="#450a0a" stroke-width="5" stroke-linejoin="round" />
      <rect x="198" y="226" width="44" height="36" rx="4" fill="#78350f" stroke="#451a03" stroke-width="3" />
      <g v-for="(w, i) in WIN" :key="i" :transform="`translate(${w.x} ${w.y})`">
        <rect x="-40" y="-34" width="80" height="68" rx="6" :fill="lit[i] ? '#fde047' : '#0f172a'" stroke="#451a03" stroke-width="5" />
        <g v-if="lit[i]">
          <rect x="-40" y="-34" width="80" height="68" rx="6" fill="#fef08a" class="glow" />
          <AnimalFigure :kind="props.level.animal" :x="-34" y="-28" width="68" height="50" mood="happy" />
        </g>
        <path d="M0 -34 V34 M-40 0 H40" stroke="#451a03" stroke-width="4" />
      </g>
    </g>

    <!-- лампочки -->
    <g v-for="(h, j) in HOMES" :key="j">
      <g v-if="!used[j]" :style="drag.style(j, h)" @pointerdown="drag.start($event, j, h)">
        <g class="bob" :style="{ animationDelay: j * 0.2 + 's' }">
          <circle cy="-6" r="17" fill="#fef08a" stroke="#ca8a04" stroke-width="3.5" />
          <rect x="-8" y="8" width="16" height="12" rx="3" fill="#94a3b8" stroke="#475569" stroke-width="2.5" />
          <path d="M-5 -6 q5 -8 10 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" />
        </g>
        <circle cy="0" r="40" fill="transparent" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.glow { animation: glow 2.4s ease-in-out infinite; }
.bob { animation: bob 1.3s ease-in-out infinite; }
@keyframes glow { 50% { opacity: 0.55; } }
@keyframes bob { 50% { transform: translateY(-4px); } }
@media (prefers-reduced-motion: reduce) { .glow, .bob { animation: none; } }
</style>
