<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { ding, whoosh } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 1: «Одна звёздочка». С неба падает одна звезда. Её несут к фонарику (или тапают три раза,
 * тогда она сама долетает): фонарик зажигается, крокодил и друг радуются, голос говорит «один».
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()
const { sayNumber, sayLine, stopVoice } = useAudio()

const LAMP = { x: 250, y: 132 }
const STAR_HOME = { x: 372, y: 70 }
const done = ref(false)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Пятиконечная звезда с центром (0,0). */
const STAR = Array.from({ length: 10 }, (_, i) => {
  const a = (Math.PI / 5) * i - Math.PI / 2
  const r = i % 2 ? 11 : 26
  return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`
}).join(' ')
const SKY = [[40, 30], [120, 76], [210, 24], [330, 22], [410, 110], [70, 130], [180, 120], [280, 60]]

onMounted(() => void sayLine('star-intro', 'Звёздочка упала! Отнеси её к фонарику!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: () => !done.value,
  onDrop: (_, p) => {
    if (!near(p, LAMP, 80)) return false
    void light()
    return true
  },
  onTap: () => void light(),
})

async function light(): Promise<void> {
  if (done.value) return
  done.value = true
  whoosh()
  await sleep(300)
  if (!alive) return
  ding(1)
  const said = sayNumber(1)
  await said
  await sleep(1500)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Отнеси одну звёздочку к фонарику">
    <rect x="-800" y="-1200" width="2040" height="1480" fill="#312e81" />
    <g fill="#fef9c3" class="pointer-events-none"><circle v-for="(s, i) in SKY" :key="i" :cx="s[0]" :cy="s[1]" r="2.5" class="twinkle" :style="{ animationDelay: i * 0.3 + 's' }" /></g>
    <rect x="-800" y="262" width="2040" height="900" fill="#166534" />
    <rect x="-800" y="258" width="2040" height="8" fill="#15803d" />

    <!-- Фонарик -->
    <g class="pointer-events-none">
      <circle v-if="done" :cx="LAMP.x" :cy="LAMP.y" r="70" fill="#fef08a" opacity=".4" class="glow" />
      <rect x="246" y="150" width="8" height="112" rx="3" fill="#475569" stroke="#1e293b" stroke-width="3" />
      <rect x="236" y="256" width="28" height="8" rx="3" fill="#475569" stroke="#1e293b" stroke-width="3" />
      <rect x="230" y="108" width="40" height="44" rx="10" :fill="done ? '#fde047' : '#cbd5e1'" stroke="#1e293b" stroke-width="4" />
      <path d="M226 110 L250 92 L274 110Z" fill="#475569" stroke="#1e293b" stroke-width="4" />
      <g v-if="done" :transform="`translate(${LAMP.x} ${LAMP.y + 2}) scale(.6)`" class="twinkle2">
        <polygon :points="STAR" fill="#fff7ae" stroke="#f59e0b" stroke-width="4" />
      </g>
    </g>
    <!-- Цель: мягкое кольцо у фонарика -->
    <circle v-if="!done" :cx="LAMP.x" :cy="LAMP.y" r="50" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-width="4" stroke-dasharray="8 8" class="ring pointer-events-none" />

    <Crocodile x="-20" y="138" width="190" height="139" :mood="done ? 'happy' : 'idle'" :mouth="done ? 0.2 : 0" :look="1" class="pointer-events-none" />
    <AnimalFigure :kind="level.animal" flip :mood="done ? 'happy' : 'idle'" x="338" y="192" width="102" height="75" class="pointer-events-none" />

    <!-- Падающая звезда: тащить к фонарику -->
    <g v-if="!done" :style="drag.style(0, STAR_HOME)" @pointerdown="drag.start($event, 0, STAR_HOME)">
      <g class="fall">
        <polygon :points="STAR" fill="#fde047" stroke="#f59e0b" stroke-width="4" />
        <circle cx="-7" cy="-4" r="3" fill="#0f172a" /><circle cx="7" cy="-4" r="3" fill="#0f172a" />
        <path d="M-6 5 q6 6 12 0" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
      </g>
      <circle r="46" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.twinkle { animation: tw 2s ease-in-out infinite; }
.twinkle2 { animation: tw2 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.glow { animation: gl 1.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.ring { animation: ring 1.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.fall { animation: fall 1.6s cubic-bezier(.3, .9, .4, 1) both, bob 1.4s 1.6s ease-in-out infinite; }
@keyframes tw { 50% { opacity: 0.25; } }
@keyframes tw2 { 50% { transform: scale(1.15) rotate(8deg); } }
@keyframes gl { 50% { transform: scale(1.12); } }
@keyframes ring { 50% { opacity: 0.5; transform: scale(1.06); } }
@keyframes fall { from { transform: translate(-90px, -280px) rotate(-420deg); } to { transform: translate(0, 0) rotate(0); } }
@keyframes bob { 50% { transform: translateY(-6px) rotate(6deg); } }
@media (prefers-reduced-motion: reduce) { .twinkle, .twinkle2, .glow, .ring, .fall { animation: none; } }
</style>
