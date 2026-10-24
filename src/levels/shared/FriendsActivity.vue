<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { animalSound, boing } from '@/composables/synth'
import { animalColumns } from '@/data/numbersLevels'
import type { NumberLevel } from '@/types/game'

/**
 * Разминка для любой цифры: «Крокодил встречает друзей». Столько друзей-зверей,
 * какая цифра. Тап по другу: крокодил с ним здоровается, голос называет число.
 */
const props = defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { say, sayNumber, stopVoice } = useAudio()

const total = computed(() => props.level.value)
const order = ref<number[]>(Array.from({ length: total.value }, () => 0))
const counted = computed(() => order.value.filter(Boolean).length)
const mouth = ref(0)
const hop = ref(0)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void say('count-together'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

async function greet(i: number): Promise<void> {
  if (order.value[i]) return
  const n = counted.value + 1
  order.value[i] = n
  hop.value++
  mouth.value = 0.5
  setTimeout(() => (mouth.value = 0), 300)
  boing()
  animalSound(props.level.animal)
  const said = sayNumber(n)
  if (n < total.value) return
  await said
  await sleep(300)
  if (alive) emit('complete')
}

const columns = computed(() => animalColumns(total.value))
/** Размер фигуры (em = ширина клетки / 1.3): по ширине экрана и высоте, чтобы ряды помещались. */
const animalFont = computed(() => `min(9rem, 13vh, ${(88 / (columns.value * 1.3)).toFixed(1)}vw)`)
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center gap-4 sm:gap-6">
    <!-- Крокодил говорит цифру -->
    <div class="relative flex items-end gap-2">
      <Crocodile class="w-[min(15rem,34vh,60vw)]" mood="happy" :mouth="mouth" :look="0" />
      <div
        class="mb-[18%] flex h-[min(7rem,14vh)] w-[min(7rem,14vh)] items-center justify-center rounded-full text-[min(5rem,10vh)] font-black leading-none text-white shadow-lg"
        :style="{ background: level.color, boxShadow: `0 6px 0 0 ${level.shade}` }"
        aria-hidden="true"
      >
        {{ level.value }}
      </div>
    </div>

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
          :aria-label="order[n - 1] ? `Посчитан: ${order[n - 1]}` : 'Поздороваться'"
          @click="greet(n - 1)"
        >
          <AnimalFigure
            :kind="level.animal"
            :variant="n + level.value"
            :flip="(n * 5) % 3 === 0"
            :mood="order[n - 1] ? 'happy' : 'idle'"
            class="block h-auto w-full"
            :style="{ transform: `scale(${0.9 + ((n * 7) % 5) * 0.045})`, transformOrigin: '50% 100%' }"
          />
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
  </div>
</template>
