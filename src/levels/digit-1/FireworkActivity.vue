<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { pop, whoosh } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/** Цифра 1: «Один салют». Факел тащат к фитилю ракеты (или тапают): ракета взлетает и взрывается одним большим цветком. */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()
const { sayNumber, sayLine, stopVoice } = useAudio()

const FUSE = { x: 220, y: 262 }
const TORCH_HOME = { x: 90, y: 250 }
const phase = ref<'wait' | 'fly' | 'boom'>('wait')
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const rays = Array.from({ length: 16 }, (_, i) => i)
const stars = [[40, 30], [120, 70], [210, 24], [330, 50], [400, 100], [70, 130], [380, 20], [270, 90]]

onMounted(() => void sayLine('firework-intro', 'Зажги один салют!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: () => phase.value === 'wait',
  onDrop: (_, p) => {
    if (!near(p, FUSE, 70)) return false
    void launch()
    return true
  },
  onTap: () => void launch(),
})

async function launch(): Promise<void> {
  if (phase.value !== 'wait') return
  phase.value = 'fly'
  whoosh()
  await sleep(1000)
  if (!alive) return
  phase.value = 'boom'
  pop()
  const said = sayNumber(1)
  await said
  await sleep(1600)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Зажги один салют">
    <rect x="-800" y="-20" width="2040" height="300" fill="#1e1b4b" />
    <g fill="#fef9c3" class="pointer-events-none"><circle v-for="(s, i) in stars" :key="i" :cx="s[0]" :cy="s[1]" r="2.5" class="twinkle" :style="{ animationDelay: i * 0.3 + 's' }" /></g>
    <circle cx="60" cy="60" r="22" fill="#fef9c3" class="pointer-events-none" /><circle cx="68" cy="54" r="20" fill="#1e1b4b" class="pointer-events-none" />
    <path d="M-800 270 H1240 V1200 H-800Z" fill="#14532d" /><path d="M-800 270 H-20 Q110 252 220 270 T460 266 H1240 V1200 H-800Z" fill="#166534" />

    <!-- ракета -->
    <g :transform="`translate(220 ${phase === 'wait' ? 0 : 0})`" class="pointer-events-none">
      <g v-if="phase !== 'boom'" :class="{ fly: phase === 'fly' }">
        <rect x="-4" y="256" width="8" height="12" fill="#78350f" />
        <path d="M-14 256 V210 Q0 180 14 210 V256Z" fill="#f43f5e" stroke="#9f1239" stroke-width="3.5" />
        <path d="M-14 222 H14 M-14 240 H14" stroke="#fde047" stroke-width="5" />
        <path d="M-14 250 L-26 268 L-14 262Z M14 250 L26 268 L14 262Z" fill="#38bdf8" stroke="#0369a1" stroke-width="2.5" />
        <circle cy="228" r="6" fill="#e0f2fe" stroke="#0369a1" stroke-width="2.5" />
        <path v-if="phase === 'fly'" d="M-8 268 q8 40 16 0Z" fill="#fb923c" />
      </g>
    </g>

    <!-- взрыв -->
    <g v-if="phase === 'boom'" transform="translate(220 90)" class="pointer-events-none">
      <g class="boom">
        <line v-for="r in rays" :key="r" x1="0" y1="-18" x2="0" y2="-82" :stroke="r % 2 ? '#fde047' : '#f472b6'" stroke-width="7" stroke-linecap="round" :transform="`rotate(${r * 22.5})`" />
        <circle v-for="r in rays" :key="'c' + r" cy="-96" r="6" :fill="r % 2 ? '#38bdf8' : '#4ade80'" :transform="`rotate(${r * 22.5 + 11})`" />
      </g>
      <text y="14" text-anchor="middle" font-size="64" font-weight="900" fill="#fff" font-family="Nunito, 'Trebuchet MS', sans-serif">1</text>
    </g>

    <!-- факел -->
    <g v-if="phase === 'wait'" :style="drag.style(0, TORCH_HOME)" @pointerdown="drag.start($event, 0, TORCH_HOME)">
      <g class="bob">
        <rect x="-6" y="-8" width="12" height="52" rx="5" fill="#a16207" stroke="#713f12" stroke-width="3" />
        <path d="M0 -50 C-18 -26 -14 -10 0 -8 C14 -10 18 -26 0 -50Z" fill="#fb923c" /><path d="M0 -34 C-9 -20 -7 -12 0 -10 C7 -12 9 -20 0 -34Z" fill="#fde047" />
      </g>
      <circle r="48" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.twinkle { animation: tw 2s ease-in-out infinite; }
.bob { animation: bob 0.9s ease-in-out infinite; }
.fly { animation: fly 1s ease-in forwards; }
.boom { transform-box: fill-box; transform-origin: center; animation: boom 0.6s ease-out; }
@keyframes tw { 50% { opacity: 0.25; } }
@keyframes bob { 50% { transform: translateY(-5px) rotate(4deg); } }
@keyframes fly { from { transform: translateY(0); } to { transform: translateY(-190px); } }
@keyframes boom { from { transform: scale(0.2); opacity: 0; } 60% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .twinkle, .bob, .fly, .boom { animation: none; } }
</style>
