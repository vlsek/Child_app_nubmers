<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/useGameStore'

const router = useRouter()
const game = useGameStore()

function start(mode: 'numbers' | 'letters'): void {
  game.setMode(mode)
  router.push({ name: mode })
}
</script>

<template>
  <main
    class="relative flex min-h-full flex-col items-center justify-center gap-10 overflow-hidden p-6"
  >
    <!-- Переключатель звука -->
    <button
      type="button"
      class="btn-round absolute right-6 top-6"
      :aria-label="game.sound.muted ? 'Включить звук' : 'Выключить звук'"
      :aria-pressed="game.sound.muted"
      @click="game.toggleSound()"
    >
      <span aria-hidden="true">{{ game.sound.muted ? '🔇' : '🔊' }}</span>
    </button>

    <!-- Звёздочки -->
    <div
      class="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-white/80 px-5 py-3 text-3xl shadow-lg"
      aria-label="Заработанные звёзды"
    >
      <span aria-hidden="true">⭐</span>
      <span>{{ game.totalStars }}</span>
    </div>

    <!-- Облачка для настроения -->
    <span class="pointer-events-none absolute left-[8%] top-[22%] animate-floaty text-7xl opacity-80" aria-hidden="true">☁️</span>
    <span class="pointer-events-none absolute right-[10%] top-[30%] animate-floaty text-8xl opacity-80 [animation-delay:1.2s]" aria-hidden="true">☁️</span>

    <h1
      class="animate-wiggle text-center text-6xl font-black leading-tight text-white drop-shadow-[0_6px_0_rgba(2,132,199,0.55)] sm:text-8xl"
    >
      Учим <span class="text-sunny">цифры</span><br />
      и <span class="text-candy">буквы</span>!
    </h1>

    <nav class="flex w-full max-w-3xl flex-col gap-8 sm:flex-row" aria-label="Выбор игры">
      <button
        type="button"
        class="btn-kid flex-1 bg-tangerine shadow-kid-yellow !text-6xl sm:!text-7xl"
        style="box-shadow: 0 10px 0 0 #c2410c"
        @click="start('numbers')"
      >
        <span aria-hidden="true">🔢</span>
        Цифры
      </button>

      <button
        type="button"
        class="btn-kid flex-1 bg-grape shadow-kid-purple !text-6xl sm:!text-7xl"
        @click="start('letters')"
      >
        <span aria-hidden="true">🔤</span>
        Буквы
      </button>
    </nav>
  </main>
</template>
