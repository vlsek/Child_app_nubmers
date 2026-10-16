<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 7: «Крокодил идёт по следам к спрятавшемуся другу».
 * На песчаной тропинке семь пятнышек. Тап: появляется отпечаток лапы, голос считает.
 * Когда все семь готовы, из кустов выпрыгивает обезьянка: «Ку-ку!».
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const SPOTS = Array.from({ length: 7 }, (_, i) => ({ x: 40 + i * 50, y: 236 + (i % 2 ? -16 : 12) }))

/** step[i] — каким по счёту поставлен след i (0 — пятнышко). */
const step = ref<number[]>(SPOTS.map(() => 0))
const count = computed(() => step.value.filter(Boolean).length)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('tracks-intro', 'Иди по следам!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function stamp(i: number): Promise<void> {
  if (step.value[i]) return
  const n = count.value + 1
  step.value[i] = n
  const said = sayNumber(n)
  if (n < 7) return
  await said
  await sleep(1200)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Поставь семь следов">
    <rect x="-20" y="262" width="480" height="70" fill="#4ade80" />
    <!-- Песчаная тропинка -->
    <path d="M-20 252 Q60 214 140 246 T300 240 T460 236 V292 Q380 300 300 288 T140 292 T-20 290Z" fill="#fde68a" stroke="#f59e0b" stroke-width="3" />

    <Crocodile x="-14" y="52" width="150" height="110" :mood="count >= 7 ? 'happy' : 'idle'" :mouth="count >= 7 ? 0.4 : 0" :look="1" class="pointer-events-none" />

    <!-- Куст с обезьянкой -->
    <g transform="translate(360 170)">
      <g v-if="count >= 7" class="peek"><g transform="translate(-30 -44) scale(.6)"><AnimalHead :kind="level.animal" /></g></g>
      <g :class="{ shake: count >= 7 }" fill="#22c55e" stroke="#15803d" stroke-width="4">
        <circle cx="-26" cy="26" r="30" /><circle cx="22" cy="20" r="34" /><circle cx="0" cy="40" r="32" />
      </g>
    </g>

    <!-- Следы -->
    <g v-for="(s, i) in SPOTS" :key="i" :transform="`translate(${s.x} ${s.y})`" @click="stamp(i)">
      <g v-if="!step[i]" class="spot">
        <ellipse rx="19" ry="23" fill="#fff" fill-opacity=".5" stroke="#b45309" stroke-width="3" stroke-dasharray="6 5" />
        <circle r="34" fill="transparent" />
      </g>
      <g v-else class="print" fill="#4d7c0f" stroke="#365314" stroke-width="2.5">
        <ellipse cy="6" rx="14" ry="12" />
        <ellipse cx="-14" cy="-10" rx="5" ry="7" transform="rotate(-20 -14 -10)" /><ellipse cy="-15" rx="5" ry="7" /><ellipse cx="14" cy="-10" rx="5" ry="7" transform="rotate(20 14 -10)" />
        <text y="12" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" stroke="none">{{ step[i] }}</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.spot {
  cursor: pointer;
  transform-box: fill-box;
  transform-origin: center;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  50% {
    transform: scale(1.1);
  }
}
.print {
  animation: stamp 0.3s ease-out;
}
@keyframes stamp {
  from {
    transform: scale(1.8);
    opacity: 0;
  }
}
.peek {
  animation: peek 0.6s cubic-bezier(0.3, 1.5, 0.5, 1) forwards;
}
@keyframes peek {
  from {
    transform: translateY(50px);
  }
  to {
    transform: translateY(-24px);
  }
}
.shake {
  animation: shake 0.5s;
}
@keyframes shake {
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .spot {
    animation: none;
  }
}
</style>
