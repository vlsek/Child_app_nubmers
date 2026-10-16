<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Crocodile from '@/components/art/Crocodile.vue'
import Icon from '@/components/common/Icon.vue'
import { useAudio } from '@/composables/useAudio'
import { FIND_ROUNDS, buildRounds, findCardId, getFindLevel } from '@/data/findLevels'
import { getNumberLevel } from '@/data/numbersLevels'
import { useGameStore } from '@/stores/useGameStore'

const route = useRoute()
const router = useRouter()
const game = useGameStore()
const { say, sayNumber, sayPraise, sayRetry, stopVoice } = useAudio()

const index = computed(() => Number(route.params.level))
const level = computed(() => getFindLevel(index.value))

const rounds = ref(buildRounds(level.value?.max ?? 3))
const round = ref(0)
const done = ref(false)
/** Цифры, на которые малыш уже ошибся в этом раунде: они бледнеют. */
const wrong = ref<number[]>([])
/** Правильная цифра подсвечена, идёт похвала: тапы не принимаются. */
const solved = ref(false)

const current = computed(() => rounds.value[round.value])

let runId = 0
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** «Найди цифру … пять»: просьба и название цифры. */
async function ask(id = runId): Promise<void> {
  const c = current.value
  if (!c) return
  await say('find-digit')
  if (id !== runId) return
  await sayNumber(c.target)
}

async function start(): Promise<void> {
  runId++
  rounds.value = buildRounds(level.value?.max ?? 3)
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
    game.registerMistake('find')
    await sayRetry()
    if (id !== runId) return
    await ask(id)
    return
  }
  solved.value = true
  game.registerCorrect('find', `find-${index.value}-${c.target}`)
  await sayPraise()
  await sleep(400)
  if (id !== runId) return
  if (round.value + 1 >= FIND_ROUNDS) {
    done.value = true
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
  game.setMode('find')
  game.setMenuLevel('find', index.value)
  void start()
})
onBeforeUnmount(() => {
  runId++
  stopVoice()
})
</script>

<template>
  <main v-if="level && current" class="relative mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center gap-6 px-4 pt-32 pb-12">
    <button type="button" class="btn-round absolute left-4 top-4 sm:left-8 sm:top-8" aria-label="К машинкам" @click="back">
      <Icon name="back" />
    </button>
    <button
      type="button"
      class="btn-round absolute right-4 top-4 sm:right-8 sm:top-8"
      :aria-label="game.sound.muted ? 'Включить звук' : 'Выключить звук'"
      @click="game.toggleSound()"
    >
      <Icon :name="game.sound.muted ? 'mute' : 'sound'" />
    </button>

    <!-- Прогресс: звёздочки по числу раундов -->
    <div class="absolute left-1/2 top-28 flex -translate-x-1/2 gap-2 text-4xl sm:top-10" aria-hidden="true">
      <span
        v-for="r in FIND_ROUNDS"
        :key="r"
        class="transition-all duration-300"
        :class="r - 1 < round || done ? 'scale-110' : 'opacity-35 grayscale'"
      >
        <Icon name="star" />
      </span>
    </div>

    <Crocodile
      :mood="solved || done ? 'happy' : 'idle'"
      :mouth="solved ? 0.5 : 0"
      :look="0"
      class="pointer-events-none -mb-2 w-36 shrink-0 sm:w-52"
    />

    <template v-if="!done">
      <!-- Повтор вопроса: большая кнопка с динамиком -->
      <button type="button" class="btn-kid bg-tangerine shadow-kid-yellow !px-8 !py-5 !text-3xl" aria-label="Повторить вопрос" @click="ask(++runId)">
        <span class="text-5xl"><Icon name="sound" /></span>
      </button>

      <ul class="flex w-full flex-wrap items-center justify-center gap-4 sm:gap-8">
        <li v-for="n in current.options" :key="`${round}-${n}`" class="animate-pop">
          <button
            type="button"
            class="digit"
            :class="{ 'digit--wrong': wrong.includes(n), 'digit--right': solved && n === current.target }"
            :style="{
              background: getNumberLevel(n)!.color,
              boxShadow: `0 10px 0 0 ${getNumberLevel(n)!.shade}`,
            }"
            :aria-label="`Цифра ${n}`"
            @click="choose(n)"
          >
            {{ n }}
          </button>
        </li>
      </ul>
    </template>

    <!-- Уровень пройден -->
    <template v-else>
      <div class="animate-pop text-[8rem] leading-none"><Icon name="star" /></div>
      <div class="flex items-center gap-6">
        <button type="button" class="btn-round" aria-label="Ещё раз" @click="start"><Icon name="again" /></button>
        <button type="button" class="btn-kid bg-grass shadow-kid-green !px-8 !py-5" aria-label="К машинкам" @click="back">
          <Icon name="home" />
        </button>
        <button
          type="button"
          class="btn-round animate-wiggle disabled:opacity-40"
          :disabled="!hasNext"
          aria-label="Дальше"
          @click="goTo(index + 1)"
        >
          <Icon name="right" />
        </button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.digit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(11rem, 26vw);
  height: min(11rem, 26vw);
  min-width: 6.5rem;
  min-height: 6.5rem;
  border-radius: 9999px;
  color: #fff;
  font-size: min(6.5rem, 15vw);
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 4px 0 rgba(0, 0, 0, 0.2);
  transition: transform 0.1s, opacity 0.2s;
}
.digit:active {
  transform: translateY(8px);
}
.digit--wrong {
  opacity: 0.3;
  pointer-events: none;
}
.digit--right {
  animation: hop 0.6s ease-in-out 2;
}
</style>
