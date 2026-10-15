<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import { useAudio } from '@/composables/useAudio'
import { animalColumns } from '@/data/numbersLevels'
import type { NumberLevel } from '@/types/game'

/** Общая активность «Посчитай зверей»: тап по зверю считает его; досчитал — победа. */
const props = defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { say, sayNumber, stopVoice } = useAudio()

const total = computed(() => props.level.value)
/** order[i] — каким по счёту посчитан зверь i (0 — ещё нет). */
const order = ref<number[]>(Array.from({ length: total.value }, () => 0))
const counted = computed(() => order.value.filter(Boolean).length)
const allCounted = computed(() => counted.value === total.value)
const celebrate = ref(false)

let runId = 0
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function resetCount(): void {
  runId++
  celebrate.value = false
  order.value = Array.from({ length: total.value }, () => 0)
}

async function countAnimal(index: number): Promise<void> {
  if (allCounted.value) resetCount()
  if (order.value[index]) return
  const id = ++runId
  const n = counted.value + 1
  order.value[index] = n
  const said = sayNumber(n)
  if (n < total.value) return
  celebrate.value = true
  await said
  await sleep(300)
  if (id === runId) emit('complete')
}

/** Тап по цифре: «Посчитаем вместе!» и зверей вслух по одному. */
async function countAloud(): Promise<void> {
  resetCount()
  const id = runId
  await say('count-together')
  await sleep(250)
  for (let n = 1; n <= total.value; n++) {
    if (id !== runId) return
    order.value[n - 1] = n
    await Promise.all([sayNumber(n), sleep(800)])
  }
}

void sayNumber(total.value)

onBeforeUnmount(() => {
  runId++
  stopVoice()
})

// Размер зверей зависит от их числа: десять должны уместиться без прокрутки.
const animalFont = computed(() => {
  const n = total.value
  if (n <= 3) return 'min(9rem, 13vh, 22vw)'
  if (n <= 6) return 'min(7.5rem, 11vh, 16vw)'
  return 'min(6rem, 9vh, 12vw)'
})
const columns = computed(() => animalColumns(total.value))
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center gap-4 sm:gap-6">
    <button
      type="button"
      class="relative flex h-[min(18rem,26vh)] w-[min(18rem,26vh)] animate-pop items-center justify-center rounded-full transition-transform duration-100 active:translate-y-2"
      :style="{ background: level.color, boxShadow: `0 12px 0 0 ${level.shade}` }"
      :aria-label="`Цифра ${level.value}, ${level.word}. Нажми, чтобы посчитать вслух`"
      @click="countAloud"
    >
      <span
        class="inline-block text-[min(12rem,17vh)] font-black leading-none text-white drop-shadow-[0_6px_0_rgba(0,0,0,0.2)]"
        :class="{ 'animate-hop': celebrate }"
        aria-hidden="true"
      >
        {{ level.value }}
      </span>
    </button>

    <ul
      class="flex flex-wrap justify-center gap-y-[0.1em] leading-none"
      :style="{ fontSize: animalFont, width: `${columns * 1.3}em` }"
      :aria-label="`${level.value} — ${level.animalName}`"
    >
      <li v-for="n in level.value" :key="n" class="w-[1.3em] animate-pop" :style="{ animationDelay: `${n * 90}ms` }">
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
  </div>
</template>
