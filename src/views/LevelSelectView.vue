<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import LevelCarousel, { type CarouselItem } from '@/components/game/LevelCarousel.vue'
import { useAudio } from '@/composables/useAudio'
import { FIND_LEVELS, findCardId } from '@/data/findLevels'
import { NUMBER_LEVELS, numberCardId } from '@/data/numbersLevels'
import { useGameStore } from '@/stores/useGameStore'
import type { GameMode } from '@/types/game'

const route = useRoute()
const router = useRouter()
const game = useGameStore()
const { sayNumber, stopVoice } = useAudio()

const mode = computed(() => route.params.mode as GameMode)

const items = computed<CarouselItem[]>(() =>
  mode.value === 'learn'
    ? NUMBER_LEVELS.map((l) => ({
        key: l.value,
        look: l,
        digit: l.value,
        count: l.value,
        learned: game.hasLearned('learn', numberCardId(l.value)),
        label: `Цифра ${l.value}, ${l.word}`,
      }))
    : FIND_LEVELS.map((l) => ({
        key: l.index,
        look: l.look,
        digit: l.max,
        count: l.max,
        learned: game.hasLearned('find', findCardId(l.index)),
        label: `Уровень ${l.index}: цифры от 1 до ${l.max}`,
      })),
)

function open(index: number): void {
  game.setMenuLevel(mode.value, index + 1)
  router.push({ name: `${mode.value}-level`, params: { level: index + 1 } })
}

function onActive(index: number): void {
  game.setMenuLevel(mode.value, index + 1)
}

/** В «Учим цифры» машина называет свою цифру; в «Найди цифру» молчим, чтобы не подсказывать. */
function onSettle(index: number): void {
  if (mode.value === 'learn') void sayNumber(index + 1)
}

onMounted(() => game.setMode(mode.value))
onBeforeUnmount(stopVoice)
</script>

<template>
  <main class="flex h-full flex-col overflow-hidden">
    <header class="flex shrink-0 items-center justify-between gap-4 p-4 sm:p-8 sm:pb-2">
      <button type="button" class="btn-round" aria-label="Назад" @click="router.push({ name: 'modes' })">
        <Icon name="back" />
      </button>
      <h1 class="text-center text-3xl font-black leading-tight text-white drop-shadow-[0_4px_0_rgba(2,132,199,0.55)] sm:text-5xl">
        Выбери машинку
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

    <LevelCarousel
      :key="mode"
      :items="items"
      :start="game.menuLevel[mode] - 1"
      :hint="game.totalStars === 0"
      @select="open"
      @active="onActive"
      @settle="onSettle"
    />
  </main>
</template>
