<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Icon from '@/components/common/Icon.vue'
import { useAudio } from '@/composables/useAudio'
import {
  MAX_LEVEL,
  MIN_LEVEL,
  animalColumns,
  getNumberLevel,
  numberCardId,
} from '@/data/numbersLevels'
import { useGameStore } from '@/stores/useGameStore'

const route = useRoute()
const router = useRouter()
const game = useGameStore()
const { say, sayNumber, sayPraise, stopVoice } = useAudio()

const level = computed(() => getNumberLevel(Number(route.params.level)))
const total = computed(() => level.value?.value ?? 0)

const prevValue = computed(() =>
  level.value && level.value.value > MIN_LEVEL ? level.value.value - 1 : null,
)
const nextValue = computed(() =>
  level.value && level.value.value < MAX_LEVEL ? level.value.value + 1 : null,
)

// --- Счёт зверей ---------------------------------------------------------

/** order[i] — каким по счёту посчитан зверь i (0 — его ещё не считали). */
const order = ref<number[]>([])
const counted = computed(() => order.value.filter(Boolean).length)
const allCounted = computed(() => total.value > 0 && counted.value === total.value)
/** Малыш сам досчитал до конца: цифра подпрыгивает, пока звучит похвала. */
const celebrate = ref(false)
/** Уровень уже пройден: на цифре горит звезда (как на машине в пробке). */
const learned = computed(() =>
  game.progress.learn.learnedIds.includes(numberCardId(total.value)),
)

/**
 * Любое новое действие (другой уровень, повторный счёт, уход с экрана) увеличивает
 * runId, и все ожидающие паузы прежнего действия тихо прекращаются.
 */
let runId = 0
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function resetCount(): void {
  runId++
  celebrate.value = false
  order.value = Array.from({ length: total.value }, () => 0)
}

/** Малыш тапает зверя: считаем «один, два, три…» в том порядке, в каком он тапает. */
async function countAnimal(index: number): Promise<void> {
  if (!level.value) return
  // Все уже посчитаны (например, после «посчитай вслух»): начинаем счёт заново.
  if (allCounted.value) resetCount()
  if (order.value[index]) return // этого зверя уже посчитали

  // Тап малыша важнее показа «посчитай вслух»: останавливаем его, считаем сами.
  const id = ++runId
  const n = counted.value + 1
  order.value[index] = n
  const said = sayNumber(n)
  if (n < total.value) return

  // Досчитал до конца: звезда на машину (один раз за уровень), затем похвала голосом.
  celebrate.value = true
  if (!learned.value) game.registerCorrect('learn', numberCardId(total.value))
  await said
  await sleep(300)
  if (id !== runId) return
  await sayPraise()
  await sleep(500)
  if (id === runId) celebrate.value = false
}

/** Тап по цифре: «Посчитаем вместе!» и зверей вслух по одному, малыш смотрит и слушает. */
async function countAloud(): Promise<void> {
  const current = level.value
  if (!current) return
  resetCount()
  const id = runId
  await say('count-together')
  await sleep(250)
  for (let n = 1; n <= current.value; n++) {
    if (id !== runId) return
    order.value[n - 1] = n
    // Не быстрее 0,8 с на зверя: тишина (mute) не должна «проматывать» счёт
    await Promise.all([sayNumber(n), sleep(800)])
  }
}

// --- Жизненный цикл и навигация -----------------------------------------

onMounted(() => game.setMode('learn'))

// Называем число при входе на уровень и при переходе к соседнему.
watch(
  level,
  (current) => {
    resetCount()
    if (current) {
      game.setMenuLevel('learn', current.value) // вернувшись в пробку, увидим эту же машину
      void sayNumber(current.value)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  runId++
  stopVoice()
})

// Размер зверей зависит от их числа: единицу и тройку можно показать крупно,
// а десять должны уместиться на экране без прокрутки (даже на телефоне).
const animalFont = computed(() => {
  const n = total.value || 1
  if (n <= 3) return 'min(9rem, 13vh, 22vw)'
  if (n <= 6) return 'min(7.5rem, 11vh, 16vw)'
  return 'min(6rem, 9vh, 12vw)'
})
const columns = computed(() => animalColumns(total.value || 1))

function goTo(value: number): void {
  router.push({ name: 'learn-level', params: { level: value } })
}

function backToCars(): void {
  router.push({ name: 'levels', params: { mode: 'learn' } })
}
</script>

<template>
  <main
    v-if="level"
    class="relative mx-auto flex min-h-full w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 pb-6 pt-24 sm:gap-6"
  >
    <!-- Кнопки в углах, чтобы не отнимать высоту: экран без прокрутки на планшете -->
    <button
      type="button"
      class="btn-round absolute left-4 top-4 sm:left-8 sm:top-8"
      aria-label="К машинкам"
      @click="backToCars"
    >
      <Icon name="back" />
    </button>

    <button
      type="button"
      class="btn-round absolute right-4 top-4 sm:right-8 sm:top-8"
      :aria-label="game.sound.muted ? 'Включить звук' : 'Выключить звук'"
      :aria-pressed="game.sound.muted"
      @click="game.toggleSound()"
    >
      <Icon :name="game.sound.muted ? 'mute' : 'sound'" />
    </button>

    <!-- Цифра: тап по ней считает зверей вслух -->
    <button
      :key="level.value"
      type="button"
      class="relative flex h-[min(20rem,28vh)] w-[min(20rem,28vh)] animate-pop items-center justify-center rounded-full transition-transform duration-100 active:translate-y-2"
      :style="{ background: level.color, boxShadow: `0 12px 0 0 ${level.shade}` }"
      :aria-label="`Цифра ${level.value}, ${level.word}. Нажми, чтобы посчитать вслух`"
      @click="countAloud"
    >
      <span
        class="inline-block text-[min(13rem,18vh)] font-black leading-none text-white drop-shadow-[0_6px_0_rgba(0,0,0,0.2)]"
        :class="{ 'animate-hop': celebrate }"
        aria-hidden="true"
      >
        {{ level.value }}
      </span>

      <!-- Звезда за пройденный уровень: такая же, как на машине в пробке -->
      <span
        v-if="learned"
        class="absolute -right-[4%] -top-[4%] animate-pop text-[min(7rem,14vh)] leading-none drop-shadow-[0_6px_0_rgba(0,0,0,0.25)]"
        aria-hidden="true"
        ><Icon name="star"
      /></span>
    </button>

    <!-- Звери: тап по зверю считает его, на посчитанном появляется номер -->
    <ul
      class="flex flex-wrap justify-center gap-y-[0.1em] leading-none"
      :style="{ fontSize: animalFont, width: `${columns * 1.3}em` }"
      :aria-label="`${level.value} — ${level.animalName}`"
    >
      <li
        v-for="n in level.value"
        :key="`${level.value}-${n}`"
        class="w-[1.3em] animate-pop"
        :style="{ animationDelay: `${n * 90}ms` }"
      >
        <button
          type="button"
          class="relative block w-full text-center transition-transform duration-100 active:scale-90"
          :class="order[n - 1] ? 'animate-hop drop-shadow-[0_0_0.12em_rgba(250,204,21,1)]' : ''"
          :aria-label="order[n - 1] ? `Посчитан: ${order[n - 1]}` : 'Посчитать'"
          @click="countAnimal(n - 1)"
        >
          <svg viewBox="0 0 100 100" class="block h-[1.15em] w-full" aria-hidden="true">
            <AnimalHead :kind="level.animal" />
          </svg>
          <span
            v-if="order[n - 1]"
            class="absolute -right-[0.18em] -top-[0.18em] flex h-[1.6em] w-[1.6em] items-center justify-center rounded-full bg-white text-[0.28em] font-black leading-none text-slate-700 shadow-md"
            aria-hidden="true"
          >
            {{ order[n - 1] }}
          </span>
        </button>
      </li>
    </ul>

    <p class="text-4xl font-black text-white drop-shadow-[0_4px_0_rgba(2,132,199,0.55)] sm:text-5xl">
      {{ level.word }}
    </p>

    <button
      v-if="level.value === 8"
      type="button"
      class="btn-kid animate-pop !rounded-2xl !px-6 !py-3 !text-xl sm:!text-2xl"
      style="background:#f59e0b;box-shadow:0 7px 0 #b45309"
      aria-label="Играть в приключения восьмёрки"
      @click="router.push({ name: 'level-8-activities' })"
    >
      🐊 Приключения восьмёрки
    </button>

    <nav class="flex w-full items-center justify-between gap-4" aria-label="Переход между уровнями">
      <button
        type="button"
        class="btn-round disabled:opacity-40"
        :disabled="prevValue === null"
        aria-label="Предыдущая цифра"
        @click="prevValue !== null && goTo(prevValue)"
      >
        <Icon name="left" />
      </button>

      <!-- Когда всё посчитано, кнопка «дальше» подпрыгивает и зовёт к следующей машинке -->
      <button
        type="button"
        class="btn-kid bg-grass shadow-kid-green !px-8 !py-5 !text-3xl sm:!text-4xl"
        :class="{ 'animate-wiggle': allCounted && nextValue === null }"
        aria-label="К машинкам"
        @click="backToCars"
      >
        <Icon name="home" />
        <!-- На телефоне хватает значка: места мало, а малыши и так не читают -->
        <span class="hidden sm:inline">К машинкам</span>
      </button>

      <button
        type="button"
        class="btn-round disabled:opacity-40"
        :class="{ 'animate-wiggle': allCounted && nextValue !== null }"
        :disabled="nextValue === null"
        aria-label="Следующая цифра"
        @click="nextValue !== null && goTo(nextValue)"
      >
        <Icon name="right" />
      </button>
    </nav>
  </main>
</template>
