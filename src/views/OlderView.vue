<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Crocodile from '@/components/art/Crocodile.vue'
import Confetti from '@/components/common/Confetti.vue'
import Icon from '@/components/common/Icon.vue'
import { useAudio } from '@/composables/useAudio'
import { fanfare } from '@/composables/synth'
import { NUMBER_LEVELS, getNumberLevel } from '@/data/numbersLevels'
import { useGameStore } from '@/stores/useGameStore'

/**
 * Режим «Для старших» (5–6 лет): выбираешь цифру, затем «Напиши» (обведи по пунктиру)
 * и «Раскрась». Маршруты: /older (выбор цифры) и /older/:level (задания по очереди).
 */
const route = useRoute()
const router = useRouter()
const game = useGameStore()
const { sayPraise, stopVoice } = useAudio()

const level = computed(() => (route.params.level ? getNumberLevel(Number(route.params.level)) : undefined))
const STEPS = [
  { id: 'trace', component: defineAsyncComponent(() => import('@/levels/shared/TraceActivity.vue')) },
  { id: 'color', component: defineAsyncComponent(() => import('@/levels/shared/ColorActivity.vue')) },
]
const step = ref(0)
const done = ref(false)
const burst = ref(0)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

watch(
  () => route.params.level,
  () => {
    step.value = 0
    done.value = false
  },
)

async function onComplete(): Promise<void> {
  burst.value++
  await sayPraise()
  await sleep(700)
  if (!alive) return
  if (step.value + 1 < STEPS.length) {
    step.value++
    return
  }
  done.value = true
  burst.value++
  fanfare()
}

const hasNext = computed(() => !!level.value && level.value.value < NUMBER_LEVELS.length)
const open = (n: number) => router.push({ name: 'older', params: { level: n } })
const back = () => (level.value ? router.push({ name: 'older' }) : router.push({ name: 'modes' }))
const again = () => {
  step.value = 0
  done.value = false
}

onMounted(() => game.setMode(null))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})
</script>

<template>
  <main class="relative mx-auto flex h-full w-full max-w-5xl flex-col px-3">
    <Confetti :burst="burst" :big="done" />
    <header class="relative z-10 flex h-24 shrink-0 items-center justify-between px-1 pt-2 [@media(max-height:500px)]:h-16">
      <button type="button" class="btn-round" aria-label="Назад" @click="back"><Icon name="back" /></button>
      <div v-if="level && !done" class="flex gap-3" aria-hidden="true">
        <span v-for="(s, i) in STEPS" :key="s.id" class="block h-5 w-5 rounded-full border-4 border-white transition-all" :class="i < step ? 'bg-yellow-300' : i === step ? 'scale-125 bg-white' : 'bg-white/30'" />
      </div>
      <button type="button" class="btn-round" :aria-label="game.sound.muted ? 'Включить звук' : 'Выключить звук'" @click="game.toggleSound()">
        <Icon :name="game.sound.muted ? 'mute' : 'sound'" />
      </button>
    </header>

    <!-- Выбор цифры -->
    <ul v-if="!level" class="mx-auto my-auto grid w-full max-w-3xl grid-cols-5 [@media(orientation:portrait)]:max-w-sm [@media(orientation:portrait)]:grid-cols-3 gap-3 pb-6 sm:gap-6">
      <li v-for="l in NUMBER_LEVELS" :key="l.value" class="animate-pop flex justify-center" :style="{ animationDelay: `${l.value * 50}ms` }">
        <button
          type="button"
          class="flex aspect-square w-full min-w-16 max-w-28 items-center justify-center rounded-full text-4xl font-black text-white sm:text-6xl [@media(max-height:500px)]:text-3xl"
          :style="{ background: l.color, boxShadow: `0 8px 0 0 ${l.shade}`, textShadow: '0 3px 0 rgba(0,0,0,.2)' }"
          :aria-label="`Цифра ${l.value}`"
          @click="open(l.value)"
        >
          {{ l.value }}
        </button>
      </li>
    </ul>

    <!-- Задания -->
    <div v-else-if="!done" class="relative min-h-0 flex-1 pb-3">
      <component :is="STEPS[step]!.component" :key="`${level.value}-${step}`" :level="level" @complete="onComplete" />
    </div>

    <!-- Готово -->
    <div v-else class="flex flex-1 flex-col items-center justify-center gap-4">
      <Crocodile class="w-[min(16rem,40vh,70vw)] animate-pop" mood="happy" :mouth="0.4" />
      <div class="animate-pop text-[6rem] leading-none [@media(max-height:500px)]:text-[4rem]"><Icon name="star" /></div>
      <div class="flex items-center gap-6">
        <button type="button" class="btn-round" aria-label="Ещё раз" @click="again"><Icon name="again" /></button>
        <button type="button" class="btn-kid bg-grass shadow-kid-green !px-8 !py-5" aria-label="К цифрам" @click="back"><Icon name="home" /></button>
        <button type="button" class="btn-round animate-wiggle disabled:opacity-40" :disabled="!hasNext" aria-label="Дальше" @click="open(level!.value + 1)"><Icon name="right" /></button>
      </div>
    </div>
  </main>
</template>
