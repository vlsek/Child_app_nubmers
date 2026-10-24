<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { pop } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 8: «Птичка чистит крокодилу зубки».
 * У крокодила широко открытая пасть, на восьми зубах грязные пятнышки. Птенчика с зубной щёткой перетаскивают
 * к грязному зубу (тап по птенчику: он сам прыгает к первому грязному, тап по пятнышку тоже работает):
 * щётка скребёт, летит пена, зуб блестит, голос считает. Когда все чистые, крокодил жмурится от счастья и улыбается.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

/** Наш настоящий крокодил крупным планом: пасть открыта на максимум (верхняя челюсть -22°, нижняя +12° вокруг шарнира). */
const S = 1.95
const OX = 2
const OY = -30
const HINGE = { x: 72, y: 92 }
const rot = (p: { x: number; y: number }, deg: number): { x: number; y: number } => {
  const r = (deg * Math.PI) / 180
  const dx = p.x - HINGE.x
  const dy = p.y - HINGE.y
  return { x: HINGE.x + dx * Math.cos(r) - dy * Math.sin(r), y: HINGE.y + dx * Math.sin(r) + dy * Math.cos(r) }
}
const TOOTH_X = [108, 132, 156, 180]
/** 8 зубов: 4 верхних (кончики вниз) и 4 нижних (кончики вверх). `c` — центр в рисунке крокодила, `p` — в сцене. */
const TEETH = [
  ...TOOTH_X.map((x) => ({ c: rot({ x: x + 6, y: 99 }, -22), up: true })),
  ...TOOTH_X.map((x) => ({ c: rot({ x, y: 90 }, 12), up: false })),
].map((t) => ({ ...t, x: OX + S * t.c.x, y: OY + S * t.c.y }))
const clean = ref<number[]>(TEETH.map(() => 0))
const count = computed(() => clean.value.filter(Boolean).length)
const happy = computed(() => count.value >= 8)
const birdAt = ref({ x: 270, y: 236 })
const brushing = ref(-1)
const foam = ref<{ id: number; x: number; y: number; dx: number }[]>([])
const bird = computed(() => ({ x: birdAt.value.x, y: birdAt.value.y }))
const svg = ref<SVGSVGElement | null>(null)
let foamId = 0
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('teeth-intro', 'Почисти крокодилу зубки!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

function wash(i: number): boolean {
  if (clean.value[i] || brushing.value >= 0 || count.value >= 8) return false
  brushing.value = i
  birdAt.value = { x: TEETH[i]!.x + 6, y: TEETH[i]!.y + (TEETH[i]!.up ? 52 : -34) }
  void scrub(i)
  return true
}

async function scrub(i: number): Promise<void> {
  const x = TEETH[i]!.x
  const y = TEETH[i]!.y
  for (let k = 0; k < 4; k++) {
    const id = ++foamId
    foam.value.push({ id, x: x + (k % 2 ? 8 : -8), y, dx: (k - 1.5) * 6 })
    setTimeout(() => (foam.value = foam.value.filter((f) => f.id !== id)), 900)
    pop()
    await sleep(140)
    if (!alive) return
  }
  const n = count.value + 1
  clean.value[i] = n
  brushing.value = -1
  const said = sayNumber(n)
  if (n < 8) return
  await said
  await sleep(1500)
  if (alive) emit('complete')
}

/** Ближайший грязный зуб к точке p (в пределах щедрого радиуса) или -1. */
function dirtyNear(p: { x: number; y: number }): number {
  let best = -1
  let bd = Infinity
  TEETH.forEach((t, i) => {
    const d = Math.hypot(p.x - t.x, p.y - t.y)
    if (!clean.value[i] && near(p, { x: t.x, y: t.y }, 56) && d < bd) {
      best = i
      bd = d
    }
  })
  return best
}

const drag = useDrag<number>(svg, {
  canGrab: () => count.value < 8 && brushing.value < 0,
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
    <rect x="-800" y="-1200" width="2040" height="1530" fill="#bae6fd" />

    <!-- Наш крокодил с широко открытой пастью -->
    <Crocodile :x="OX" :y="OY" :width="220 * S" :height="160 * S" :mood="happy ? 'happy' : 'idle'" :mouth="1" :look="1" class="pointer-events-none" />

    <!-- Зубы: грязные пятнышки и блеск (рисуем в координатах крокодила) -->
    <g :transform="`translate(${OX} ${OY}) scale(${S})`" stroke-linejoin="round" stroke-linecap="round">
      <g v-for="(t, i) in TEETH" :key="i" :class="{ dirty: !clean[i] }" @click="wash(i)">
        <template v-if="!clean[i]">
          <ellipse :cx="t.c.x" :cy="t.c.y" rx="6" ry="5.5" fill="#78350f" opacity=".92" />
          <circle :cx="t.c.x - 2" :cy="t.c.y - 2" r="1.8" fill="#a16207" /><circle :cx="t.c.x + 2.5" :cy="t.c.y + 2" r="1.2" fill="#451a03" />
        </template>
        <g v-else :transform="`translate(${t.c.x + 1} ${t.c.y})`" class="spark"><path d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6Z" fill="#fde047" stroke="#ca8a04" stroke-width=".8" /></g>
        <circle :cx="t.c.x" :cy="t.c.y" r="12" fill="transparent" />
      </g>
    </g>

    <!-- Пена -->
    <circle v-for="f in foam" :key="f.id" :cx="f.x" :cy="f.y" r="6" fill="#fff" stroke="#7dd3fc" stroke-width="2" class="bubble pointer-events-none" :style="{ '--dx': f.dx + 'px' }" />

    <!-- Птенчик с зубной щёткой -->
    <g :style="drag.style(0, bird)" @pointerdown="drag.start($event, 0, bird)">
      <g :class="brushing >= 0 ? 'scrub' : 'idle'">
        <path d="M-14 16 l-6 12 M0 18 l0 12 M12 16 l6 12" stroke="#fb923c" stroke-width="3.5" stroke-linecap="round" />
        <ellipse rx="26" ry="23" fill="#fde047" stroke="#ca8a04" stroke-width="3.5" />
        <path d="M-4 -22 q2 -9 8 -10 M4 -22 q6 -8 12 -6" fill="none" stroke="#ca8a04" stroke-width="3" stroke-linecap="round" />
        <ellipse cx="-22" cy="4" rx="9" ry="13" fill="#facc15" stroke="#ca8a04" stroke-width="3" transform="rotate(20 -22 4)" />
        <circle cx="-8" cy="-5" r="6" fill="#fff" stroke="#ca8a04" stroke-width="2" /><circle cx="-7" cy="-4" r="3" fill="#1e293b" /><circle cx="-6" cy="-5.5" r="1.1" fill="#fff" />
        <circle cx="10" cy="-5" r="6" fill="#fff" stroke="#ca8a04" stroke-width="2" /><circle cx="11" cy="-4" r="3" fill="#1e293b" /><circle cx="12" cy="-5.5" r="1.1" fill="#fff" />
        <path d="M-2 4 L2 4 L0 11Z" fill="#fb923c" stroke="#c2410c" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="-14" cy="6" rx="5" ry="3" fill="#fb7185" opacity=".6" /><ellipse cx="20" cy="6" rx="5" ry="3" fill="#fb7185" opacity=".6" />
        <!-- щётка в крыле -->
        <g transform="translate(26 -10) rotate(-35)">
          <rect x="-4" y="-34" width="8" height="46" rx="4" fill="#38bdf8" stroke="#0369a1" stroke-width="2.5" />
          <rect x="-7" y="-46" width="14" height="14" rx="3" fill="#fff" stroke="#0369a1" stroke-width="2.5" />
          <path d="M-4 -44 v10 M0 -44 v10 M4 -44 v10" stroke="#38bdf8" stroke-width="2" />
        </g>
      </g>
      <circle r="42" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.dirty {
  cursor: pointer;
}
.idle {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: hop 1.4s ease-in-out infinite;
}
.scrub {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: scrub 0.14s linear infinite;
}
.spark {
  animation: tw 0.9s ease-in-out infinite;
}
.stink {
  animation: tw 1.2s ease-in-out infinite;
}
.bubble {
  animation: bubble 0.9s ease-out forwards;
}
@keyframes hop {
  50% {
    transform: translateY(-6px);
  }
}
@keyframes scrub {
  25% {
    transform: translateX(-4px) rotate(-4deg);
  }
  75% {
    transform: translateX(4px) rotate(4deg);
  }
}
@keyframes tw {
  50% {
    opacity: 0.2;
  }
}
@keyframes bubble {
  from {
    transform: translate(0, 0) scale(0.5);
    opacity: 1;
  }
  to {
    transform: translate(var(--dx), -26px) scale(1.3);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .idle,
  .scrub,
  .spark,
  .stink,
  .bubble {
    animation: none;
  }
}
</style>
