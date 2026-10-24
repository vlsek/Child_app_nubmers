<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { SCALE, useTone } from '@/composables/useTone'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 7: «Ксилофон». Семь разноцветных пластинок. Тап: звучит нота, пластинка подпрыгивает,
 * вылетает нотка, голос считает. Когда сыграны все семь, ксилофон сам проигрывает мелодию вверх и вниз.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()
const { tone } = useTone()

const N = 7
const COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7']
const BARS = COLORS.map((color, i) => ({ color, x: 176 + i * 38, h: 150 - i * 15 }))
const BASE = 252

/** played[i] — каким по счёту сыграна пластинка i (0 — ещё нет). */
const played = ref<number[]>(Array.from({ length: N }, () => 0))
const count = computed(() => played.value.filter(Boolean).length)
const bounce = ref<number[]>(Array.from({ length: N }, () => 0))
const notes = ref<{ id: number; x: number; y: number }[]>([])
const hop = ref(0)
/** Какую пластинку только что ударила палочка (-1: палочка отдыхает). */
const striking = ref(-1)
const PAW = { x: 128, y: 246 }
const tip = computed(() => {
  const i = striking.value
  return i < 0 ? { x: 150, y: 196 } : { x: BARS[i]!.x + 16, y: BASE - BARS[i]!.h - 6 }
})
const mouth = ref(0)
const playing = ref(false)
let noteId = 0
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('xylophone-intro', 'Поиграй на ксилофоне!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

function ring(i: number): void {
  tone(SCALE[i]!, 0.6)
  bounce.value[i]!++
  hop.value++
  striking.value = i
  setTimeout(() => (striking.value = -1), 260)
  mouth.value = 0.4
  setTimeout(() => (mouth.value = 0), 250)
  const id = ++noteId
  notes.value.push({ id, x: BARS[i]!.x + 15, y: BASE - BARS[i]!.h - 6 })
  setTimeout(() => (notes.value = notes.value.filter((n) => n.id !== id)), 1100)
}

async function hit(i: number): Promise<void> {
  if (playing.value) return
  ring(i)
  if (played.value[i]) return
  const n = count.value + 1
  played.value[i] = n
  const said = sayNumber(n)
  if (n < N) return
  await said
  playing.value = true
  for (const k of [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0]) {
    if (!alive) return
    ring(k)
    await sleep(230)
  }
  await sleep(400)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Сыграй семь нот на ксилофоне">
    <rect x="-800" y="262" width="2040" height="900" fill="#fcd34d" />
    <rect x="-800" y="258" width="2040" height="8" fill="#f59e0b" />

    <Crocodile x="-14" y="174" width="170" height="124" :mood="count >= N ? 'happy' : 'idle'" :mouth="mouth" :look="1" class="pointer-events-none" />

    <!-- Ножки и рейки ксилофона -->
    <g stroke="#7c4a1e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M180 262 L200 192 M410 262 L392 192" fill="none" stroke-width="9" />
      <path d="M170 192 H430 M170 232 H430" fill="none" stroke="#b9793a" stroke-width="9" />
    </g>

    <!-- Пластинки -->
    <g v-for="(b, i) in BARS" :key="i" class="cursor-pointer" @pointerdown.prevent="hit(i)">
      <g :key="bounce[i]" class="bar" :class="{ ring: bounce[i] }">
        <rect :x="b.x" :y="BASE - b.h" width="32" :height="b.h" rx="9" :fill="b.color" stroke="#0f172a" stroke-opacity=".35" stroke-width="3.5" />
        <rect :x="b.x + 5" :y="BASE - b.h + 6" width="7" :height="b.h - 14" rx="3.5" fill="#fff" opacity=".4" />
        <circle :cx="b.x + 16" :cy="BASE - b.h + 14" r="3" fill="#0f172a" opacity=".3" />
        <circle :cx="b.x + 16" :cy="BASE - 12" r="3" fill="#0f172a" opacity=".3" />
        <!-- номер, когда сыграна -->
        <g v-if="played[i]">
          <circle :cx="b.x + 16" :cy="BASE - b.h / 2" r="12" fill="#fff" stroke="#0f172a" stroke-opacity=".4" stroke-width="2.5" />
          <text :x="b.x + 16" :y="BASE - b.h / 2 + 1" text-anchor="middle" dominant-baseline="central" font-size="16" font-weight="900" fill="#0f172a" font-family="Nunito, 'Trebuchet MS', sans-serif">{{ played[i] }}</text>
        </g>
      </g>
      <rect :x="b.x - 3" :y="BASE - b.h - 10" width="38" :height="b.h + 14" fill="transparent" />
    </g>

    <!-- Палочка в лапе крокодила бьёт по пластинке -->
    <g class="pointer-events-none" stroke-linecap="round">
      <path :d="`M${PAW.x} ${PAW.y} L${tip.x} ${tip.y}`" stroke="#7c4a1e" stroke-width="9" />
      <path :d="`M${PAW.x} ${PAW.y} L${tip.x} ${tip.y}`" stroke="#d6a56a" stroke-width="4" />
      <circle :cx="tip.x" :cy="tip.y" r="10" fill="#f43f5e" stroke="#9f1239" stroke-width="3.5" />
      <circle :cx="PAW.x" :cy="PAW.y" r="12" fill="#4cae45" stroke="#1f5a2a" stroke-width="4" />
    </g>

    <!-- Летящие нотки -->
    <g v-for="n in notes" :key="n.id" class="note pointer-events-none" :style="{ transform: `translate(${n.x}px, ${n.y}px)` }">
      <g class="note-float">
        <ellipse cx="0" cy="0" rx="7" ry="5.5" fill="#fff" stroke="#0f172a" stroke-opacity=".5" stroke-width="2.5" transform="rotate(-20)" />
        <path d="M6 -2 V-24 q9 2 10 11" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" />
        <path d="M6 -2 V-24 q9 2 10 11" fill="none" stroke="#0f172a" stroke-opacity=".5" stroke-width="1.5" stroke-linecap="round" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.bar {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}
.ring {
  animation: ring 0.45s cubic-bezier(0.3, 1.6, 0.5, 1);
}
@keyframes ring {
  0% {
    transform: translateY(0) scale(1, 1);
  }
  25% {
    transform: translateY(-9px) scale(1.08, 0.94);
  }
  100% {
    transform: translateY(0) scale(1, 1);
  }
}
.note-float {
  animation: note-up 1.1s ease-out forwards;
}
@keyframes note-up {
  from {
    opacity: 1;
    transform: translate(0, 0);
  }
  to {
    opacity: 0;
    transform: translate(10px, -50px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ring,
  .note-float {
    animation: none;
  }
}
</style>
