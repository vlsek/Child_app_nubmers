<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { thump } from '@/composables/synth'
import type { NumberLevel } from '@/types/game'

/** Цифра 2: «Два барабана». Тап по барабану: бум, счёт. Когда сыграны оба, зверь и крокодил пляшут. */
const props = defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()
const { sayNumber, sayLine, stopVoice } = useAudio()

const DRUMS = [
  { x: 135, c: '#f43f5e', f: 120 },
  { x: 305, c: '#38bdf8', f: 170 },
]
const hit = ref<boolean[]>([false, false])
const flash = ref(-1)
const dance = ref(false)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('drums-intro', 'Побарабань!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function bang(i: number): Promise<void> {
  thump(DRUMS[i]!.f)
  flash.value = -1
  await sleep(20)
  flash.value = i
  if (hit.value[i]) return
  hit.value[i] = true
  const n = hit.value.filter(Boolean).length
  const said = sayNumber(n)
  if (n < 2) return
  dance.value = true
  await said
  await sleep(1800)
  if (alive) emit('complete')
}
void props
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Два барабана">
    <rect x="-800" y="-20" width="2040" height="290" fill="#fde68a" />
    <path d="M-800 90 H1240" stroke="#f59e0b" stroke-opacity=".5" stroke-width="2" />
    <path d="M-800 250 H1240 V340 H-800Z" fill="#92400e" /><path d="M-800 250 H1240" stroke="#451a03" stroke-width="4" />
    <g fill="#f43f5e" class="pointer-events-none"><circle cx="40" cy="40" r="6" /><circle cx="400" cy="60" r="6" fill="#38bdf8" /><circle cx="210" cy="30" r="6" fill="#4ade80" /></g>

    <g :class="{ dance }" class="pointer-events-none"><Crocodile x="-4" y="150" width="110" height="80" :mood="dance ? 'happy' : 'idle'" :look="1" /></g>
    <g :class="{ dance }" class="pointer-events-none"><AnimalFigure :kind="props.level.animal" flip :mood="dance ? 'happy' : 'idle'" x="340" y="150" width="100" height="73" /></g>

    <g v-for="(d, i) in DRUMS" :key="i" :transform="`translate(${d.x} 214)`" class="cursor-pointer" @pointerdown.prevent="bang(i)">
      <g :class="{ boom: flash === i }">
        <ellipse cy="26" rx="62" ry="14" fill="#7f1d1d" fill-opacity=".25" />
        <path d="M-58 -8 V22 Q0 44 58 22 V-8Z" :fill="d.c" stroke="#0f172a" stroke-opacity=".5" stroke-width="4" stroke-linejoin="round" />
        <path d="M-40 -2 L-24 34 L-8 -2 L8 38 L24 -2 L40 34" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="4" />
        <ellipse cy="-8" rx="58" ry="16" fill="#fef3c7" stroke="#0f172a" stroke-opacity=".5" stroke-width="4" />
        <circle v-if="!hit[i]" cy="-60" r="22" fill="#fff" stroke="#0f172a" stroke-opacity=".4" stroke-width="3" class="pulse" />
        <path v-if="!hit[i]" d="M0 -48 V-22 M-9 -32 L0 -22 L9 -32" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        <text v-if="hit[i]" y="-52" text-anchor="middle" font-size="40" font-weight="900" fill="#7c2d12" font-family="Nunito, 'Trebuchet MS', sans-serif">{{ i + 1 }}</text>
      </g>
      <circle cy="-10" r="70" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.boom { transform-box: fill-box; transform-origin: 50% 80%; animation: boom 0.25s ease-out; }
.pulse { transform-box: fill-box; transform-origin: center; animation: pulse 1s ease-in-out infinite; }
.dance { transform-box: fill-box; transform-origin: 50% 100%; animation: dance 0.5s ease-in-out infinite; }
@keyframes boom { 40% { transform: scale(1.1, 0.88); } }
@keyframes pulse { 50% { transform: scale(1.15); } }
@keyframes dance { 50% { transform: translateY(-12px) rotate(4deg); } }
@media (prefers-reduced-motion: reduce) { .boom, .pulse, .dance { animation: none; } }
</style>
