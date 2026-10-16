<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 8: «Поросёнок на тракторе возит морковки, крокодил помогает».
 * Тап по морковке: она летит в прицеп, голос считает. Когда их восемь, трактор уезжает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const SPOTS = Array.from({ length: 8 }, (_, i) => ({ x: 40 + (i % 4) * 52, y: i < 4 ? 238 : 282 }))
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

async function load(i: number): Promise<void> {
  if (loaded.value[i]) return
  const n = count.value + 1
  loaded.value[i] = n
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
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Собери восемь морковок">
    <rect x="-20" y="214" width="480" height="120" fill="#a16207" opacity=".55" />
    <rect x="-20" y="208" width="480" height="8" fill="#4ade80" />
    <Crocodile x="-6" y="120" width="130" height="95" :mood="count >= 8 ? 'happy' : 'idle'" :mouth="0" :look="1" class="pointer-events-none" />

    <!-- Трактор с прицепом -->
    <g :class="{ drive: leaving }">
      <rect x="276" y="176" width="90" height="46" rx="6" fill="#fbbf24" stroke="#92400e" stroke-width="4" />
      <circle cx="296" cy="228" r="14" fill="#1e293b" /><circle cx="346" cy="228" r="14" fill="#1e293b" />
      <rect x="368" y="160" width="62" height="54" rx="8" :fill="level.color" stroke="#0f172a" stroke-opacity=".35" stroke-width="4" />
      <g transform="translate(373 150) scale(.46)"><AnimalHead :kind="level.animal" /></g>
      <circle cx="404" cy="226" r="24" fill="#1e293b" /><circle cx="404" cy="226" r="9" fill="#cbd5e1" />
      <template v-for="(_, i) in SPOTS" :key="i">
        <g v-if="loaded[i]" :transform="`translate(${286 + ((loaded[i]! - 1) % 4) * 20} ${i >= 0 && loaded[i]! > 4 ? 178 : 190})`" class="seat">
          <path d="M0 0 L8 -22 L16 0Z" fill="#f97316" stroke="#c2410c" stroke-width="2" stroke-linejoin="round" /><path d="M8 -22 l-4 -8 M8 -22 l4 -8" stroke="#16a34a" stroke-width="3" stroke-linecap="round" />
        </g>
      </template>
    </g>

    <!-- Морковки на грядке -->
    <template v-for="(s, i) in SPOTS" :key="'c' + i">
      <g v-if="!loaded[i]" :transform="`translate(${s.x + 130} ${s.y})`" class="carrot" :style="{ animationDelay: `${-i * 0.25}s` }" @click="load(i)">
        <path d="M-12 -4 L0 34 L12 -4Z" fill="#f97316" stroke="#c2410c" stroke-width="3" stroke-linejoin="round" />
        <path d="M0 -4 l-7 -14 M0 -4 l7 -14 M0 -4 v-16" stroke="#16a34a" stroke-width="4" stroke-linecap="round" />
        <rect x="-28" y="-26" width="56" height="64" fill="transparent" />
      </g>
    </template>
  </svg>
</template>

<style scoped>
g {
  transform-box: fill-box;
}
.carrot {
  cursor: pointer;
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
  .carrot { animation: none; }
}
</style>
