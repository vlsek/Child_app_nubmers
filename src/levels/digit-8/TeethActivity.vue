<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 8: «Птичка чистит крокодилу зубки».
 * У крокодила широко открытая пасть, на восьми зубах грязные пятнышки.
 * Птичку перетаскивают к грязному зубу (или тапают: она сама прыгает к ближайшему грязному, либо тап по самому пятнышку),
 * зуб блестит, голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const TEETH = Array.from({ length: 8 }, (_, i) => ({ x: 78 + i * 40 }))
const clean = ref<number[]>(TEETH.map(() => 0))
const count = computed(() => clean.value.filter(Boolean).length)
const birdX = ref(220)
const bird = computed(() => ({ x: birdX.value, y: 232 }))
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('teeth-intro', 'Почисти крокодилу зубки!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

function wash(i: number): boolean {
  if (clean.value[i] || count.value >= 8) return false
  const n = count.value + 1
  clean.value[i] = n
  birdX.value = TEETH[i]!.x
  void finish(n)
  return true
}

async function finish(n: number): Promise<void> {
  const said = sayNumber(n)
  if (n < 8) return
  await said
  await sleep(900)
  if (alive) emit('complete')
}

/** Ближайший грязный зуб к точке p (в пределах щедрого радиуса) или -1. */
function dirtyNear(p: { x: number; y: number }): number {
  let best = -1
  let bd = Infinity
  TEETH.forEach((t, i) => {
    const d = Math.hypot(p.x - t.x, p.y - 172)
    if (!clean.value[i] && near(p, { x: t.x, y: 172 }, 58) && d < bd) {
      best = i
      bd = d
    }
  })
  return best
}

/** Птичку несут к зубу; тап по птичке: она сама прыгает к первому грязному зубу. */
const drag = useDrag<number>(svg, {
  canGrab: () => count.value < 8,
  onDrop: (_, p) => {
    const i = dirtyNear(p)
    return i >= 0 && wash(i)
  },
  onTap: () => {
    const i = clean.value.findIndex((c) => !c)
    if (i >= 0) wash(i)
  },
})
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Почисти восемь зубов крокодилу">
    <!-- Нижняя челюсть и язык -->
    <path d="M30 190 Q30 290 220 290 Q410 290 410 190Z" fill="#4ade80" stroke="#15803d" stroke-width="5" stroke-linejoin="round" />
    <path d="M60 196 Q70 262 220 262 Q370 262 380 196Z" fill="#f87171" />
    <!-- Верхняя челюсть -->
    <path d="M20 120 Q20 40 220 40 Q420 40 420 120 L420 150 Q420 160 400 160 H40 Q20 160 20 150Z" fill="#4ade80" stroke="#15803d" stroke-width="5" stroke-linejoin="round" />
    <circle cx="110" cy="64" r="18" fill="#fff" stroke="#15803d" stroke-width="4" /><circle cx="114" cy="66" r="8" fill="#1e293b" />
    <circle cx="330" cy="64" r="18" fill="#fff" stroke="#15803d" stroke-width="4" /><circle cx="326" cy="66" r="8" fill="#1e293b" />

    <!-- Зубы -->
    <g v-for="(t, i) in TEETH" :key="i" @click="wash(i)" :class="{ dirty: !clean[i] }">
      <path :d="`M${t.x - 17} 158 L${t.x} 206 L${t.x + 17} 158Z`" fill="#fff" stroke="#94a3b8" stroke-width="3" stroke-linejoin="round" />
      <template v-if="!clean[i]">
        <circle :cx="t.x" cy="176" r="11" fill="#78350f" opacity=".85" /><circle :cx="t.x - 5" cy="172" r="4" fill="#a16207" />
      </template>
      <template v-else>
        <path :d="`M${t.x} 170 v-8 M${t.x - 4} 166 h8`" stroke="#facc15" stroke-width="3" stroke-linecap="round" class="spark" />
      </template>
      <rect :x="t.x - 22" y="150" width="44" height="64" fill="transparent" />
    </g>

    <!-- Птичка -->
    <g :style="drag.style(0, bird)" class="bird" @pointerdown="drag.start($event, 0, bird)">
      <ellipse rx="22" ry="16" fill="#38bdf8" stroke="#0369a1" stroke-width="3" />
      <path d="M-22 0 L-38 -8 L-34 6Z" fill="#0ea5e9" />
      <circle cx="10" cy="-6" r="3.5" fill="#fff" /><circle cx="11" cy="-6" r="1.6" fill="#1e293b" />
      <path d="M20 -2 L36 -18 L24 -8Z" fill="#fb923c" stroke="#c2410c" stroke-width="2" stroke-linejoin="round" />
      <circle r="36" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
g {
  transform-box: view-box;
}
.dirty {
  cursor: pointer;
}
.spark {
  animation: tw 0.8s ease-in-out infinite;
}
@keyframes tw {
  50% { opacity: .2; }
}
.bird {
  transform-box: view-box;
}
@media (prefers-reduced-motion: reduce) {
  .spark { animation: none; }
}
</style>
