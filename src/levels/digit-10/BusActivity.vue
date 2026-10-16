<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 10: «Крокодил возит десять цыплят на автобусе».
 * Тап по цыплёнку на остановке: он запрыгивает в окошко автобуса, голос считает.
 * Когда все десять внутри, автобус уезжает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const SPOTS = Array.from({ length: 10 }, (_, i) => ({ x: 26 + (i % 5) * 36, y: i < 5 ? 236 : 266 }))
const WIN = (k: number) => ({ x: 214 + (k % 5) * 40, y: k < 5 ? 128 : 172 })

const boarded = ref<number[]>(SPOTS.map(() => 0))
const count = computed(() => boarded.value.filter(Boolean).length)
const leaving = ref(false)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('bus-intro', 'Посади всех цыплят в автобус!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function board(i: number): Promise<void> {
  if (boarded.value[i]) return
  const n = count.value + 1
  boarded.value[i] = n
  const said = sayNumber(n)
  if (n < 10) return
  await said
  await sleep(500)
  leaving.value = true
  await sleep(1600)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Посади десять цыплят в автобус">
    <rect x="-20" y="290" width="480" height="40" fill="#64748b" />
    <rect x="-20" y="224" width="200" height="12" fill="#94a3b8" />

    <g :class="{ drive: leaving }">
      <!-- Автобус -->
      <rect x="196" y="92" width="228" height="150" rx="22" :fill="level.color" stroke="#0f172a" stroke-opacity=".35" stroke-width="4" />
      <rect x="206" y="104" width="208" height="88" rx="12" fill="#e0f2fe" />
      <rect x="196" y="214" width="228" height="10" :fill="level.shade" />
      <circle cx="248" cy="250" r="22" fill="#1e293b" /><circle cx="248" cy="250" r="9" fill="#cbd5e1" />
      <circle cx="372" cy="250" r="22" fill="#1e293b" /><circle cx="372" cy="250" r="9" fill="#cbd5e1" />
      <Crocodile x="196" y="14" width="120" height="88" :mood="count >= 10 ? 'happy' : 'idle'" :mouth="0" :look="-1" class="pointer-events-none" />
      <!-- Пассажиры внутри автобуса -->
      <template v-for="(_, i) in SPOTS" :key="i">
        <g v-if="boarded[i]" :transform="`translate(${WIN(boarded[i]! - 1).x - 17} ${WIN(boarded[i]! - 1).y - 17}) scale(.34)`" class="seat"><AnimalHead :kind="level.animal" /></g>
      </template>
    </g>

    <!-- Цыплята на остановке -->
    <template v-for="(s, i) in SPOTS" :key="'w' + i">
      <g v-if="!boarded[i]" :transform="`translate(${s.x - 17} ${s.y - 17}) scale(.34)`" class="wait" :style="{ animationDelay: `${-i * 0.2}s` }" @click="board(i)">
        <AnimalHead :kind="level.animal" />
        <circle cx="50" cy="50" r="70" fill="transparent" />
      </g>
    </template>
  </svg>
</template>

<style scoped>
g {
  transform-box: fill-box;
}
.wait {
  cursor: pointer;
  animation: bob 1.1s ease-in-out infinite;
}
@keyframes bob {
  50% { translate: 0 -40px; }
}
.seat {
  animation: seat 0.4s cubic-bezier(.3,1.6,.5,1) both;
}
@keyframes seat {
  from { scale: .1; }
}
.drive {
  animation: drive 1.6s ease-in forwards;
}
@keyframes drive {
  to { translate: 460px 0; }
}
@media (prefers-reduced-motion: reduce) {
  .wait { animation: none; }
}
</style>
