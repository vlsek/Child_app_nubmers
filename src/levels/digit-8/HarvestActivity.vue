<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { pop } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 8: «Поросёнок на тракторе возит морковки, крокодил помогает».
 * Морковку перетаскивают в прицеп (или тапают: она сама летит в прицеп), голос считает. Когда их восемь, трактор уезжает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const SPOTS = Array.from({ length: 8 }, (_, i) => ({ x: 134 + (i % 4) * 38, y: (i < 4 ? 238 : 282) + 8 }))
/** Куда нести: прицеп трактора. */
const TRAILER = { x: 306, y: 200 }
const loaded = ref<number[]>(SPOTS.map(() => 0))
const count = computed(() => loaded.value.filter(Boolean).length)
const leaving = ref(false)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('harvest-intro', 'Помоги собрать морковку!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const svg = ref<SVGSVGElement | null>(null)
/** Морковка в полёте к прицепу. */
const flying = ref<number | null>(null)
/** Место в прицепе: n-я морковка лежит в ряду, нижний ряд заполняется первым. */
const slot = (n: number) => ({ x: 270 + ((n - 1) % 4) * 21, y: n > 4 ? 188 : 196 })

const drag = useDrag<number>(svg, {
  canGrab: (i) => !loaded.value[i] && flying.value === null,
  onDrop: (i, p) => near(p, TRAILER, 85) && start(i),
  onTap: (i) => void start(i),
})

function start(i: number): boolean {
  if (loaded.value[i] || flying.value !== null) return false
  flying.value = i
  void load(i)
  return true
}

function carrotStyle(i: number): Record<string, string> {
  if (flying.value === i) {
    const t = slot(count.value + 1)
    return { transform: `translate(${t.x}px, ${t.y}px) scale(.5) rotate(-20deg)`, transition: 'transform .42s cubic-bezier(.3,.1,.6,1)' }
  }
  return drag.style(i, SPOTS[i]!)
}

async function load(i: number): Promise<void> {
  await sleep(420)
  if (!alive) return
  const n = count.value + 1
  loaded.value[i] = n
  flying.value = null
  pop()
  const said = sayNumber(n)
  if (n < 8) return
  await said
  await sleep(500)
  leaving.value = true
  await sleep(1700)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Собери восемь морковок">
    <rect x="-800" y="214" width="2040" height="900" fill="#a16207" opacity=".55" />
    <rect x="-800" y="208" width="2040" height="8" fill="#4ade80" />
    <Crocodile x="-6" y="120" width="130" height="95" :mood="count >= 8 ? 'happy' : 'idle'" :mouth="0" :look="1" class="pointer-events-none" />

    <!-- Трактор с прицепом: морковки лежат внутри, торчат только ботвой -->
    <g :class="{ drive: leaving }">
      <!-- прицеп: задняя стенка, морковки, передняя стенка -->
      <rect x="256" y="176" width="100" height="48" rx="5" fill="#78350f" stroke="#451a03" stroke-width="4" />
      <template v-for="(_, i) in SPOTS" :key="i">
        <g v-if="loaded[i]" :transform="`translate(${slot(loaded[i]!).x} ${slot(loaded[i]!).y}) scale(.5) rotate(${loaded[i]! % 2 ? -14 : 12})`">
          <g transform="translate(0 -8)">
            <path d="M-12 -4 L0 34 L12 -4Z" fill="#f97316" stroke="#c2410c" stroke-width="3" stroke-linejoin="round" />
            <path d="M0 -4 l-7 -14 M0 -4 l7 -14 M0 -4 v-16" stroke="#16a34a" stroke-width="4" stroke-linecap="round" />
          </g>
        </g>
      </template>
      <path d="M256 194 H356 V220 Q356 226 350 226 H262 Q256 226 256 220Z" fill="#d97706" stroke="#92400e" stroke-width="4" stroke-linejoin="round" />
      <path d="M262 204 H350 M262 214 H350" stroke="#92400e" stroke-width="2.5" />
      <g v-for="x in [278, 334]" :key="x" :transform="`translate(${x} 230)`"><circle r="14" fill="#1e293b" /><circle r="6" fill="#cbd5e1" /><circle r="2" fill="#475569" /></g>
      <!-- сцепка -->
      <path d="M356 216 H376" stroke="#475569" stroke-width="6" stroke-linecap="round" />
      <!-- трактор: капот, выхлопная труба, кабина с водителем, колёса -->
      <rect x="426" y="164" width="8" height="28" rx="3" fill="#475569" stroke="#1e293b" stroke-width="2.5" />
      <path d="M392 190 H434 Q440 190 440 196 V224 H392Z" fill="#22c55e" stroke="#166534" stroke-width="4" stroke-linejoin="round" />
      <path d="M432 198 V216 M426 198 V216 M420 198 V216" stroke="#166534" stroke-width="3" stroke-linecap="round" />
      <rect x="358" y="162" width="46" height="56" rx="5" fill="#d1fae5" stroke="#166534" stroke-width="4" />
      <AnimalFigure :kind="level.animal" crop x="361" y="170" width="40" height="30" />
      <rect x="354" y="154" width="54" height="9" rx="4" fill="#15803d" stroke="#166534" stroke-width="3" />
      <rect x="358" y="196" width="46" height="24" rx="5" fill="#16a34a" stroke="#166534" stroke-width="4" />
      <g transform="translate(384 224)"><circle r="28" fill="#1e293b" /><circle r="13" fill="#fbbf24" stroke="#92400e" stroke-width="3" /><circle r="4" fill="#92400e" /></g>
      <g transform="translate(428 234)"><circle r="16" fill="#1e293b" /><circle r="7" fill="#cbd5e1" /></g>
    </g>

    <!-- Куда нести: прицеп -->
    <rect v-if="count < 8 && !leaving" x="246" y="150" width="120" height="90" rx="22" fill="#fff" fill-opacity=".2" stroke="#fff" stroke-width="4" stroke-dasharray="8 8" class="target pointer-events-none" />

    <!-- Морковки на грядке -->
    <template v-for="(s, i) in SPOTS" :key="'c' + i">
      <g v-if="!loaded[i]" class="dragger" :style="carrotStyle(i)" @pointerdown="drag.start($event, i, s)">
        <g class="carrot" :style="{ animationDelay: `${-i * 0.25}s` }">
          <g transform="translate(0 -8)">
            <path d="M-12 -4 L0 34 L12 -4Z" fill="#f97316" stroke="#c2410c" stroke-width="3" stroke-linejoin="round" />
            <path d="M0 -4 l-7 -14 M0 -4 l7 -14 M0 -4 v-16" stroke="#16a34a" stroke-width="4" stroke-linecap="round" />
          </g>
        </g>
        <circle r="21" fill="transparent" />
      </g>
    </template>
  </svg>
</template>

<style scoped>
g {
  transform-box: fill-box;
}
.dragger {
  transform-box: view-box;
}
.target {
  animation: blink 0.9s ease-in-out infinite;
}
@keyframes blink {
  50% { opacity: .35; }
}
.carrot {
  animation: sway 1.4s ease-in-out infinite;
}
@keyframes sway {
  50% { translate: 0 -5px; }
}
.seat {
  animation: seat 0.4s cubic-bezier(.3,1.6,.5,1) both;
}
@keyframes seat {
  from { scale: .1; }
}
.drive {
  animation: drive 1.7s ease-in forwards;
}
@keyframes drive {
  to { translate: 300px 0; }
}
@media (prefers-reduced-motion: reduce) {
  .carrot, .target { animation: none; }
}
</style>
