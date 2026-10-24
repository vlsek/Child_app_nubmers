<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Crocodile from '@/components/art/Crocodile.vue'
import Confetti from '@/components/common/Confetti.vue'
import Icon from '@/components/common/Icon.vue'
import { useAudio } from '@/composables/useAudio'
import { fanfare } from '@/composables/synth'
import { getNumberLevel } from '@/data/numbersLevels'
import { activitiesFor } from '@/levels/registry'
import { useGameStore } from '@/stores/useGameStore'

/**
 * Уровень цифры: нажали на машинку, и задания идут по очереди.
 * Если малышу долго не удаётся, появляется кнопка «пропустить».
 * Сами задания — компоненты из реестра (`src/levels/registry.ts`), им нужно лишь `emit('complete')`.
 */
const SKIP_AFTER_MS = 20_000
/** Через столько без касаний предметы начинают подсвечиваться: «возьми меня». */
const HINT_AFTER_MS = 6_000

const route = useRoute()
const router = useRouter()
const game = useGameStore()
const { sayPraise, sayNumber, stopVoice } = useAudio()

const value = computed(() => Number(route.params.level))
const level = computed(() => getNumberLevel(value.value)!)
const list = computed(() => activitiesFor(value.value))
const views = computed(() => list.value.map((a) => defineAsyncComponent(a.component)))

const step = ref(0)
const solved = ref<boolean[]>([])
const finished = ref(false)
const burst = ref(0)
const showSkip = ref(false)
/** Меняется при «ещё раз»: всё начинается заново. */
const round = ref(0)

let timer: ReturnType<typeof setTimeout> | undefined
let hintTimer: ReturnType<typeof setTimeout> | undefined
const hint = ref(false)
let runId = 0
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Искорки под пальцем: любое касание сцены чуть «отзывается». */
const sparks = ref<{ id: number; x: number; y: number }[]>([])
let sparkId = 0
function spark(e: PointerEvent): void {
  const box = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const id = ++sparkId
  sparks.value.push({ id, x: e.clientX - box.left, y: e.clientY - box.top })
  if (sparks.value.length > 6) sparks.value.shift()
  setTimeout(() => (sparks.value = sparks.value.filter((s) => s.id !== id)), 650)
}

function armHint(): void {
  clearTimeout(hintTimer)
  hint.value = false
  hintTimer = setTimeout(() => (hint.value = true), HINT_AFTER_MS)
}

function armSkip(): void {
  armHint()
  clearTimeout(timer)
  showSkip.value = false
  timer = setTimeout(() => (showSkip.value = true), SKIP_AFTER_MS)
}

function restart(first = false): void {
  runId++
  stopVoice()
  // ?step=K: открыть уровень сразу с задания K (для проверки заданий разработчиками)
  const from = first ? Number(route.query.step) : 0
  step.value = Number.isInteger(from) ? Math.min(Math.max(from, 0), list.value.length - 1) : 0
  solved.value = list.value.map(() => false)
  finished.value = false
  round.value++
  armSkip()
}

function advance(): void {
  if (step.value + 1 >= list.value.length) {
    finished.value = true
    burst.value++
    showSkip.value = false
    clearTimeout(timer)
    void sayNumber(value.value)
  } else {
    step.value++
    armSkip()
  }
}

async function onComplete(): Promise<void> {
  if (solved.value[step.value]) return
  const id = ++runId
  solved.value[step.value] = true
  burst.value++
  fanfare()
  game.completeActivity(value.value, list.value[step.value]!.id)
  clearTimeout(timer)
  showSkip.value = false
  await sayPraise()
  await sleep(500)
  if (id === runId) advance()
}

function skip(): void {
  runId++
  stopVoice()
  advance()
}

watch(value, () => restart())
onMounted(() => {
  game.setMode('learn')
  game.setMenuLevel('learn', value.value)
  restart(true)
})
onBeforeUnmount(() => {
  runId++
  clearTimeout(timer)
  clearTimeout(hintTimer)
  stopVoice()
})

/** Просим браузер развернуть экран: работает на Android в полноэкранном режиме, на iOS молча ничего не делает. */
async function rotateScreen(): Promise<void> {
  try {
    await document.documentElement.requestFullscreen?.()
    await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape')
  } catch {
    /* не поддерживается: ребёнок (или родитель) повернёт телефон сам */
  }
}

const toCars = () => router.push({ name: 'levels', params: { mode: 'learn' } })
</script>

<template>
  <main class="relative mx-auto flex h-full w-full max-w-4xl flex-col px-4 [@media(orientation:portrait)]:px-0 pb-6 pt-28 [@media(max-height:500px)]:pb-2 [@media(max-height:500px)]:pt-12">
    <Confetti :burst="burst" :big="finished" />
    <button type="button" class="btn-round absolute left-4 top-4 z-30 sm:left-8 sm:top-8" aria-label="К машинкам" @click="toCars">
      <Icon name="back" />
    </button>
    <button
      type="button"
      class="btn-round absolute right-4 top-4 z-30 sm:right-8 sm:top-8"
      :aria-label="game.sound.muted ? 'Включить звук' : 'Выключить звук'"
      @click="game.toggleSound()"
    >
      <Icon :name="game.sound.muted ? 'mute' : 'sound'" />
    </button>

    <!-- Где мы: по кружку на каждое задание -->
    <div class="absolute left-1/2 top-8 z-20 flex -translate-x-1/2 items-center gap-3 sm:top-12" aria-hidden="true">
      <span
        v-for="(a, i) in list"
        :key="a.id"
        class="block rounded-full border-4 border-white transition-all duration-300"
        :class="[
          i === step && !finished ? 'h-7 w-7 bg-white' : 'h-5 w-5',
          solved[i] ? 'bg-yellow-300' : i === step && !finished ? '' : 'bg-white/40',
        ]"
      />
    </div>

    <div v-if="!finished" class="relative min-h-0 flex-1 [&_svg]:overflow-visible [@media(max-height:500px)]:pt-9" :class="{ 'hint-idle': hint }" @pointerdown.capture="armHint(); spark($event)">
      <Transition name="page" mode="out-in">
        <component :is="views[step]" :key="`${round}-${step}`" :level="level" @complete="onComplete" />
      </Transition>
      <span v-for="s in sparks" :key="s.id" class="tap-spark pointer-events-none absolute z-20" :style="{ left: s.x + 'px', top: s.y + 'px' }" />
    </div>

    <!-- Конец уровня -->
    <div v-else class="flex flex-1 flex-col items-center justify-center gap-6">
      <Crocodile class="w-[min(20rem,70vw)] animate-pop" mood="happy" :mouth="0.4" />
      <div class="animate-pop text-8xl"><Icon name="star" /></div>
      <div class="flex items-center gap-5">
        <button type="button" class="btn-round" aria-label="Ещё раз" @click="restart()"><Icon name="again" /></button>
        <button type="button" class="btn-kid bg-grass shadow-kid-green !px-8 !py-5" aria-label="К машинкам" @click="toCars">
          <Icon name="home" />
        </button>
      </div>
    </div>

    <!-- В портрете сцены мелкие: значок «поверни телефон» (на Android ещё и пробует развернуть экран сам) -->
    <button
      v-if="!finished"
      type="button"
      class="btn-round absolute bottom-6 left-4 z-30 hidden [@media(orientation:portrait)_and_(max-width:700px)]:flex"
      aria-label="Повернуть экран"
      @click="rotateScreen"
    >
      <svg viewBox="0 0 48 48" class="h-9 w-9" aria-hidden="true">
        <g class="rotate-hint">
          <rect x="15" y="8" width="18" height="32" rx="4" fill="#38bdf8" stroke="#0369a1" stroke-width="3" />
          <rect x="19" y="13" width="10" height="20" rx="1.5" fill="#e0f2fe" />
        </g>
        <path d="M6 14 q-2 10 6 14 M12 28 l-1 -7 M12 28 l7 -1" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <!-- Не получается: можно пропустить задание -->
    <Transition name="page">
      <button
        v-if="showSkip && !finished"
        type="button"
        class="btn-round absolute bottom-6 right-4 z-30 animate-wiggle sm:right-8"
        aria-label="Пропустить"
        @click="skip"
      >
        <Icon name="right" />
      </button>
    </Transition>
  </main>
</template>

<style scoped>
.rotate-hint {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: rotate-hint 2.4s ease-in-out infinite;
}
@keyframes rotate-hint {
  0%,
  25% {
    transform: rotate(0);
  }
  60%,
  100% {
    transform: rotate(-90deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .rotate-hint {
    animation: none;
  }
}
</style>
