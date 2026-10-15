<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import { useAudio } from '@/composables/useAudio'
import { getNumberLevel } from '@/data/numbersLevels'
import { activitiesFor, findActivity } from '@/levels/registry'
import { useGameStore } from '@/stores/useGameStore'

/**
 * Оболочка активности: кнопки «назад» и «звук», праздник после победы и переходы.
 * Сама игра — компонент из реестра (`src/levels/registry.ts`), он только шлёт `complete`.
 */
const route = useRoute()
const router = useRouter()
const game = useGameStore()
const { sayPraise, stopVoice } = useAudio()

const value = computed(() => Number(route.params.level))
const level = computed(() => getNumberLevel(value.value)!)
const def = computed(() => findActivity(value.value, String(route.params.activity))!)
const View = computed(() => defineAsyncComponent(def.value.component))

const list = computed(() => activitiesFor(value.value))
const nextDef = computed(() => list.value[list.value.findIndex((a) => a.id === def.value.id) + 1])

/** Меняется при «ещё раз»: активность создаётся заново. */
const attempt = ref(0)
const won = ref(false)

async function onComplete(): Promise<void> {
  if (won.value) return
  won.value = true
  game.completeActivity(value.value, def.value.id)
  await sayPraise()
}

function again(): void {
  stopVoice()
  won.value = false
  attempt.value++
}

const toHub = () => router.push({ name: 'learn-level', params: { level: value.value } })
const toNext = () =>
  nextDef.value
    ? router.replace({ name: 'learn-activity', params: { level: value.value, activity: nextDef.value.id } })
    : toHub()

onBeforeUnmount(stopVoice)
</script>

<template>
  <main class="relative mx-auto flex h-full w-full max-w-4xl flex-col px-4 pb-6 pt-28">
    <button type="button" class="btn-round absolute left-4 top-4 z-30 sm:left-8 sm:top-8" aria-label="Назад" @click="toHub">
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

    <div class="relative min-h-0 flex-1">
      <component :is="View" :key="`${def.id}-${attempt}`" :level="level" @complete="onComplete" />
    </div>

    <!-- Победа: звезда и три кнопки -->
    <Transition name="page">
      <div v-if="won" class="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 bg-gradient-to-t from-white/80 to-transparent px-4 pb-6 pt-16">
        <div class="animate-pop text-8xl"><Icon name="star" /></div>
        <div class="flex items-center gap-5">
          <button type="button" class="btn-round" aria-label="Ещё раз" @click="again"><Icon name="again" /></button>
          <button type="button" class="btn-kid bg-grass shadow-kid-green !px-8 !py-5" aria-label="К заданиям" @click="toHub">
            <Icon name="home" />
          </button>
          <button type="button" class="btn-round animate-wiggle" aria-label="Дальше" @click="toNext"><Icon name="right" /></button>
        </div>
      </div>
    </Transition>
  </main>
</template>
