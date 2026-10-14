<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/useGameStore'

const router = useRouter()
const game = useGameStore()

onMounted(() => game.setMode('letters'))

function goBack(): void {
  game.setMode(null)
  router.push({ name: 'home' })
}
</script>

<template>
  <main class="relative flex min-h-full flex-col items-center justify-center gap-8 p-6">
    <button
      type="button"
      class="btn-round absolute left-6 top-6"
      aria-label="Назад в меню"
      @click="goBack"
    >
      <span aria-hidden="true">⬅️</span>
    </button>

    <button
      type="button"
      class="btn-round absolute right-6 top-6"
      :aria-label="game.sound.muted ? 'Включить звук' : 'Выключить звук'"
      @click="game.toggleSound()"
    >
      <span aria-hidden="true">{{ game.sound.muted ? '🔇' : '🔊' }}</span>
    </button>

    <div class="animate-pop text-center">
      <p class="text-[10rem] font-black leading-none text-grape drop-shadow-[0_8px_0_rgba(109,40,217,0.35)] sm:text-[14rem]">
        АБВ
      </p>
      <h1 class="mt-4 text-5xl font-black text-white drop-shadow-[0_4px_0_rgba(2,132,199,0.55)]">
        Игра «Буквы»
      </h1>
      <p class="mt-3 text-2xl text-slate-700">Скоро здесь появятся задания!</p>
    </div>

    <button
      type="button"
      class="btn-kid bg-grass shadow-kid-green !text-4xl"
      @click="goBack"
    >
      <span aria-hidden="true">⬅️</span>
      Назад
    </button>
  </main>
</template>
