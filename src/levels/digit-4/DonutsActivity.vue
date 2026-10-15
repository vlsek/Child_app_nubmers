<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 4: «Накорми крокодила четырьмя пончиками».
 * На тарелке шесть пончиков, а крокодил хочет ровно четыре: тап по пончику — он летит
 * в пасть, голос считает. После четвёртого крокодил сыт, оставшиеся пончики тускнеют.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const WANT = 4
const COLORS = ['#f9a8d4', '#fde68a', '#a5f3fc', '#fda4af', '#bef264', '#ddd6fe']
const PLATE = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 296 + (i % 3) * 56, y: 150 + Math.floor(i / 3) * 80, color: COLORS[i]! }))
/** Куда летит пончик: пасть крокодила. */
const MOUTH = { x: 205, y: 236 }

/** eaten[i] — каким по счёту съеден пончик i (0 — лежит на тарелке). */
const eaten = ref<number[]>(PLATE.map(() => 0))
/** Пончик в полёте к пасти. */
const flying = ref<number | null>(null)
const eatenCount = computed(() => eaten.value.filter(Boolean).length)
const full = computed(() => eatenCount.value >= WANT)
const mouth = ref(0)
const shake = ref(false)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Плавно меняет открытость пасти. */
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

onMounted(() => void sayLine('donuts-intro', 'Я хочу четыре пончика!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function feed(i: number): Promise<void> {
  if (eaten.value[i] || flying.value !== null) return
  if (full.value) {
    // Крокодил сыт: мягко отказывается.
    shake.value = true
    setTimeout(() => (shake.value = false), 500)
    void sayLine('donuts-full', 'Хватит, я наелся!')
    return
  }
  flying.value = i
  void tweenMouth(1, 350)
  await sleep(420)
  if (!alive) return
  const n = eatenCount.value + 1
  eaten.value[i] = n
  flying.value = null
  const said = sayNumber(n)
  await tweenMouth(0, 220)
  if (n < WANT) return
  await said
  await sleep(300)
  if (alive) emit('complete')
}

function flightStyle(i: number): Record<string, string> {
  const p = PLATE[i]!
  if (flying.value === i) {
    return { transform: `translate(${MOUTH.x}px, ${MOUTH.y}px) scale(.45)`, transition: 'transform .42s ease-in' }
  }
  return { transform: `translate(${p.x}px, ${p.y}px) scale(1)`, transition: 'none' }
}

</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Накорми крокодила четырьмя пончиками">
    <!-- Табло: сколько уже съедено из четырёх -->
    <g>
      <g v-for="k in WANT" :key="k" :transform="`translate(${110 + (k - 1) * 62} 40)`">
        <circle r="22" fill="#fff" opacity=".6" stroke="#94a3b8" stroke-width="3" stroke-dasharray="5 5" />
        <g v-if="eatenCount >= k" class="pop">
          <circle r="18" fill="#f9a8d4" stroke="#be185d" stroke-width="3" />
          <circle r="6" fill="#bae6fd" stroke="#be185d" stroke-width="2.5" />
        </g>
      </g>
    </g>

    <!-- Крокодил: толстеет с каждым пончиком -->
    <g :style="{ transform: `scale(${1 + eatenCount * 0.025})`, transformOrigin: '110px 300px', transition: 'transform .3s' }" :class="{ shake }">
      <Crocodile x="0" y="140" width="240" height="175" :mood="full ? 'happy' : 'idle'" :mouth="mouth" :look="1" />
    </g>

    <!-- Друг приносит пончики -->
    <g transform="translate(346 14) scale(.62)" class="friend"><AnimalHead :kind="level.animal" /></g>

    <!-- Тарелка -->
    <rect x="262" y="110" width="176" height="180" rx="34" fill="#fff" opacity=".85" stroke="#cbd5e1" stroke-width="4" />

    <!-- Пончики -->
    <g
      v-for="(d, i) in PLATE"
      :key="i"
      v-show="!eaten[i]"
      class="donut"
      :class="{ 'donut--off': full && flying !== i }"
      :style="flightStyle(i)"
      @click="feed(i)"
    >
      <circle r="27" fill="#d9954f" stroke="#8a4b16" stroke-width="3.5" />
      <path d="M0 -23 a23 23 0 1 0 .01 0Z M0 -8 a8 8 0 1 1 -.01 0Z" fill-rule="evenodd" :fill="d.color" stroke="#8a4b16" stroke-width="2.5" />
      <g stroke-width="3.5" stroke-linecap="round">
        <path d="M-14 -8 l5 -3" stroke="#fff" />
        <path d="M10 -14 l5 3" stroke="#3b82f6" />
        <path d="M14 8 l-5 4" stroke="#fff" />
        <path d="M-12 12 l-5 -3" stroke="#22c55e" />
        <path d="M-2 18 l5 1" stroke="#eab308" />
      </g>
      <circle r="38" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.donut {
  cursor: pointer;
  transform-box: view-box;
}
.donut--off {
  opacity: 0.35;
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
.shake {
  animation: shake 0.45s;
}
@keyframes shake {
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}
.friend {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: cheer 1.2s ease-in-out infinite;
}
@keyframes cheer {
  50% {
    translate: 0 -5px;
  }
}
</style>
