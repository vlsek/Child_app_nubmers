<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAudio } from '@/composables/useAudio'
import { MAX_LEVEL, MIN_LEVEL, animalColumns, getNumberLevel } from '@/data/numbersLevels'
import { useGameStore } from '@/stores/useGameStore'

const route = useRoute()
const router = useRouter()
const game = useGameStore()
const { speak } = useAudio()

const level = computed(() => getNumberLevel(Number(route.params.level)))

const prevValue = computed(() =>
  level.value && level.value.value > MIN_LEVEL ? level.value.value - 1 : null,
)
const nextValue = computed(() =>
  level.value && level.value.value < MAX_LEVEL ? level.value.value + 1 : null,
)

// Размер зверей зависит от их числа: единицу и тройку можно показать крупно,
// а десять должны уместиться на экране без прокрутки (даже на телефоне).
const animalFont = computed(() => {
  const n = level.value?.value ?? 1
  if (n <= 3) return 'min(9rem, 13vh, 22vw)'
  if (n <= 6) return 'min(7.5rem, 11vh, 16vw)'
  return 'min(6rem, 9vh, 12vw)'
})
const columns = computed(() => animalColumns(level.value?.value ?? 1))

onMounted(() => game.setMode('numbers'))

// Называем число при входе на уровень и при переходе к соседнему.
// Пока нет записанного голоса, это временная браузерная озвучка.
watch(
  level,
  (current) => {
    if (current) speak(current.word)
  },
  { immediate: true },
)

function goTo(value: number): void {
  router.push({ name: 'numbers-level', params: { level: value } })
}

function backToCars(): void {
  router.push({ name: 'numbers' })
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
      <span aria-hidden="true">⬅️</span>
    </button>

    <button
      type="button"
      class="btn-round absolute right-4 top-4 sm:right-8 sm:top-8"
      :aria-label="game.sound.muted ? 'Включить звук' : 'Выключить звук'"
      :aria-pressed="game.sound.muted"
      @click="game.toggleSound()"
    >
      <span aria-hidden="true">{{ game.sound.muted ? '🔇' : '🔊' }}</span>
    </button>

    <!-- Цифра: тап по ней называет число -->
    <button
      :key="level.value"
      type="button"
      class="flex h-[min(20rem,28vh)] w-[min(20rem,28vh)] animate-pop items-center justify-center rounded-full transition-transform duration-100 active:translate-y-2"
      :style="{ background: level.color, boxShadow: `0 12px 0 0 ${level.shade}` }"
      :aria-label="`Цифра ${level.value}, ${level.word}. Нажми, чтобы услышать`"
      @click="speak(level.word)"
    >
      <span
        class="text-[min(13rem,18vh)] font-black leading-none text-white drop-shadow-[0_6px_0_rgba(0,0,0,0.2)]"
        aria-hidden="true"
      >
        {{ level.value }}
      </span>
    </button>

    <!-- Звери выскакивают по одному: будущий счёт вслух строится на этом же приёме -->
    <ul
      class="flex flex-wrap justify-center gap-y-[0.1em] leading-none"
      :style="{ fontSize: animalFont, width: `${columns * 1.3}em` }"
      :aria-label="`${level.value} — ${level.animalName}`"
    >
      <li
        v-for="n in level.value"
        :key="`${level.value}-${n}`"
        class="w-[1.3em] animate-pop text-center"
        :style="{ animationDelay: `${n * 90}ms` }"
        aria-hidden="true"
      >
        {{ level.animal }}
      </li>
    </ul>

    <p class="text-4xl font-black text-white drop-shadow-[0_4px_0_rgba(2,132,199,0.55)] sm:text-5xl">
      {{ level.word }}
    </p>

    <nav class="flex w-full items-center justify-between gap-4" aria-label="Переход между уровнями">
      <button
        type="button"
        class="btn-round disabled:opacity-40"
        :disabled="prevValue === null"
        aria-label="Предыдущая цифра"
        @click="prevValue !== null && goTo(prevValue)"
      >
        <span aria-hidden="true">◀️</span>
      </button>

      <button
        type="button"
        class="btn-kid bg-grass shadow-kid-green !px-8 !py-5 !text-3xl sm:!text-4xl"
        aria-label="К машинкам"
        @click="backToCars"
      >
        <span aria-hidden="true">🚗</span>
        <!-- На телефоне хватает значка: места мало, а малыши и так не читают -->
        <span class="hidden sm:inline">К машинкам</span>
      </button>

      <button
        type="button"
        class="btn-round disabled:opacity-40"
        :disabled="nextValue === null"
        aria-label="Следующая цифра"
        @click="nextValue !== null && goTo(nextValue)"
      >
        <span aria-hidden="true">▶️</span>
      </button>
    </nav>
  </main>
</template>
