<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { SCALE, useTone } from '@/composables/useTone'
import { ding, fanfare, pop, whoosh } from '@/composables/synth'
import { useDrag, type Pt } from '@/composables/useDrag'
import type { AnimalKind } from '@/types/art'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 10, финал игры: «Праздничный салют». Десять ракет на стойке. Ракету тащат в небо и отпускают: она
 * взрывается (голос считает до десяти). После десятой все десять друзей (девять зверей и крокодил) выходят
 * танцевать под салюты.
 */
const props = defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()
const { tone } = useTone()

const N = 10
const COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#f43f5e']
const HOMES: Pt[] = COLORS.map((_, i) => (i < 5 ? { x: 195 + i * 50, y: 196 } : { x: 220 + (i - 5) * 50, y: 234 }))
const ALL: AnimalKind[] = ['bear', 'bunny', 'cat', 'chick', 'dog', 'frog', 'monkey', 'panda', 'pig', 'tiger']
const DANCERS = computed(() => {
  const kinds = ALL.filter((k) => k !== props.level.animal).slice(0, 9)
  const spots = [
    ...[0, 1, 2, 3, 4].map((i) => ({ x: 10 + i * 84, y: 170, w: 84, h: 61 })),
    { x: 4, y: 212, w: 76, h: 55 }, { x: 68, y: 212, w: 76, h: 55 },
    { x: 300, y: 212, w: 76, h: 55 }, { x: 362, y: 212, w: 76, h: 55 },
  ]
  return kinds.map((kind, i) => ({ kind, ...spots[i]! }))
})

/** order[i] — какой по счёту запущена ракета i (0 — ещё на стойке); flight[i] — куда она улетает. */
const order = ref<number[]>(COLORS.map(() => 0))
const flight = ref<(Pt | null)[]>(COLORS.map(() => null))
const count = computed(() => order.value.filter(Boolean).length)
const bursts = ref<{ id: number; x: number; y: number; c: string }[]>([])
const dance = ref(false)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
let burstId = 0
let timer: ReturnType<typeof setInterval> | null = null
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('finale-intro', 'Запусти салюты в небо!'))
onBeforeUnmount(() => {
  alive = false
  if (timer) clearInterval(timer)
  stopVoice()
})

const sky = (i: number): Pt => ({ x: 50 + ((i * 83) % 340), y: 45 + ((i * 37) % 70) })

function burst(x: number, y: number, c: string): void {
  const id = ++burstId
  bursts.value.push({ id, x: Math.min(410, Math.max(30, x)), y: Math.min(130, Math.max(34, y)), c })
  setTimeout(() => (bursts.value = bursts.value.filter((b) => b.id !== id)), 1400)
}

const drag = useDrag<number>(svg, {
  canGrab: (i) => !order.value[i] && !dance.value,
  onDrop: (i, p) => p.y < 150 && launch(i, p),
  onTap: (i) => void launch(i, sky(i)),
})

function launch(i: number, p: Pt): boolean {
  if (order.value[i]) return false
  void fire(i, p)
  return true
}

async function fire(i: number, p: Pt): Promise<void> {
  const n = count.value + 1
  order.value[i] = n
  flight.value[i] = p
  whoosh()
  await sleep(420)
  if (!alive) return
  burst(p.x, p.y, COLORS[i]!)
  pop()
  ding(n)
  const said = sayNumber(n)
  if (n < N) return
  await said
  await sleep(300)
  if (!alive) return
  dance.value = true
  fanfare()
  let k = 0
  timer = setInterval(() => {
    const j = k++ % N
    burst(40 + ((j * 97) % 360), 40 + ((j * 53) % 80), COLORS[j]!)
    tone(SCALE[j]!, 0.3)
  }, 420)
  await sleep(4600)
  if (alive) emit('complete')
}

function rocketStyle(i: number): Record<string, string> {
  const f = flight.value[i]!
  return { transform: `translate(${f.x}px, ${f.y}px)`, transition: 'transform .45s cubic-bezier(.4,0,.8,.6), opacity .1s .4s', opacity: '0', pointerEvents: 'none' }
}
const RAYS = Array.from({ length: 12 }, (_, k) => (k * Math.PI) / 6)
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Запусти десять салютов, а потом все танцуют">
    <rect x="-800" y="-1200" width="2040" height="1462" fill="#1e1b4b" />
    <g fill="#fde68a" opacity=".75" class="pointer-events-none">
      <circle cx="30" cy="30" r="1.8" /><circle cx="130" cy="70" r="1.5" /><circle cx="240" cy="24" r="1.8" /><circle cx="420" cy="60" r="1.6" /><circle cx="-80" cy="50" r="2" /><circle cx="520" cy="40" r="2" />
    </g>
    <rect x="-800" y="262" width="2040" height="900" fill="#166534" />
    <rect x="-800" y="258" width="2040" height="8" fill="#22c55e" />

    <!-- Взрывы -->
    <g class="pointer-events-none">
      <g v-for="b in bursts" :key="b.id" :transform="`translate(${b.x} ${b.y})`">
        <g class="boom">
          <line v-for="(a, k) in RAYS" :key="k" :x1="Math.cos(a) * 10" :y1="Math.sin(a) * 10" :x2="Math.cos(a) * 36" :y2="Math.sin(a) * 36" :stroke="k % 2 ? '#fff' : b.c" stroke-width="5" stroke-linecap="round" />
          <circle v-for="(a, k) in RAYS" :key="`c${k}`" :cx="Math.cos(a + 0.26) * 46" :cy="Math.sin(a + 0.26) * 46" r="4" :fill="b.c" />
        </g>
      </g>
    </g>

    <!-- Стойка с ракетами -->
    <g v-if="!dance">
      <rect x="168" y="224" width="6" height="38" fill="#7c4a1e" /><rect x="430" y="224" width="6" height="38" fill="#7c4a1e" />
      <rect x="160" y="224" width="284" height="8" rx="3" fill="#b9793a" stroke="#7c4a1e" stroke-width="3" />
      <g v-for="(h, i) in HOMES" :key="i" :style="order[i] ? rocketStyle(i) : drag.style(i, h)" @pointerdown="drag.start($event, i, h)">
        <g :class="{ wob: !order[i] && drag.active.value?.id !== i }" :style="{ animationDelay: `${-i * 0.2}s` }">
          <rect x="-6" y="-10" width="12" height="28" rx="3" :fill="COLORS[i]" stroke="#0f172a" stroke-opacity=".45" stroke-width="3" />
          <path d="M-6 -10 L0 -27 L6 -10Z" fill="#ef4444" stroke="#0f172a" stroke-opacity=".45" stroke-width="3" stroke-linejoin="round" />
          <path d="M-6 12 L-13 22 L-6 18Z M6 12 L13 22 L6 18Z" fill="#fbbf24" stroke="#0f172a" stroke-opacity=".45" stroke-width="2" stroke-linejoin="round" />
          <rect x="-1.5" y="18" width="3" height="10" fill="#7c4a1e" />
        </g>
        <circle r="28" fill="transparent" />
      </g>
    </g>

    <Crocodile v-if="!dance" x="-14" y="176" width="170" height="124" :mood="count > 0 ? 'happy' : 'idle'" :mouth="0" :look="1" class="pointer-events-none" />

    <!-- Танец: девять зверей и крокодил = десять друзей -->
    <g v-else class="pointer-events-none">
      <g v-for="(d, i) in DANCERS" :key="i" class="dance" :class="{ alt: i % 2 }" :style="{ animationDelay: `${-i * 0.11}s` }">
        <AnimalFigure :kind="d.kind" mood="happy" :variant="i" :x="d.x" :y="d.y" :width="d.w" :height="d.h" />
      </g>
      <g class="dance" style="animation-delay: -0.3s">
        <Crocodile x="140" y="196" width="160" height="117" mood="happy" :mouth="0.6" :look="0" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.boom {
  animation: boom 1.2s ease-out forwards;
}
@keyframes boom {
  0% {
    transform: scale(0.2);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: scale(1.15);
    opacity: 0;
  }
}
.wob {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: wob 1.8s ease-in-out infinite;
}
@keyframes wob {
  50% {
    transform: rotate(6deg);
  }
}
.dance {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: dance 0.55s ease-in-out infinite;
}
@keyframes dance {
  0%,
  100% {
    transform: translateY(0) rotate(-5deg);
  }
  50% {
    transform: translateY(-9px) rotate(5deg);
  }
}
.alt {
  animation-direction: reverse;
}
@media (prefers-reduced-motion: reduce) {
  .boom,
  .wob,
  .dance {
    animation: none;
  }
}
</style>
