<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import { useAudio } from '@/composables/useAudio'
import { activityCardId, getNumberLevel } from '@/data/numbersLevels'
import { activitiesFor } from '@/levels/registry'
import { useGameStore } from '@/stores/useGameStore'

/** Хаб цифры: плитки-активности (посчитай, напиши, раскрась и тематические). */
const route = useRoute()
const router = useRouter()
const game = useGameStore()
const { sayNumber } = useAudio()

const level = computed(() => getNumberLevel(Number(route.params.level))!)
const activities = computed(() => activitiesFor(level.value.value))

function open(id: string): void {
  router.push({ name: 'learn-activity', params: { level: level.value.value, activity: id } })
}

onMounted(() => {
  game.setMode('learn')
  game.setMenuLevel('learn', level.value.value)
  void sayNumber(level.value.value)
})
</script>

<template>
  <main class="relative mx-auto flex h-full w-full max-w-4xl flex-col items-center gap-6 overflow-y-auto px-4 pb-8 pt-28">
    <button
      type="button"
      class="btn-round absolute left-4 top-4 sm:left-8 sm:top-8"
      aria-label="К машинкам"
      @click="router.push({ name: 'levels', params: { mode: 'learn' } })"
    >
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

    <div
      class="flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-7xl font-black text-white sm:h-36 sm:w-36 sm:text-8xl"
      :style="{ background: level.color, boxShadow: `0 8px 0 0 ${level.shade}` }"
      aria-hidden="true"
    >
      {{ level.value }}
    </div>

    <ul class="grid w-full grid-cols-2 gap-4 sm:gap-6">
      <li v-for="a in activities" :key="a.id">
        <button
          type="button"
          class="tile relative flex aspect-[4/3] w-full items-center justify-center rounded-[2rem] bg-white/80 p-4"
          :style="{ boxShadow: `0 8px 0 0 ${level.shade}55` }"
          :aria-label="a.title"
          @click="open(a.id)"
        >
          <component :is="a.preview" :level="level" class="h-full max-h-40" />
          <span v-if="game.hasLearned('learn', activityCardId(level.value, a.id))" class="absolute -right-2 -top-3 text-5xl">
            <Icon name="star" />
          </span>
        </button>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.tile {
  transition: transform 0.1s;
}
.tile:active {
  transform: translateY(6px);
}
</style>
