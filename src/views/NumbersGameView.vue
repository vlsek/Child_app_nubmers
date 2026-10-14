<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CarCard from '@/components/game/CarCard.vue'
import { NUMBER_LEVELS, numberCardId } from '@/data/numbersLevels'
import { useGameStore } from '@/stores/useGameStore'
import type { NumberLevel } from '@/types/game'

const router = useRouter()
const game = useGameStore()

onMounted(() => game.setMode('numbers'))

function isLearned(value: number): boolean {
  return game.progress.numbers.learnedIds.includes(numberCardId(value))
}

function openLevel(level: NumberLevel): void {
  router.push({ name: 'numbers-level', params: { level: level.value } })
}

function goBack(): void {
  game.setMode(null)
  router.push({ name: 'home' })
}
</script>

<template>
  <main class="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 p-4 sm:p-8">
    <header class="flex items-center justify-between gap-4">
      <button
        type="button"
        class="btn-round shrink-0"
        aria-label="Назад в меню"
        @click="goBack"
      >
        <span aria-hidden="true">⬅️</span>
      </button>

      <h1
        class="text-center text-3xl font-black leading-tight text-white drop-shadow-[0_4px_0_rgba(2,132,199,0.55)] sm:text-5xl"
      >
        Пробка! Выбери машинку
      </h1>

      <button
        type="button"
        class="btn-round shrink-0"
        :aria-label="game.sound.muted ? 'Включить звук' : 'Выключить звук'"
        :aria-pressed="game.sound.muted"
        @click="game.toggleSound()"
      >
        <span aria-hidden="true">{{ game.sound.muted ? '🔇' : '🔊' }}</span>
      </button>
    </header>

    <!-- Дорога: 2 полосы. На телефоне машины стоят в 2 колонки, на планшете и компьютере в 2 ряда по 5. -->
    <section class="road rounded-blob p-5 pb-8 sm:p-8 sm:pb-10" aria-label="Выбор уровня">
      <ul class="relative z-10 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-5 sm:gap-x-5 sm:gap-y-8">
        <li
          v-for="(level, i) in NUMBER_LEVELS"
          :key="level.value"
          class="odd:-rotate-1 odd:translate-y-2 even:rotate-1 even:-translate-y-1"
        >
          <CarCard
            :level="level"
            :index="i"
            :learned="isLearned(level.value)"
            @select="openLevel"
          />
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.road {
  position: relative;
  background: linear-gradient(180deg, #4b5563 0%, #374151 100%);
  box-shadow:
    inset 0 0 0 8px #1f2937,
    0 14px 0 0 #111827;
}

/* Разделительная полоса между полосами движения. */
.road::before {
  content: '';
  position: absolute;
  top: 1.5rem;
  bottom: 1.5rem;
  left: 50%;
  width: 6px;
  transform: translateX(-50%);
  background: repeating-linear-gradient(to bottom, #fde047 0 28px, transparent 28px 56px);
  border-radius: 3px;
}

@media (min-width: 640px) {
  .road::before {
    top: 50%;
    bottom: auto;
    left: 1.5rem;
    right: 1.5rem;
    width: auto;
    height: 6px;
    transform: translateY(-50%);
    background: repeating-linear-gradient(to right, #fde047 0 28px, transparent 28px 56px);
  }
}
</style>
