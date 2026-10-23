<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { animalSound, pop } from '@/composables/synth'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 10: «Крокодил греет десять яиц».
 * Тап по яйцу: оно трескается, выглядывает цыплёнок, голос считает.
 */
const props = defineProps<{ level: NumberLevel }>()
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
  animalSound(props.level.animal)
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
    <Crocodile x="120" y="34" width="170" height="124" :mood="count >= 10 ? 'happy' : 'idle'" :mouth="mouth" :look="0" class="pointer-events-none" />

    <g v-for="(e, i) in EGGS" :key="i" :transform="`translate(${e.x} ${e.y})`" @click="hatch(i)">
      <!-- Цыплёнок выпрыгивает из яйца -->
      <g v-if="hatched[i]" class="chick"><AnimalFigure :kind="level.animal" x="-33" y="-40" width="66" height="48" /></g>
      <!-- Нижняя половинка: зубчатый разлом -->
      <g :class="{ egg: !hatched[i] }">
        <path d="M-29 4 L-20 -6 L-10 6 L0 -6 L10 6 L20 -6 L29 4 C30 8 30 12 30 14 C30 30 16 38 0 38 C-16 38 -30 30 -30 14 C-30 10 -30 8 -29 4Z" :fill="e.color" stroke="#0f172a" stroke-opacity=".35" stroke-width="3" stroke-linejoin="round" />
        <!-- Верхняя половинка: цела, пока яйцо не треснуло, потом отлетает -->
        <g :class="hatched[i] ? 'cap' : ''">
          <path d="M-29 4 L-20 -6 L-10 6 L0 -6 L10 6 L20 -6 L29 4 C32 -12 18 -30 0 -30 C-18 -30 -32 -12 -29 4Z" :fill="e.color" stroke="#0f172a" stroke-opacity=".35" stroke-width="3" stroke-linejoin="round" />
          <path d="M-14 -18 q4 -6 10 -7" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6" />
          <text v-if="!hatched[i]" y="-2" text-anchor="middle" font-size="22" fill="#0f172a" opacity=".25" font-weight="900">•</text>
        </g>
      </g>
      <rect x="-40" y="-44" width="80" height="88" fill="transparent" class="cursor-pointer" />
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
.chick {
  animation: chick 0.55s cubic-bezier(0.3, 1.5, 0.5, 1) forwards;
}
.cap {
  transform-box: fill-box;
  transform-origin: 0% 100%;
  animation: cap 0.5s ease-out forwards;
}
@keyframes chick {
  from {
    transform: translateY(26px) scale(0.6);
  }
  to {
    transform: translateY(-8px) scale(1);
  }
}
@keyframes cap {
  to {
    transform: translate(-16px, -30px) rotate(-38deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .egg,
  .chick,
  .cap {
    animation: none;
  }
}
</style>
