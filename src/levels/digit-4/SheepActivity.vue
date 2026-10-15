<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 4: «Крокодил засыпает и считает барашков».
 * Четыре барашка ждут у заборчика. Тап по барашку, он перепрыгивает забор и улетает
 * в облачко-сон над крокодилом, голос считает. Четвёртый барашек, и крокодил засыпает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const FENCE_X = 215
const LAND_X = 150
const STARTS = [282, 322, 362, 402]

/** jumped[i] — каким по счёту прыгнул барашек i (0 — ждёт). */
const jumped = ref<number[]>([0, 0, 0, 0])
const count = computed(() => jumped.value.filter(Boolean).length)
const asleep = computed(() => count.value >= 4)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('sheep-intro', 'Крокодил хочет спать. Посчитай барашков!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function jump(i: number): Promise<void> {
  if (jumped.value[i]) return
  const n = count.value + 1
  jumped.value[i] = n
  const said = sayNumber(n)
  if (n < 4) return
  await said
  await sleep(1300)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Посчитай барашков, пока крокодил засыпает">
    <defs>
      <g id="sheep-shape">
        <g stroke="#94a3b8" stroke-width="3" fill="#fff">
          <circle cx="-13" cy="2" r="11" />
          <circle cx="13" cy="2" r="11" />
          <circle cx="0" cy="-5" r="13" />
          <circle cx="0" cy="7" r="12" />
        </g>
        <ellipse cx="-17" cy="4" rx="8" ry="9" fill="#3f3f46" stroke="#18181b" stroke-width="2.5" />
        <circle cx="-20" cy="1" r="2" fill="#fff" />
        <path d="M-14 -4 l-6 -5 M-8 -6 l-1 -7" stroke="#3f3f46" stroke-width="4" stroke-linecap="round" />
        <path d="M-8 18 v8 M8 18 v8" stroke="#3f3f46" stroke-width="5" stroke-linecap="round" />
      </g>
    </defs>

    <!-- Луна -->
    <circle cx="398" cy="48" r="24" fill="#fef08a" />
    <circle cx="408" cy="42" r="21" fill="#7dd3fc" opacity=".55" />

    <!-- Облачко-сон: сюда «улетают» посчитанные барашки -->
    <g>
      <ellipse cx="118" cy="62" rx="100" ry="38" fill="#fff" opacity=".85" stroke="#cbd5e1" stroke-width="3" />
      <circle cx="42" cy="112" r="8" fill="#fff" opacity=".85" />
      <circle cx="26" cy="132" r="5" fill="#fff" opacity=".85" />
      <g v-for="k in 4" :key="k" :transform="`translate(${52 + (k - 1) * 48} 62)`">
        <circle r="19" fill="#e2e8f0" opacity=".7" />
        <g v-if="count >= k" class="pop"><use href="#sheep-shape" transform="scale(.6)" /></g>
      </g>
    </g>

    <!-- Земля и забор -->
    <rect x="-20" y="262" width="480" height="70" fill="#4ade80" />
    <rect x="-20" y="258" width="480" height="8" fill="#22c55e" />
    <g stroke="#7c4a1e" stroke-width="4" stroke-linecap="round" fill="#b9793a">
      <rect :x="FENCE_X - 22" y="196" width="12" height="68" rx="4" />
      <rect :x="FENCE_X + 10" y="196" width="12" height="68" rx="4" />
      <rect :x="FENCE_X - 34" y="212" width="80" height="10" rx="4" />
      <rect :x="FENCE_X - 34" y="238" width="80" height="10" rx="4" />
    </g>

    <!-- Крокодил в кроватке -->
    <g>
      <Crocodile x="-8" y="168" width="170" height="124" :mood="asleep ? 'sleep' : 'idle'" :mouth="0" :look="1" />
      <rect x="-10" y="244" width="170" height="30" rx="12" fill="#a78bfa" stroke="#6d28d9" stroke-width="4" />
      <rect x="-10" y="244" width="170" height="10" rx="5" fill="#c4b5fd" />
    </g>

    <!-- Барашки -->
    <g v-for="(x, i) in STARTS" :key="i" :transform="`translate(${x} 240)`">
      <g
        class="lamb"
        :class="{ jump: jumped[i], wait: !jumped[i] }"
        :style="{ '--dx': `${LAND_X - x}px`, animationDelay: jumped[i] ? '0s' : `${-i * 0.3}s` }"
        @click="jump(i)"
      >
        <use href="#sheep-shape" transform="scale(1.15)" />
        <circle r="38" fill="transparent" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.lamb {
  cursor: pointer;
}
.wait {
  animation: wait 1.2s ease-in-out infinite;
}
@keyframes wait {
  50% {
    transform: translateY(-5px);
  }
}
.jump {
  pointer-events: none;
  animation: jump 1s ease-in-out forwards;
}
@keyframes jump {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(calc(var(--dx) * 0.55), -95px);
  }
  85% {
    transform: translate(var(--dx), 0);
    opacity: 1;
  }
  100% {
    transform: translate(var(--dx), 0);
    opacity: 0;
  }
}
.pop {
  animation: pop 0.35s ease-out;
}
@keyframes pop {
  0% {
    transform: scale(0);
  }
  70% {
    transform: scale(1.25);
  }
}
@media (prefers-reduced-motion: reduce) {
  .wait {
    animation: none;
  }
}
</style>
