<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Crocodile from '@/components/art/Crocodile.vue'
import Confetti from '@/components/common/Confetti.vue'
import Icon from '@/components/common/Icon.vue'
import DigitTile from '@/views/find/DigitTile.vue'
import { animalSound, boing, fanfare } from '@/composables/synth'
import { useAudio } from '@/composables/useAudio'
import { FIND_GRASS_Y, FIND_ROUNDS, buildRounds, findCardId, findLayout, getFindLevel } from '@/data/findLevels'
import { getNumberLevel } from '@/data/numbersLevels'
import { useGameStore } from '@/stores/useGameStore'

const route = useRoute()
const router = useRouter()
const game = useGameStore()
const { say, sayNumber, sayPraise, sayRetry, stopVoice } = useAudio()

/** Портрет: сцена выше, плиток в ряду меньше. */
const portrait = ref(false)
let mq: MediaQueryList | null = null
const onMq = () => (portrait.value = !!mq?.matches)


const index = computed(() => Number(route.params.level))
const level = computed(() => getFindLevel(index.value))

const rounds = ref(buildRounds(level.value?.max ?? 3, level.value?.options))
const round = ref(0)
const done = ref(false)
/** Цифры, на которые малыш уже ошибся в этом раунде: они бледнеют. */
const wrong = ref<number[]>([])
/** Правильная цифра подсвечена, идёт похвала: тапы не принимаются. */
const solved = ref(false)
const burst = ref(0)

const current = computed(() => rounds.value[round.value])
const layout = computed(() => findLayout(level.value?.options ?? 3, portrait.value))
/** Мягкая подсказка: нужная плитка светится, крокодил смотрит на неё. */
const hint = ref(false)
let hintTimer: ReturnType<typeof setTimeout> | undefined
function armHint(): void {
  clearTimeout(hintTimer)
  hint.value = false
  hintTimer = setTimeout(() => (hint.value = true), 8000)
}
const targetIndex = computed(() => current.value?.options.indexOf(current.value.target) ?? -1)
const look = computed(() => {
  const spot = layout.value.spots[targetIndex.value]
  return hint.value && spot ? Math.max(-1, Math.min(1, (spot.cx - 95) / 160)) : 0.4
})
function stateOf(n: number): 'idle' | 'wrong' | 'right' | 'hint' {
  if (wrong.value.includes(n)) return 'wrong'
  if (n === current.value?.target) return solved.value ? 'right' : hint.value ? 'hint' : 'idle'
  return 'idle'
}

let runId = 0
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** «Найди цифру … пять»: просьба и название цифры. */
async function ask(id = runId): Promise<void> {
  const c = current.value
  if (!c) return
  armHint()
  await say(round.value % 2 ? 'show-digit' : 'find-digit')
  if (id !== runId) return
  await sayNumber(c.target)
}

async function start(): Promise<void> {
  runId++
  rounds.value = buildRounds(level.value?.max ?? 3, level.value?.options)
  round.value = 0
  done.value = false
  wrong.value = []
  solved.value = false
  await sleep(300)
  await ask()
}

async function choose(n: number): Promise<void> {
  const c = current.value
  if (!c || solved.value || done.value || wrong.value.includes(n)) return
  const id = ++runId
  if (n !== c.target) {
    // Мягкая ошибка: цифра бледнеет, повторяем вопрос; ничего не отнимаем.
    wrong.value.push(n)
    if (wrong.value.length >= 2) hint.value = true
    game.registerMistake('find')
    await sayRetry()
    if (id !== runId) return
    await ask(id)
    return
  }
  solved.value = true
  clearTimeout(hintTimer)
  hint.value = false
  burst.value++
  boing()
  animalSound(getNumberLevel(n)!.animal)
  game.registerCorrect('find', `find-${index.value}-${c.target}`)
  await sayPraise()
  await sleep(400)
  if (id !== runId) return
  if (round.value + 1 >= FIND_ROUNDS) {
    done.value = true
    fanfare()
    // Звезда за уровень отмечается в registerCorrect по id уровня.
    game.registerCorrect('find', findCardId(index.value))
    return
  }
  round.value++
  wrong.value = []
  solved.value = false
  await ask(id)
}

function goTo(i: number): void {
  router.push({ name: 'find-level', params: { level: i } })
}

function back(): void {
  router.push({ name: 'levels', params: { mode: 'find' } })
}

const hasNext = computed(() => !!getFindLevel(index.value + 1))

onMounted(() => {
  mq = window.matchMedia('(orientation: portrait)')
  onMq()
  mq.addEventListener('change', onMq)
  game.setMode('find')
  game.setMenuLevel('find', index.value)
  void start()
})
onBeforeUnmount(() => {
  clearTimeout(hintTimer)
  mq?.removeEventListener('change', onMq)
  runId++
  stopVoice()
})
</script>

<template>
  <main v-if="level && current" class="relative mx-auto flex h-full w-full max-w-5xl flex-col px-2">
    <Confetti :burst="burst" :big="done" />
    <!-- Шапка: назад, прогресс-звёздочки, звук -->
    <header class="relative z-10 flex h-24 shrink-0 items-center justify-between px-2 pt-2 [@media(max-height:500px)]:h-16">
      <button type="button" class="btn-round" aria-label="К машинкам" @click="back"><Icon name="back" /></button>
      <div class="flex gap-1 text-2xl sm:gap-2 sm:text-4xl [@media(max-height:500px)]:text-3xl" aria-hidden="true">
        <span v-for="r in FIND_ROUNDS" :key="r" class="transition-all duration-300" :class="r - 1 < round || done ? 'scale-110' : 'opacity-35 grayscale'">
          <Icon name="star" />
        </span>
      </div>
      <button type="button" class="btn-round" :aria-label="game.sound.muted ? 'Включить звук' : 'Выключить звук'" @click="game.toggleSound()">
        <Icon :name="game.sound.muted ? 'mute' : 'sound'" />
      </button>
    </header>

    <!-- Сцена: трава на всю ширину, крокодил спрашивает, звери держат таблички -->
    <svg
      v-if="!done"
      :viewBox="`0 0 440 ${layout.height}`"
      preserveAspectRatio="xMidYMax meet"
      class="min-h-0 w-full flex-1 touch-none overflow-visible"
      role="group"
      aria-label="Найди цифру"
    >
      <rect x="-800" :y="FIND_GRASS_Y" width="2040" height="1400" fill="#4ade80" />
      <rect x="-800" :y="FIND_GRASS_Y - 4" width="2040" height="8" fill="#22c55e" />
      <Crocodile x="24" :y="FIND_GRASS_Y - 90" width="124" height="90" :mood="solved ? 'happy' : 'idle'" :mouth="solved ? 0.5 : 0" :look="look" class="pointer-events-none" />
      <!-- Повтор вопроса: крупная кнопка с динамиком -->
      <g role="button" tabindex="0" aria-label="Повторить вопрос" class="cursor-pointer" @click="ask(++runId)" @keydown.enter.prevent="ask(++runId)">
        <circle cx="206" cy="58" r="34" fill="#d97706" transform="translate(0 4)" />
        <circle cx="206" cy="58" r="34" fill="#fb923c" stroke="#fff" stroke-width="4" />
        <path d="M192 52h8l11-9v30l-11-9h-8z" fill="#fff" />
        <path d="M219 50q7 8 0 16M225 44q13 14 0 28" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" />
      </g>
      <template v-for="(n, i) in current.options" :key="`${round}-${n}`">
        <DigitTile :n="n" :cx="layout.spots[i]!.cx" :ground="layout.spots[i]!.ground" :w="layout.w" :order="i" :state="stateOf(n)" @pick="choose" />
      </template>
    </svg>

    <!-- Уровень пройден -->
    <div v-else class="flex flex-1 flex-col items-center justify-center gap-4">
      <Crocodile class="w-[min(16rem,40vh,70vw)] animate-pop" mood="happy" :mouth="0.4" />
      <div class="animate-pop text-[6rem] leading-none [@media(max-height:500px)]:text-[4rem]"><Icon name="star" /></div>
      <div class="flex items-center gap-6">
        <button type="button" class="btn-round" aria-label="Ещё раз" @click="start"><Icon name="again" /></button>
        <button type="button" class="btn-kid bg-grass shadow-kid-green !px-8 !py-5" aria-label="К машинкам" @click="back"><Icon name="home" /></button>
        <button type="button" class="btn-round animate-wiggle disabled:opacity-40" :disabled="!hasNext" aria-label="Дальше" @click="goTo(index + 1)"><Icon name="right" /></button>
      </div>
    </div>
  </main>
</template>
