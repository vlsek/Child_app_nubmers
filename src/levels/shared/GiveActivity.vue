<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Общее задание «Дай другу N штук»: на столе лежит больше, чем нужно,
 * друг просит ровно N (в облачке N точек). Тап по предмету: он летит к другу, голос считает.
 * Лишние предметы после N просто остаются на столе. Крокодил подбадривает.
 * Используют обёртки в digit-N/ (передают n, item, introKey, introText).
 */
const props = defineProps<{
  level: NumberLevel
  n: number
  item: 'melon' | 'ball' | 'cookie' | 'apple' | 'star'
  introKey: string
  introText: string
}>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const TOTAL = props.n >= 10 ? 10 : Math.min(10, props.n + 4)
const FRIEND = { x: 350, y: 80 }
const spots = Array.from({ length: TOTAL }, (_, i) => ({ x: 60 + (i % 5) * 62, y: i < 5 ? 220 : 275 }))
const COLORS: Record<string, string[]> = {
  melon: ['#22c55e'],
  ball: ['#ef4444', '#3b82f6', '#facc15', '#a855f7', '#f97316', '#14b8a6', '#ec4899', '#22c55e', '#38bdf8'],
  cookie: ['#d97706'],
  apple: ['#ef4444', '#22c55e'],
  star: ['#facc15'],
}
const colorOf = (i: number): string => COLORS[props.item]![i % COLORS[props.item]!.length]!

const given = ref<number[]>(spots.map(() => 0))
const count = computed(() => given.value.filter(Boolean).length)
const done = computed(() => count.value >= props.n)
const shake = ref(-1)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine(props.introKey, props.introText))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function give(i: number): Promise<void> {
  if (given.value[i]) return
  if (done.value) {
    shake.value = i
    setTimeout(() => (shake.value = -1), 400)
    return
  }
  const k = count.value + 1
  given.value[i] = k
  const said = sayNumber(k)
  if (k < props.n) return
  await said
  await sleep(900)
  if (alive) emit('complete')
}

function place(i: number): { x: number; y: number } {
  return given.value[i] ? { x: FRIEND.x, y: FRIEND.y + 38 } : spots[i]!
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" :aria-label="`Дай ${n}`">
    <rect x="-20" y="196" width="480" height="140" fill="#fde68a" opacity=".6" />
    <Crocodile x="-12" y="40" width="160" height="117" :mood="done ? 'happy' : 'idle'" :mouth="0" :look="1" class="pointer-events-none" />

    <!-- Друг и его просьба -->
    <g :transform="`translate(${FRIEND.x - 30} ${FRIEND.y - 30}) scale(.6)`" :class="{ cheer: done }"><AnimalHead :kind="level.animal" /></g>
    <g transform="translate(236 34)">
      <rect width="86" height="44" rx="22" fill="#fff" stroke="#94a3b8" stroke-width="3" />
      <path d="M86 24 L100 34 L84 34Z" fill="#fff" stroke="#94a3b8" stroke-width="3" stroke-linejoin="round" />
      <circle v-for="k in n" :key="k" :cx="43 + (k - (n + 1) / 2) * Math.min(14, 66 / n)" cy="22" :r="n > 7 ? 3 : 5" :fill="k <= count ? '#22c55e' : '#cbd5e1'" />
    </g>

    <!-- Предметы -->
    <g
      v-for="(_, i) in spots"
      :key="i"
      :class="{ idle: !given[i], shake: shake === i }"
      :style="{ transform: `translate(${place(i).x}px, ${place(i).y}px) scale(${given[i] ? 0.4 : 1})`, opacity: given[i] ? 0 : 1, transition: given[i] ? 'transform .7s ease-in, opacity .2s .5s' : 'none' }"
      @click="give(i)"
    >
      <template v-if="item === 'melon'">
        <ellipse rx="26" ry="20" fill="#22c55e" stroke="#15803d" stroke-width="3" />
        <path d="M-12 -16 Q-16 0 -12 16 M0 -20 V20 M12 -16 Q16 0 12 16" fill="none" stroke="#15803d" stroke-width="3" opacity=".6" />
      </template>
      <template v-else-if="item === 'ball'">
        <circle r="22" :fill="colorOf(i)" stroke="#0f172a" stroke-opacity=".35" stroke-width="3" />
        <path d="M-14 -10 Q0 -2 14 -10" fill="none" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round" />
      </template>
      <template v-else-if="item === 'cookie'">
        <circle r="22" fill="#fbbf24" stroke="#b45309" stroke-width="3" />
        <circle cx="-8" cy="-6" r="3.5" fill="#78350f" /><circle cx="8" cy="-2" r="3.5" fill="#78350f" /><circle cx="-2" cy="10" r="3.5" fill="#78350f" />
      </template>
      <template v-else-if="item === 'apple'">
        <circle r="21" :fill="colorOf(i)" stroke="#0f172a" stroke-opacity=".35" stroke-width="3" />
        <path d="M0 -20 q2 -8 8 -10" stroke="#78350f" stroke-width="3" fill="none" stroke-linecap="round" />
      </template>
      <template v-else>
        <path d="M0 -24 L7 -8 L24 -8 L10 3 L16 20 L0 10 L-16 20 L-10 3 L-24 -8 L-7 -8Z" fill="#facc15" stroke="#b45309" stroke-width="3" stroke-linejoin="round" />
      </template>
      <circle r="34" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
g {
  transform-box: view-box;
}
.idle {
  cursor: pointer;
}
.shake {
  animation: shake 0.4s;
}
@keyframes shake {
  25% { translate: -5px 0; }
  75% { translate: 5px 0; }
}
.cheer {
  transform-box: fill-box;
  animation: hop 0.6s ease-in-out infinite;
}
@keyframes hop {
  50% { translate: 0 -8px; }
}
</style>
