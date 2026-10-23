<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { pop, thump, whoosh } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 9: «Пиньята». Палку перетаскивают на подвесную пиньяту (или тапают по ней): удар, пиньята качается,
 * выпадает одна конфета и считается. После девятой пиньята лопается и сыплется конфетти.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const PINATA = { x: 260, y: 112 }
const STICK_HOME = { x: 78, y: 190 }
const COLORS = ['#f43f5e', '#f59e0b', '#22c55e', '#38bdf8', '#a78bfa', '#fb7185', '#facc15', '#34d399', '#f472b6']

const hits = ref(0)
const swing = ref(false)
const burst = ref(false)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Конфеты на земле: аккуратный ряд по мере падения. */
const candies = computed(() =>
  Array.from({ length: hits.value }, (_, i) => ({ x: 130 + i * 34, y: 292, c: COLORS[i]!, i })),
)
const confetti = Array.from({ length: 26 }, (_, i) => ({
  x: 60 + ((i * 97) % 320),
  d: (i % 7) * 0.12,
  c: COLORS[i % COLORS.length]!,
}))

onMounted(() => void sayLine('pinata-intro', 'Ударь пиньяту!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: () => !swing.value && !burst.value,
  onDrop: (_, p) => {
    if (!near(p, PINATA, 78)) return false
    void hit()
    return true
  },
  onTap: () => void hit(),
})

async function hit(): Promise<void> {
  if (swing.value || burst.value || hits.value >= 9) return
  swing.value = true
  whoosh()
  await sleep(160)
  if (!alive) return
  thump(180)
  hits.value++
  const n = hits.value
  pop()
  const said = sayNumber(n)
  await sleep(520)
  swing.value = false
  if (n < 9) return
  burst.value = true
  await said
  await sleep(1400)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Разбей пиньяту: девять конфет">
    <!-- праздничная комната -->
    <rect x="-800" y="-20" width="2040" height="270" fill="#fef3c7" />
    <path d="M-800 250 H1240 V340 H-800Z" fill="#fb923c" /><path d="M-800 250 H1240" stroke="#c2410c" stroke-width="4" />
    <g class="pointer-events-none">
      <path d="M0 14 Q110 50 220 14 T440 14" fill="none" stroke="#0f172a" stroke-opacity=".35" stroke-width="2.5" />
      <path v-for="(f, i) in 8" :key="i" :d="`M${i * 55 + 12} ${i % 2 ? 30 : 24} l11 0 l-5.5 17Z`" :fill="COLORS[i]" />
    </g>

    <!-- верёвка и пиньята -->
    <line :x1="PINATA.x" y1="-10" :x2="PINATA.x" :y2="PINATA.y - 48" stroke="#78350f" stroke-width="4" class="pointer-events-none" />
    <g v-if="!burst" :transform="`translate(${PINATA.x} ${PINATA.y - 48})`" class="pointer-events-none">
      <g :class="swing ? 'swing' : 'idle-sway'">
        <g transform="translate(0 48)">
          <ellipse rx="52" ry="42" fill="#f43f5e" stroke="#9f1239" stroke-width="4" />
          <path d="M-46 -14 q46 24 92 0" fill="none" stroke="#fde047" stroke-width="9" />
          <path d="M-36 14 q36 22 72 0" fill="none" stroke="#38bdf8" stroke-width="9" />
          <path d="M-18 -42 l-4 -14 M0 -44 v-14 M18 -42 l4 -14" stroke="#fde047" stroke-width="6" stroke-linecap="round" />
          <circle cx="-16" cy="-6" r="6" fill="#fff" /><circle cx="16" cy="-6" r="6" fill="#fff" />
          <circle cx="-15" cy="-5" r="3" fill="#0f172a" /><circle cx="17" cy="-5" r="3" fill="#0f172a" />
          <path d="M-12 12 q12 10 24 0" fill="none" stroke="#7f1d1d" stroke-width="3.5" stroke-linecap="round" />
        </g>
      </g>
    </g>

    <!-- конфетти при взрыве -->
    <g v-if="burst" class="pointer-events-none">
      <rect
        v-for="(f, i) in confetti"
        :key="i"
        :x="f.x"
        y="40"
        width="9"
        height="14"
        rx="2"
        :fill="f.c"
        class="fall"
        :style="{ animationDelay: f.d + 's' }"
      />
    </g>

    <!-- конфеты внизу -->
    <g v-for="c in candies" :key="c.i" :transform="`translate(${c.x} ${c.y})`" class="pointer-events-none">
      <g class="drop-in" :style="{ '--fy': `${c.y - PINATA.y}px` }">
        <path d="M-16 0 l-9 -7 v14Z M16 0 l9 -7 v14Z" :fill="c.c" />
        <ellipse rx="15" ry="10" :fill="c.c" stroke="#0f172a" stroke-opacity=".35" stroke-width="2.5" />
        <path d="M-6 -6 q8 4 12 0" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <Crocodile x="-10" y="196" width="130" height="95" :mood="burst ? 'happy' : 'idle'" :look="1" class="pointer-events-none" />

    <!-- палка (тащить на пиньяту) -->
    <g v-if="!burst" :style="drag.style(0, STICK_HOME)" @pointerdown="drag.start($event, 0, STICK_HOME)">
      <g class="stick-bob">
        <rect x="-8" y="-46" width="16" height="92" rx="8" fill="#a16207" stroke="#713f12" stroke-width="3.5" transform="rotate(35)" />
        <path d="M-7 -20 l14 0 M-7 0 l14 0" stroke="#fde047" stroke-width="4" transform="rotate(35)" />
      </g>
      <circle r="46" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.idle-sway {
  transform-box: fill-box;
  transform-origin: 50% 0;
  animation: sway 3s ease-in-out infinite;
}
.swing {
  transform-box: fill-box;
  transform-origin: 50% 0;
  animation: swing 0.6s ease-out;
}
.stick-bob {
  animation: bob 1.6s ease-in-out infinite;
}
.drop-in {
  animation: drop-in 0.55s cubic-bezier(0.5, 0, 1, 0.6);
}
.fall {
  animation: fall 1.6s ease-in forwards;
}
@keyframes sway {
  50% {
    transform: rotate(3deg);
  }
}
@keyframes swing {
  30% {
    transform: rotate(-24deg);
  }
  65% {
    transform: rotate(14deg);
  }
}
@keyframes bob {
  50% {
    transform: translateY(-5px);
  }
}
@keyframes drop-in {
  from {
    transform: translateY(var(--fy));
  }
}
@keyframes fall {
  from {
    transform: translateY(0) rotate(0);
  }
  to {
    transform: translateY(260px) rotate(260deg);
    opacity: 0.2;
  }
}
@media (prefers-reduced-motion: reduce) {
  .idle-sway,
  .swing,
  .stick-bob,
  .drop-in,
  .fall {
    animation: none;
  }
}
</style>
