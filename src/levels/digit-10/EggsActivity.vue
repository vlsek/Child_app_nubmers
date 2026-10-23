<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { pop } from '@/composables/synth'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 10: «Крокодил греет десять яиц».
 * Тап по яйцу: оно трескается, выглядывает цыплёнок, голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const COLORS = ['#fde68a', '#fecaca', '#bfdbfe', '#bbf7d0', '#e9d5ff', '#fde68a', '#fecaca', '#bfdbfe', '#bbf7d0', '#e9d5ff']
const EGGS = COLORS.map((color, i) => ({ color, x: 92 + (i % 5) * 68, y: i < 5 ? 190 : 262 }))

const hatched = ref<number[]>(EGGS.map(() => 0))
const count = computed(() => hatched.value.filter(Boolean).length)
const mouth = ref(0)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('eggs-intro', 'Помоги цыплятам вылупиться!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function hatch(i: number): Promise<void> {
  if (hatched.value[i]) return
  const n = count.value + 1
  hatched.value[i] = n
  mouth.value = 0.4
  setTimeout(() => (mouth.value = 0), 400)
  pop()
  const said = sayNumber(n)
  if (n < 10) return
  await said
  await sleep(800)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Выведи десять цыплят">
    <rect x="-20" y="150" width="480" height="190" fill="#fcd34d" opacity=".55" />
    <Crocodile x="120" y="2" width="170" height="124" :mood="count >= 10 ? 'happy' : 'idle'" :mouth="mouth" :look="0" class="pointer-events-none" />

    <g v-for="(e, i) in EGGS" :key="i" :transform="`translate(${e.x} ${e.y})`">
      <!-- Цыплёнок -->
      <g v-if="hatched[i]" class="pop"><g transform="translate(-22 -50) scale(.44)"><AnimalFigure :kind="level.animal" :x="-10" :y="0" :width="120" :height="89.5" crop /></g></g>
      <g :class="hatched[i] ? 'shell' : 'egg'" @click="hatch(i)">
        <path d="M0 -30 C22 -30 30 0 30 14 C30 30 16 38 0 38 C-16 38 -30 30 -30 14 C-30 0 -22 -30 0 -30Z" :fill="e.color" stroke="#0f172a" stroke-opacity=".35" stroke-width="3" />
        <path v-if="hatched[i]" d="M-30 6 L-16 -6 L-6 8 L6 -6 L16 8 L30 -4" fill="none" stroke="#0f172a" stroke-opacity=".5" stroke-width="3" stroke-linejoin="round" />
        <text v-else y="12" text-anchor="middle" font-size="26" fill="#0f172a" opacity=".25" font-weight="900">•</text>
        <rect x="-40" y="-40" width="80" height="84" fill="transparent" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
g {
  transform-box: fill-box;
}
.egg {
  cursor: pointer;
  transform-origin: 50% 100%;
  animation: wobble 1.6s ease-in-out infinite;
}
@keyframes wobble {
  0%, 70%, 100% { rotate: 0deg; }
  80% { rotate: -6deg; }
  90% { rotate: 6deg; }
}
.shell {
  pointer-events: none;
  clip-path: inset(40% 0 0 0);
}
.pop {
  animation: pop 0.5s cubic-bezier(.3,1.6,.5,1) both;
  transform-origin: 50% 100%;
}
@keyframes pop {
  from { scale: .2; translate: 0 30px; }
}
@media (prefers-reduced-motion: reduce) {
  .egg, .pop { animation: none; }
}
</style>
