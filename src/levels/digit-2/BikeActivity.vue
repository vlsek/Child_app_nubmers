<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 2: «Крокодил на велосипеде перепрыгивает два пенька».
 * Пенёк подъезжает и ждёт. Тап: велосипед подпрыгивает, пенёк уезжает под ним, голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const STOP_X = 292
/** x пеньков: ждёт (STOP_X), прыгнули (-80), ещё не приехал (480). */
const stumps = ref<number[]>([STOP_X, 480])
const jumping = ref(false)
const cur = ref(0)
const done = ref(false)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('bike-intro', 'Перепрыгни пенёк!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function jump(): Promise<void> {
  if (jumping.value || done.value) return
  jumping.value = true
  const i = cur.value
  stumps.value[i] = -80
  await sleep(450)
  const said = sayNumber(i + 1)
  await sleep(550)
  jumping.value = false
  cur.value++
  if (cur.value < 2) {
    stumps.value[cur.value] = STOP_X
    return
  }
  done.value = true
  await said
  await sleep(400)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Перепрыгни два пенька" @click="jump">
    <rect x="-20" y="282" width="480" height="50" fill="#9ca3af" />
    <rect x="-20" y="278" width="480" height="8" fill="#6b7280" />
    <path d="M0 304 H440" stroke="#fff" stroke-width="4" stroke-dasharray="26 22" />

    <!-- Друг машет с горки -->
    <g transform="translate(350 120) scale(.7)" class="cheer"><AnimalHead :kind="level.animal" /></g>

    <!-- Пеньки -->
    <g v-for="(x, i) in stumps" :key="i" :style="{ transform: `translate(${x}px, 282px)`, transition: x === STOP_X && !jumping && cur === i && i > 0 ? 'transform .8s ease-out' : x === -80 ? 'transform .9s linear' : 'none' }">
      <rect x="-20" y="-38" width="40" height="38" rx="5" fill="#b9793a" stroke="#7c4a1e" stroke-width="4" />
      <ellipse cx="0" cy="-38" rx="20" ry="7" fill="#e0a566" stroke="#7c4a1e" stroke-width="3" />
      <ellipse cx="0" cy="-38" rx="9" ry="3" fill="none" stroke="#7c4a1e" stroke-width="2" />
    </g>

    <!-- Велосипед с крокодилом -->
    <g transform="translate(20 148)">
      <g :class="{ jump: jumping }" stroke-linecap="round" stroke-linejoin="round">
        <g fill="none" stroke="#1f2937" stroke-width="6">
          <circle cx="40" cy="100" r="34" />
          <circle cx="150" cy="100" r="34" />
        </g>
        <g fill="none" stroke="#9ca3af" stroke-width="2"><path d="M40 66 V134 M6 100 H74 M150 66 V134 M116 100 H184" /></g>
        <g fill="none" stroke="#ef4444" stroke-width="7">
          <path d="M40 100 L88 100 L72 52 L134 52 L88 100 M134 52 L150 100" />
          <path d="M134 52 L134 34 L150 30 M60 46 H86" stroke="#1f2937" stroke-width="6" />
        </g>
        <Crocodile x="28" y="-44" width="120" height="88" :mood="jumping ? 'happy' : 'idle'" :mouth="jumping ? 0.5 : 0" :look="1" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.jump {
  animation: jump 0.9s ease-in-out;
}
@keyframes jump {
  0% {
    transform: translateY(0) rotate(0);
  }
  50% {
    transform: translateY(-86px) rotate(-6deg);
  }
  100% {
    transform: translateY(0) rotate(0);
  }
}
.cheer {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: bob 1.2s ease-in-out infinite;
}
@keyframes bob {
  50% {
    translate: 0 -5px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .cheer {
    animation: none;
  }
}
</style>
