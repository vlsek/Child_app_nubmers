<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import Confetti from '@/components/common/Confetti.vue'
import Icon from '@/components/common/Icon.vue'
import { animalSound, boing, fanfare } from '@/composables/synth'
import { useAudio } from '@/composables/useAudio'
import { shuffle } from '@/data/findLevels'
import { NUMBER_LEVELS, getNumberLevel } from '@/data/numbersLevels'
import { glyphFor } from '@/levels/shared/digitPaths'
import { useGameStore } from '@/stores/useGameStore'

/**
 * Режим «Сколько?» (маршрут /howmany): на траве стоят N зверей, внизу три цифры.
 * Тап по зверю: он подпрыгивает, голос считает по порядку. Нужно выбрать цифру-ответ.
 * Ошибка не наказывается: цифра бледнеет, вопрос звучит снова.
 */
const router = useRouter()
const game = useGameStore()
const { say, sayNumber, sayPraise, sayRetry, stopVoice } = useAudio()

const ROUNDS = 5
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))

interface Round { target: number; kind: (typeof NUMBER_LEVELS)[number]['animal']; options: number[] }
/** От простого к сложному: 1–3, 1–3, 2–5, 4–7, 6–10. */
function buildRounds(): Round[] {
  const ranges: [number, number][] = [[1, 3], [1, 3], [2, 5], [4, 7], [6, 10]]
  let prev = 0
  return ranges.map(([a, b]) => {
    let target = rnd(a, b)
    if (target === prev) target = target === b ? a : target + 1
    prev = target
    const near = shuffle([-3, -2, -1, 1, 2, 3].map((d) => target + d).filter((v) => v >= 1 && v <= 10)).slice(0, 2)
    const kind = NUMBER_LEVELS[rnd(0, 9)]!.animal
    return { target, kind, options: shuffle([target, ...near]) }
  })
}

const rounds = ref(buildRounds())
const round = ref(0)
const done = ref(false)
const solved = ref(false)
const wrong = ref<number[]>([])
const counted = ref<number[]>([])
const burst = ref(0)
const hop = ref<number | null>(null)
const current = computed(() => rounds.value[round.value]!)

/** Звери в один или два ряда, по центру. */
/** Когда зверей мало, рисуем их крупнее. */
const size = computed(() => (current.value.target <= 3 ? 1.45 : current.value.target <= 5 ? 1.12 : 1))
const spots = computed(() => {
  const n = current.value.target
  const rows = n <= 5 ? [n] : [Math.ceil(n / 2), Math.floor(n / 2)]
  const out: { x: number; y: number }[] = []
  rows.forEach((k, r) => {
    for (let i = 0; i < k; i++) out.push({ x: 220 + (i - (k - 1) / 2) * 76 * size.value, y: rows.length === 1 ? 195 : 150 + r * 62 })
  })
  return out
})
const ANSWER_X = [110, 220, 330]

let runId = 0
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const ask = async (id = runId) => {
  await say('how-many')
  if (id !== runId) return
}

async function begin(): Promise<void> {
  runId++
  rounds.value = buildRounds()
  round.value = 0
  done.value = false
  solved.value = false
  wrong.value = []
  counted.value = []
  await sleep(300)
  await ask()
}

function touchAnimal(i: number): void {
  if (solved.value) return
  const n = counted.value.includes(i) ? counted.value.indexOf(i) + 1 : counted.value.length + 1
  if (!counted.value.includes(i)) counted.value.push(i)
  hop.value = i
  setTimeout(() => (hop.value = null), 450)
  animalSound(current.value.kind)
  void sayNumber(n)
}

async function choose(n: number): Promise<void> {
  if (solved.value || done.value || wrong.value.includes(n)) return
  const id = ++runId
  if (n !== current.value.target) {
    wrong.value.push(n)
    await sayRetry()
    if (id !== runId) return
    await ask(id)
    return
  }
  solved.value = true
  burst.value++
  boing()
  await sayNumber(n)
  await sayPraise()
  await sleep(500)
  if (id !== runId) return
  if (round.value + 1 >= ROUNDS) {
    done.value = true
    fanfare()
    return
  }
  round.value++
  solved.value = false
  wrong.value = []
  counted.value = []
  await ask(id)
}

const back = () => router.push({ name: 'modes' })
onMounted(() => {
  game.setMode(null)
  void begin()
})
onBeforeUnmount(() => {
  runId++
  stopVoice()
})
</script>

<template>
  <main class="relative mx-auto flex h-full w-full max-w-5xl flex-col px-2">
    <Confetti :burst="burst" :big="done" />
    <header class="relative z-10 flex h-24 shrink-0 items-center justify-between px-2 pt-2 [@media(max-height:500px)]:h-16">
      <button type="button" class="btn-round" aria-label="Назад" @click="back"><Icon name="back" /></button>
      <div class="flex gap-1 text-2xl sm:gap-2 sm:text-4xl [@media(max-height:500px)]:text-3xl" aria-hidden="true">
        <span v-for="r in ROUNDS" :key="r" class="transition-all duration-300" :class="r - 1 < round || done ? 'scale-110' : 'opacity-35 grayscale'"><Icon name="star" /></span>
      </div>
      <button type="button" class="btn-round" :aria-label="game.sound.muted ? 'Включить звук' : 'Выключить звук'" @click="game.toggleSound()">
        <Icon :name="game.sound.muted ? 'mute' : 'sound'" />
      </button>
    </header>

    <svg v-if="!done" viewBox="0 0 440 330" preserveAspectRatio="xMidYMax meet" class="min-h-0 w-full flex-1 touch-none overflow-visible" role="group" aria-label="Сколько?">
      <rect x="-800" y="86" width="2040" height="1400" fill="#4ade80" />
      <rect x="-800" y="82" width="2040" height="8" fill="#22c55e" />
      <Crocodile x="24" y="2" width="124" height="90" :mood="solved ? 'happy' : 'idle'" :mouth="solved ? 0.5 : 0" :look="0.4" class="pointer-events-none" />
      <g role="button" tabindex="0" aria-label="Повторить вопрос" class="cursor-pointer" @click="ask(++runId)">
        <circle cx="206" cy="44" r="30" fill="#d97706" transform="translate(0 4)" />
        <circle cx="206" cy="44" r="30" fill="#fb923c" stroke="#fff" stroke-width="4" />
        <path d="M193 38h7l10-8v28l-10-8h-7z" fill="#fff" />
        <path d="M217 37q6 7 0 14M222 32q11 12 0 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" />
      </g>

      <!-- Звери, которых считаем -->
      <template v-for="(s, i) in spots" :key="`${round}-${i}`">
        <g :transform="`translate(${s.x} ${s.y})`">
          <ellipse cx="0" cy="2" :rx="30 * size" :ry="5 * size" fill="#15803d" opacity=".35" />
          <g class="animal" :class="{ hop: hop === i, counted: counted.includes(i) }" :style="{ animationDelay: `${i * 70}ms` }" role="button" tabindex="0" :aria-label="`Зверь ${i + 1}`" @click="touchAnimal(i)">
            <AnimalFigure :kind="current.kind" :variant="i + 1" :flip="s.x > 220" :mood="solved ? 'happy' : 'idle'" :x="-36 * size" :y="-50 * size" :width="72 * size" :height="52 * size" />
            <rect :x="-38 * size" :y="-54 * size" :width="76 * size" :height="58 * size" fill="transparent" />
          </g>
        </g>
      </template>

      <!-- Ответы: цифры, нарисованные линией -->
      <template v-for="(n, i) in current.options" :key="`a${round}-${n}`">
        <g :transform="`translate(${ANSWER_X[i]} 292)`">
          <g class="answer" :class="{ wrong: wrong.includes(n), right: solved && n === current.target }" role="button" tabindex="0" :aria-label="`Цифра ${n}`" @click="choose(n)">
            <circle r="36" cy="4" :fill="getNumberLevel(n)!.shade" />
            <circle r="36" :fill="getNumberLevel(n)!.color" stroke="#fff" stroke-width="4" />
            <g :transform="`translate(${-(glyphFor(n).width * 0.3) / 2} -21) scale(0.3)`" fill="none" stroke="#fff" stroke-width="17" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="(d, k) in glyphFor(n).strokes" :key="k" :d="d" />
            </g>
          </g>
        </g>
      </template>
    </svg>

    <div v-else class="flex flex-1 flex-col items-center justify-center gap-4">
      <Crocodile class="w-[min(16rem,40vh,70vw)] animate-pop" mood="happy" :mouth="0.4" />
      <div class="animate-pop text-[6rem] leading-none [@media(max-height:500px)]:text-[4rem]"><Icon name="star" /></div>
      <div class="flex items-center gap-6">
        <button type="button" class="btn-round" aria-label="Ещё раз" @click="begin"><Icon name="again" /></button>
        <button type="button" class="btn-kid bg-grass shadow-kid-green !px-8 !py-5" aria-label="Домой" @click="back"><Icon name="home" /></button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.animal,
.answer {
  cursor: pointer;
  outline: none;
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: pop-in 0.4s cubic-bezier(0.2, 1.4, 0.4, 1) both;
}
.animal.hop {
  animation: hop-up 0.45s ease-out;
}
.animal.counted {
  filter: drop-shadow(0 0 6px #fde047);
}
.answer.wrong {
  opacity: 0.3;
  pointer-events: none;
}
.answer.right {
  animation: hop-up 0.7s ease-in-out 2;
  filter: drop-shadow(0 0 10px #fde047);
}
@keyframes pop-in {
  from { transform: scale(0.2); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes hop-up {
  40% { transform: translateY(-14px) scale(1.06); }
}
@media (prefers-reduced-motion: reduce) {
  .animal, .answer { animation: none; }
}
</style>
