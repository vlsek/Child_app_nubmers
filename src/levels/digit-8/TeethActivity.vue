<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 8: «Птичка чистит крокодилу зубки».
 * У крокодила широко открытая пасть, на восьми зубах грязные пятнышки.
 * Тап по пятнышку: птичка прыгает к нему, зуб блестит, голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const TEETH = Array.from({ length: 8 }, (_, i) => ({ x: 78 + i * 40 }))
const clean = ref<number[]>(TEETH.map(() => 0))
const count = computed(() => clean.value.filter(Boolean).length)
const birdX = ref(220)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('teeth-intro', 'Почисти крокодилу зубки!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function wash(i: number): Promise<void> {
  if (clean.value[i]) return
  const n = count.value + 1
  clean.value[i] = n
  birdX.value = TEETH[i]!.x
  const said = sayNumber(n)
  if (n < 8) return
  await said
  await sleep(900)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Почисти восемь зубов крокодилу">
    <!-- Нижняя челюсть и язык -->
    <path d="M30 190 Q30 290 220 290 Q410 290 410 190Z" fill="#4ade80" stroke="#15803d" stroke-width="5" stroke-linejoin="round" />
    <path d="M60 196 Q70 262 220 262 Q370 262 380 196Z" fill="#f87171" />
    <!-- Верхняя челюсть -->
    <path d="M20 120 Q20 40 220 40 Q420 40 420 120 L420 150 Q420 160 400 160 H40 Q20 160 20 150Z" fill="#4ade80" stroke="#15803d" stroke-width="5" stroke-linejoin="round" />
    <circle cx="110" cy="64" r="18" fill="#fff" stroke="#15803d" stroke-width="4" /><circle cx="114" cy="66" r="8" fill="#1e293b" />
    <circle cx="330" cy="64" r="18" fill="#fff" stroke="#15803d" stroke-width="4" /><circle cx="326" cy="66" r="8" fill="#1e293b" />

    <!-- Зубы -->
    <g v-for="(t, i) in TEETH" :key="i" @click="wash(i)" :class="{ dirty: !clean[i] }">
      <path :d="`M${t.x - 17} 158 L${t.x} 206 L${t.x + 17} 158Z`" fill="#fff" stroke="#94a3b8" stroke-width="3" stroke-linejoin="round" />
      <template v-if="!clean[i]">
        <circle :cx="t.x" cy="176" r="11" fill="#78350f" opacity=".85" /><circle :cx="t.x - 5" cy="172" r="4" fill="#a16207" />
      </template>
      <template v-else>
        <path :d="`M${t.x} 170 v-8 M${t.x - 4} 166 h8`" stroke="#facc15" stroke-width="3" stroke-linecap="round" class="spark" />
      </template>
      <rect :x="t.x - 22" y="150" width="44" height="64" fill="transparent" />
    </g>

    <!-- Птичка -->
    <g :style="{ transform: `translate(${birdX}px, 232px)`, transition: 'transform .45s cubic-bezier(.4,1.4,.5,1)' }" class="bird">
      <ellipse rx="22" ry="16" fill="#38bdf8" stroke="#0369a1" stroke-width="3" />
      <path d="M-22 0 L-38 -8 L-34 6Z" fill="#0ea5e9" />
      <circle cx="10" cy="-6" r="3.5" fill="#fff" /><circle cx="11" cy="-6" r="1.6" fill="#1e293b" />
      <path d="M20 -2 L36 -18 L24 -8Z" fill="#fb923c" stroke="#c2410c" stroke-width="2" stroke-linejoin="round" />
    </g>
  </svg>
</template>

<style scoped>
g {
  transform-box: view-box;
}
.dirty {
  cursor: pointer;
}
.spark {
  animation: tw 0.8s ease-in-out infinite;
}
@keyframes tw {
  50% { opacity: .2; }
}
.bird {
  transform-box: view-box;
}
@media (prefers-reduced-motion: reduce) {
  .spark { animation: none; }
}
</style>
