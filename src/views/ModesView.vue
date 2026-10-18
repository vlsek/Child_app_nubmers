<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Crocodile from '@/components/art/Crocodile.vue'
import Icon from '@/components/common/Icon.vue'
import VehicleArt from '@/components/art/VehicleArt.vue'
import { useAudio } from '@/composables/useAudio'
import { getNumberLevel } from '@/data/numbersLevels'
import { useGameStore } from '@/stores/useGameStore'
import type { GameMode } from '@/types/game'

const router = useRouter()
const game = useGameStore()
const { greetOnce, sayLine } = useAudio()

const car = getNumberLevel(3)!
const bus = getNumberLevel(10)!

/** Крокодил здоровается по тапу: открывает пасть и радуется. */
const hello = ref(false)
function wave(): void {
  if (hello.value) return
  hello.value = true
  void sayLine('hello', 'Привет! Давай играть!')
  setTimeout(() => (hello.value = false), 1800)
}

function open(mode: GameMode): void {
  void greetOnce()
  router.push({ name: 'levels', params: { mode } })
}

onMounted(() => game.setMode(null))
</script>

<template>
  <main class="flex h-full flex-col overflow-y-auto">
    <header class="flex shrink-0 items-center justify-between gap-4 p-4 sm:p-8 sm:pb-2">
      <div
        class="flex h-20 shrink-0 items-center gap-2 rounded-full bg-white px-5 text-3xl shadow-lg"
        :aria-label="`Звёзд: ${game.totalStars}`"
      >
        <span class="text-4xl"><Icon name="star" /></span>
        <span>{{ game.totalStars }}</span>
      </div>
      <h1 class="text-center text-3xl font-black text-white drop-shadow-[0_4px_0_rgba(2,132,199,0.55)] sm:text-5xl">
        Во что играем?
      </h1>
      <button
        type="button"
        class="btn-round"
        :aria-label="game.sound.muted ? 'Включить звук' : 'Выключить звук'"
        @click="game.toggleSound()"
      >
        <Icon :name="game.sound.muted ? 'mute' : 'sound'" />
      </button>
    </header>

    <button type="button" class="mx-auto -mb-2 mt-1 block w-44 shrink-0 sm:w-56" aria-label="Крокодил" @click="wave">
      <Crocodile :mood="hello ? 'happy' : 'idle'" :mouth="hello ? 0.6 : 0" :look="0.6" class="w-full" />
    </button>

    <div class="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 content-center gap-6 p-4 sm:grid-cols-2 sm:gap-8 sm:p-8">
      <button type="button" class="mode bg-grass" aria-label="Учим цифры" @click="open('learn')">
        <VehicleArt :kind="car.vehicle" :color="car.color" :shade="car.shade" :animal="car.animal" :count="3" :digit="3" class="w-full max-w-[16rem]" />
        <span class="mode-title">Учим цифры</span>
      </button>
      <button type="button" class="mode bg-sky-kid" aria-label="Найди цифру" @click="open('find')">
        <VehicleArt :kind="bus.vehicle" :color="bus.color" :shade="bus.shade" :animal="bus.animal" :count="5" :digit="5" class="w-full max-w-[16rem]" />
        <span class="mode-title">Найди цифру</span>
      </button>
    </div>
  </main>
</template>

<style scoped>
.mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1rem 1.5rem;
  border-radius: 2.5rem;
  box-shadow: 0 10px 0 0 rgba(0, 0, 0, 0.22);
  transition: transform 0.1s;
}
.mode:active {
  transform: translateY(8px);
  box-shadow: 0 2px 0 0 rgba(0, 0, 0, 0.22);
}
.mode-title {
  font-size: 2rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 3px 0 rgba(0, 0, 0, 0.2);
}
</style>
