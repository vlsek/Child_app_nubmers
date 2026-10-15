<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Crocodile from '@/components/art/Crocodile.vue'
import Icon from '@/components/common/Icon.vue'
import { useAudio } from '@/composables/useAudio'
import { getNumberLevel } from '@/data/numbersLevels'
import { activitiesFor } from '@/levels/registry'
import { useGameStore } from '@/stores/useGameStore'

/**
 * Уровень цифры: нажали на машинку, и задания идут по очереди.
 * Если малышу долго не удаётся, появляется кнопка «пропустить».
 * Сами задания — компоненты из реестра (`src/levels/registry.ts`), им нужно лишь `emit('complete')`.
 */
const SKIP_AFTER_MS = 20_000

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
const showSkip = ref(false)
/** Меняется при «ещё раз»: всё начинается заново. */
const round = ref(0)

let timer: ReturnType<typeof setTimeout> | undefined
let runId = 0
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function armSkip(): void {
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
  stopVoice()
})

const toCars = () => router.push({ name: 'levels', params: { mode: 'learn' } })
</script>

<template>
  <main class="relative mx-auto flex h-full w-full max-w-4xl flex-col px-4 pb-6 pt-28">
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

    <div v-if="!finished" class="relative min-h-0 flex-1">
      <Transition name="page" mode="out-in">
        <component :is="views[step]" :key="`${round}-${step}`" :level="level" @complete="onComplete" />
      </Transition>
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
