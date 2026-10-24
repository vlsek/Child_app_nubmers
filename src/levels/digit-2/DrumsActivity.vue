<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { drop, thump } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 2: «Два барабана». Две пары палочек лежат на полу. Каждую пару перетаскивают на барабан
 * (тап: пара сама летит на свободный барабан), и барабан начинает играть: палочки стучат, летят нотки,
 * а когда играют оба, получается ритм и крокодил с другом пляшут.
 */
const props = defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()
const { sayNumber, sayLine, stopVoice } = useAudio()

const DRUMS = [
  { x: 135, c: '#f43f5e', f: 120, d: '#be123c' },
  { x: 305, c: '#38bdf8', f: 175, d: '#0369a1' },
]
const HOMES = [
  { x: 196, y: 286 },
  { x: 250, y: 286 },
]
const DRUM_Y = 214
/** onDrum[j]: на каком барабане играет пара j (-1 — лежит на полу). */
const onDrum = ref<number[]>([-1, -1])
const hit = ref<number[]>([0, 0])
const notes = ref<{ id: number; x: number; c: string }[]>([])
const dance = ref(false)
const svg = ref<SVGSVGElement | null>(null)
let noteId = 0
let alive = true
const timers: number[] = []
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('drums-intro', 'Побарабань!'))
onBeforeUnmount(() => {
  alive = false
  timers.forEach((t) => clearInterval(t))
  stopVoice()
})

const freeDrum = (): number => DRUMS.findIndex((_, d) => !onDrum.value.includes(d))

const drag = useDrag<number>(svg, {
  canGrab: (j) => onDrum.value[j]! < 0,
  onDrop: (j, p) => {
    const d = DRUMS.findIndex((dr, k) => !onDrum.value.includes(k) && near(p, { x: dr.x, y: DRUM_Y - 20 }, 80))
    if (d < 0) return false
    void seat(j, d)
    return true
  },
  onTap: (j) => void seat(j, freeDrum()),
})

function beat(d: number): void {
  thump(DRUMS[d]!.f)
  hit.value[d]!++
  const id = ++noteId
  notes.value.push({ id, x: DRUMS[d]!.x + (id % 2 ? -22 : 22), c: DRUMS[d]!.c })
  setTimeout(() => (notes.value = notes.value.filter((n) => n.id !== id)), 1000)
}

async function seat(j: number, d: number): Promise<void> {
  if (d < 0 || onDrum.value[j]! >= 0 || onDrum.value.includes(d)) return
  onDrum.value[j] = d
  drop()
  beat(d)
  timers.push(window.setInterval(() => beat(d), 520))
  const n = onDrum.value.filter((v) => v >= 0).length
  const said = sayNumber(n)
  if (n < 2) return
  await said
  dance.value = true
  await sleep(3600)
  if (alive) emit('complete')
}
void props
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Два барабана">
    <rect x="-800" y="-1200" width="2040" height="1450" fill="#fde68a" />
    <path d="M-800 90 H1240" stroke="#f59e0b" stroke-opacity=".5" stroke-width="2" />
    <path d="M-800 250 H1240 V1200 H-800Z" fill="#92400e" /><path d="M-800 250 H1240" stroke="#451a03" stroke-width="4" />
    <g class="pointer-events-none">
      <path d="M0 14 Q110 44 220 14 T440 14" fill="none" stroke="#0f172a" stroke-opacity=".3" stroke-width="2.5" />
      <path v-for="i in 8" :key="i" :d="`M${(i - 1) * 55 + 12} ${i % 2 ? 24 : 20} l11 0 l-5.5 17Z`" :fill="['#f43f5e', '#38bdf8', '#4ade80', '#fde047'][i % 4]" />
    </g>

    <g :class="{ dance }" class="pointer-events-none"><Crocodile x="-4" y="150" width="110" height="80" :mood="dance ? 'happy' : 'idle'" :look="1" /></g>
    <g :class="{ dance }" class="pointer-events-none"><AnimalFigure :kind="props.level.animal" flip :mood="dance ? 'happy' : 'idle'" x="340" y="150" width="100" height="73" /></g>

    <!-- Барабаны -->
    <g v-for="(d, i) in DRUMS" :key="i" :transform="`translate(${d.x} ${DRUM_Y})`" class="pointer-events-none">
      <g :key="hit[i]" :class="{ boom: hit[i] }">
        <ellipse cy="30" rx="64" ry="14" fill="#000" opacity=".18" />
        <path d="M-58 -8 V22 Q0 44 58 22 V-8Z" :fill="d.c" stroke="#0f172a" stroke-opacity=".5" stroke-width="4" stroke-linejoin="round" />
        <path d="M-40 -2 L-24 34 L-8 -2 L8 38 L24 -2 L40 34" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="4" />
        <ellipse cy="-8" rx="58" ry="16" fill="#fef3c7" stroke="#0f172a" stroke-opacity=".5" stroke-width="4" />
      </g>
      <circle v-if="onDrum.includes(i)" cy="-8" r="62" fill="none" stroke="#fff" stroke-width="4" class="wave" :key="'w' + hit[i]" />
      <g v-else class="hint"><path d="M0 -62 V-30 M-10 -42 L0 -30 L10 -42" fill="none" stroke="#0f172a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" /></g>
    </g>

    <!-- Нотки -->
    <text v-for="n in notes" :key="n.id" :x="n.x" y="190" font-size="30" font-weight="900" :fill="n.c" stroke="#fff" stroke-width="1.5" class="note pointer-events-none">♪</text>

    <!-- Палочки: на полу или на барабане (играют сами) -->
    <g v-for="(h, j) in HOMES" :key="j" :style="onDrum[j]! >= 0 ? { transform: `translate(${DRUMS[onDrum[j]!]!.x}px, ${DRUM_Y - 22}px)`, transition: 'transform .4s cubic-bezier(.3,1.4,.5,1)' } : drag.style(j, h)" @pointerdown="drag.start($event, j, h)">
      <g :class="onDrum[j]! >= 0 ? 'hammer' : 'wait'" :style="{ animationDelay: `${-j * 0.2}s` }">
        <g stroke-linecap="round">
          <path d="M-22 14 L12 -16" stroke="#7c4a1e" stroke-width="8" /><path d="M-22 14 L12 -16" stroke="#d6a56a" stroke-width="3.5" />
          <circle cx="14" cy="-18" r="8" :fill="DRUMS[j]!.d" stroke="#0f172a" stroke-opacity=".5" stroke-width="2.5" />
          <path d="M-12 16 L22 -14" stroke="#7c4a1e" stroke-width="8" /><path d="M-12 16 L22 -14" stroke="#d6a56a" stroke-width="3.5" />
          <circle cx="24" cy="-16" r="8" :fill="DRUMS[j]!.d" stroke="#0f172a" stroke-opacity=".5" stroke-width="2.5" />
        </g>
      </g>
      <circle v-if="onDrum[j]! < 0" r="40" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.boom { transform-box: fill-box; transform-origin: 50% 80%; animation: boom 0.22s ease-out; }
.wave { transform-box: fill-box; transform-origin: center; animation: wave 0.5s ease-out forwards; }
.note { animation: note 1s ease-out forwards; }
.hint { animation: hint 1s ease-in-out infinite; }
.wait { animation: wait 1.2s ease-in-out infinite; }
.hammer { transform-box: fill-box; transform-origin: 20% 90%; animation: hammer 0.52s ease-in-out infinite; }
.dance { transform-box: fill-box; transform-origin: 50% 100%; animation: dance 0.52s ease-in-out infinite; }
@keyframes boom { 40% { transform: scale(1.1, 0.9); } }
@keyframes wave { from { opacity: 0.8; transform: scale(0.8); } to { opacity: 0; transform: scale(1.4); } }
@keyframes note { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-70px); opacity: 0; } }
@keyframes hint { 50% { transform: translateY(8px); } }
@keyframes wait { 50% { transform: translateY(-4px); } }
@keyframes hammer { 0%, 100% { transform: rotate(-14deg); } 50% { transform: rotate(10deg); } }
@keyframes dance { 50% { transform: translateY(-12px) rotate(4deg); } }
@media (prefers-reduced-motion: reduce) { .boom, .wave, .note, .hint, .wait, .hammer, .dance { animation: none; } }
</style>
