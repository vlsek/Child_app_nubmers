<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { pop } from '@/composables/synth'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 3: «Крокодил лопает три шарика».
 * Друг держит три шарика. Лопнуть шарик это не «перенести», поэтому остаётся ТАП по шарику: крокодил открывает пасть, шарик лопается, голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const HAND = { x: 392, y: 236 }
const BALLOONS = [
  { x: 236, y: 112, color: '#ef4444' },
  { x: 312, y: 84, color: '#facc15' },
  { x: 384, y: 118, color: '#3b82f6' },
]

/** popped[i] — каким по счёту лопнул шарик i (0 — целый). */
const popped = ref<number[]>([0, 0, 0])
const count = computed(() => popped.value.filter(Boolean).length)
const mouth = ref(0)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function tweenMouth(to: number, ms: number): Promise<void> {
  const from = mouth.value
  const t0 = performance.now()
  return new Promise((resolve) => {
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / ms)
      mouth.value = from + (to - from) * k
      if (k < 1 && alive) requestAnimationFrame(tick)
      else resolve()
    }
    requestAnimationFrame(tick)
  })
}

onMounted(() => void sayLine('balloons-intro', 'Лопни шарики!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function pop(i: number): Promise<void> {
  if (popped.value[i]) return
  const n = count.value + 1
  popped.value[i] = n
  void tweenMouth(0.8, 120)
  pop()
  const said = sayNumber(n)
  await sleep(350)
  void tweenMouth(0, 200)
  if (n < 3) return
  await said
  await sleep(300)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Лопни три шарика">
    <rect x="-20" y="262" width="480" height="70" fill="#4ade80" />
    <rect x="-20" y="258" width="480" height="8" fill="#22c55e" />

    <!-- Верёвочки к другу -->
    <g stroke="#475569" stroke-width="2.5" fill="none">
      <path v-for="(b, i) in BALLOONS" v-show="!popped[i]" :key="i" :d="`M${b.x} ${b.y + 36} Q${(b.x + HAND.x) / 2} ${(b.y + HAND.y) / 2 + 20} ${HAND.x} ${HAND.y}`" />
    </g>

    <!-- Друг -->
    <AnimalFigure :kind="level.animal" flip :mood="count >= 3 ? 'happy' : 'idle'" x="296" y="166" width="140" height="102" class="pointer-events-none" />

    <!-- Крокодил -->
    <Crocodile x="-8" y="168" width="200" height="146" :mood="count >= 3 ? 'happy' : 'idle'" :mouth="mouth" :look="1" class="pointer-events-none" />

    <!-- Шарики -->
    <g v-for="(b, i) in BALLOONS" :key="i" :transform="`translate(${b.x} ${b.y})`">
      <g v-if="!popped[i]" class="balloon" :style="{ animationDelay: `${-i * 0.4}s` }" @click="pop(i)">
        <ellipse rx="30" ry="36" :fill="b.color" stroke="#0f172a" stroke-opacity=".35" stroke-width="3" />
        <path d="M-6 36 l6 8 l6 -8Z" :fill="b.color" />
        <ellipse cx="-10" cy="-14" rx="6" ry="10" fill="#fff" opacity=".45" transform="rotate(20 -10 -14)" />
        <circle r="46" fill="transparent" />
      </g>
      <!-- Хлопок -->
      <g v-else class="burst" stroke="#f59e0b" stroke-width="5" stroke-linecap="round">
        <path v-for="a in 8" :key="a" d="M0 -22 V-40" :transform="`rotate(${a * 45})`" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.balloon {
  cursor: pointer;
  animation: sway 2.2s ease-in-out infinite;
}
@keyframes sway {
  50% {
    transform: translateY(-6px) rotate(2deg);
  }
}
.burst {
  animation: burst 0.45s ease-out forwards;
}
@keyframes burst {
  from {
    transform: scale(0.4);
    opacity: 1;
  }
  to {
    transform: scale(1.5);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .balloon {
    animation: none;
  }
}
</style>
