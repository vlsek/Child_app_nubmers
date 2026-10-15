<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import CarCard from '@/components/game/CarCard.vue'
import { useAudio } from '@/composables/useAudio'
import { NUMBER_LEVELS, numberCardId } from '@/data/numbersLevels'
import { useGameStore } from '@/stores/useGameStore'
import type { NumberLevel } from '@/types/game'

const router = useRouter()
const game = useGameStore()
const { sayNumber, greetOnce, stopVoice } = useAudio()

const scroller = ref<HTMLElement | null>(null)
const slides = ref<HTMLElement[]>([])

/** Положение карусели в «номерах машин»: 0 — первая по центру, 1.5 — между второй и третьей. */
const pos = ref(0)
const active = computed(() =>
  Math.min(NUMBER_LEVELS.length - 1, Math.max(0, Math.round(pos.value))),
)
const activeLevel = computed(() => NUMBER_LEVELS[active.value]!)

/** Расстояние между центрами соседних машин в пикселях (меряем, а не считаем: зависит от экрана). */
function stepPx(): number {
  const [a, b] = slides.value
  return a && b ? b.offsetLeft - a.offsetLeft : 1
}

/**
 * Куда карусель едет прямо сейчас (если её послали кнопкой, точкой или стрелкой).
 * Нужно, чтобы быстрые нажатия подряд складывались: «вправо ×3» = на три машины, а не на одну.
 */
let target: number | null = null

let frame = 0
function onScroll(): void {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    if (!scroller.value) return
    pos.value = scroller.value.scrollLeft / stepPx()
    if (target !== null && Math.abs(pos.value - target) < 0.02) target = null
  })
}

function scrollToIndex(index: number, smooth = true): void {
  const i = Math.min(NUMBER_LEVELS.length - 1, Math.max(0, index))
  target = smooth ? i : null
  scroller.value?.scrollTo({ left: i * stepPx(), behavior: smooth ? 'smooth' : 'instant' })
}

/** На сколько машин сдвинуться от текущей цели (стрелки, клавиши). */
function go(delta: number): void {
  interacted.value = true
  scrollToIndex((target ?? active.value) + delta)
}

function isLearned(value: number): boolean {
  return game.progress.numbers.learnedIds.includes(numberCardId(value))
}

/** Центральная машина открывает уровень, соседняя — выезжает на её место. */
function onSelect(level: NumberLevel): void {
  const index = level.value - 1
  if (index !== active.value) {
    interacted.value = true
    scrollToIndex(index)
    return
  }
  game.setMenuLevel(level.value)
  router.push({ name: 'numbers-level', params: { level: level.value } })
}

// --- Подсказка «листай» -------------------------------------------------
// Рука показывается, пока малыш не коснулся экрана сам. Прокрутка сюда не входит:
// иначе стартовая установка на нужную машину сразу бы её спрятала.
const interacted = ref(false)
const showHint = computed(() => !interacted.value && game.totalStars === 0)

// --- Озвучка и клавиатура -----------------------------------------------
// Когда карусель остановилась на новой машине, называем число.
let speakTimer: ReturnType<typeof setTimeout> | undefined
/** Приветствие, которое звучит при первом касании: числа ждут его конца, а не перебивают. */
let hello: Promise<void> = Promise.resolve()

function onPointerDown(): void {
  interacted.value = true
  target = null
  const greeting = greetOnce()
  if (greeting) hello = greeting
}

function onKey(event: KeyboardEvent): void {
  if (event.key === 'ArrowRight') go(1)
  else if (event.key === 'ArrowLeft') go(-1)
}

onMounted(async () => {
  game.setMode('numbers')
  await nextTick()
  // Встаём на машину, с которой вернулись из уровня; озвучку для неё не включаем.
  scrollToIndex(game.menuLevel - 1, false)
  pos.value = game.menuLevel - 1

  watch(active, (index) => {
    game.setMenuLevel(index + 1)
    clearTimeout(speakTimer)
    // Ждём, пока карусель точно остановилась: при быстром свайпе не называем числа по пути.
    speakTimer = setTimeout(async () => {
      await hello
      if (index === active.value) void sayNumber(index + 1)
    }, 450)
  })
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  clearTimeout(speakTimer)
  cancelAnimationFrame(frame)
  window.removeEventListener('keydown', onKey)
  stopVoice()
})

/** Машина «уезжает» от центра: меньше, прозрачнее и позади центральной. */
function slideStyle(i: number): Record<string, string> {
  const d = Math.abs(i - pos.value)
  const near = Math.min(1, d)
  return {
    transform: `scale(${1 - 0.28 * near})`,
    opacity: String(1 - 0.4 * near),
    zIndex: String(100 - Math.round(d * 10)),
  }
}

// Разметка дороги едет вместе с прокруткой, будто машины катятся по ней.
const roadShift = computed(() => `${-Math.round(pos.value * stepPx() * 1.0)}px`)
</script>

<template>
  <main class="flex h-full flex-col overflow-hidden">
    <header class="flex shrink-0 items-center justify-between gap-4 p-4 sm:p-8 sm:pb-2">
      <!-- Звёзды за пройденные машины -->
      <div
        class="flex h-20 shrink-0 items-center gap-2 rounded-full bg-white px-5 text-3xl shadow-lg"
        :aria-label="`Звёзд: ${game.totalStars}`"
      >
        <span aria-hidden="true">⭐</span>
        <span>{{ game.totalStars }}</span>
      </div>

      <h1
        class="text-center text-3xl font-black leading-tight text-white drop-shadow-[0_4px_0_rgba(2,132,199,0.55)] sm:text-5xl"
      >
        Выбери машинку
      </h1>

      <button
        type="button"
        class="btn-round"
        :aria-label="game.sound.muted ? 'Включить звук' : 'Выключить звук'"
        :aria-pressed="game.sound.muted"
        @click="game.toggleSound()"
      >
        <span aria-hidden="true">{{ game.sound.muted ? '🔇' : '🔊' }}</span>
      </button>
    </header>

    <section
      class="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-6 pb-6"
      aria-roledescription="карусель"
      aria-label="Выбор уровня"
    >
      <!-- Дорога под машинами: стоит на месте, разметка едет за свайпом -->
      <div class="road pointer-events-none absolute inset-x-0" :style="{ '--shift': roadShift }" />

      <!-- Стрелки для компьютера и мыши; на телефоне работает свайп -->
      <button
        type="button"
        class="btn-round absolute left-3 top-1/2 z-[200] hidden -translate-y-1/2 disabled:opacity-30 sm:flex"
        aria-label="Предыдущая машинка"
        :disabled="active === 0"
        @click="go(-1)"
      >
        <span aria-hidden="true">◀️</span>
      </button>
      <button
        type="button"
        class="btn-round absolute right-3 top-1/2 z-[200] hidden -translate-y-1/2 disabled:opacity-30 sm:flex"
        aria-label="Следующая машинка"
        :disabled="active === NUMBER_LEVELS.length - 1"
        @click="go(1)"
      >
        <span aria-hidden="true">▶️</span>
      </button>

      <ul
        ref="scroller"
        class="scroller relative z-10 flex w-full items-center overflow-x-auto"
        @scroll.passive="onScroll"
        @pointerdown="onPointerDown"
      >
        <li
          v-for="(level, i) in NUMBER_LEVELS"
          :key="level.value"
          :ref="(el) => { if (el) slides[i] = el as HTMLElement }"
          class="slide"
          :aria-current="i === active ? 'true' : undefined"
        >
          <div class="slide-inner" :style="slideStyle(i)">
            <CarCard
              :level="level"
              :index="i"
              :learned="isLearned(level.value)"
              @select="onSelect"
            />
          </div>
        </li>
      </ul>

      <!-- Точки: где мы в пробке; тап по точке переезжает к машине -->
      <div class="relative z-10 flex items-center gap-1" role="tablist" aria-label="Машинки">
        <button
          v-for="(level, i) in NUMBER_LEVELS"
          :key="level.value"
          type="button"
          role="tab"
          class="flex h-10 w-7 items-center justify-center"
          :aria-selected="i === active"
          :aria-label="`Машинка ${level.value}`"
          @click="((interacted = true), scrollToIndex(i))"
        >
          <span
            class="block rounded-full transition-all duration-200"
            :class="i === active ? 'h-4 w-4 bg-white shadow-md' : 'h-3 w-3 bg-white/55'"
          />
        </button>
      </div>

      <!-- Подсказка: палец водит влево-вправо, пока малыш не потрогал экран -->
      <div
        v-if="showHint"
        class="pointer-events-none absolute bottom-24 left-1/2 z-[150] -translate-x-1/2 text-7xl"
        aria-hidden="true"
      >
        <span class="inline-block animate-swipe drop-shadow-[0_6px_0_rgba(0,0,0,0.25)]">👆</span>
      </div>

      <!-- Для скринридера: что сейчас по центру -->
      <p class="sr-only" aria-live="polite">Цифра {{ activeLevel.value }}, {{ activeLevel.word }}</p>
    </section>
  </main>
</template>

<style scoped>
/* Ширина машины: почти весь экран телефона, но не больше, чем влезает по высоте. */
.scroller {
  --slide-w: min(84vw, 34rem, calc((100dvh - 17rem) * 4 / 3));
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  /* Запас сверху и снизу: тень и подпрыгивание машины не обрезаются прокруткой */
  padding-block: 2rem;
  /* Центр экрана = центр машины: края первой и последней машины не упираются в стену */
  padding-inline: calc(50% - var(--slide-w) * 0.36);
  -webkit-overflow-scrolling: touch;
}

.scroller::-webkit-scrollbar {
  display: none;
}

/* Соседние машины наезжают друг на друга (перекрытие 28%): так они выглядывают с краёв */
.slide {
  flex: none;
  width: var(--slide-w);
  margin-inline: calc(var(--slide-w) * -0.14);
  scroll-snap-align: center;
  /* Один свайп — одна машина, даже если пролистнуть сильно */
  scroll-snap-stop: always;
}

.slide-inner {
  will-change: transform, opacity;
  transform-origin: center bottom;
}

.road {
  top: 50%;
  height: min(14rem, 30vh);
  transform: translateY(-8%);
  background:
    repeating-linear-gradient(
      to right,
      #fde047 0 36px,
      transparent 36px 76px
    )
    var(--shift, 0) 50% / auto 6px repeat-x,
    linear-gradient(180deg, #4b5563 0%, #374151 100%);
  box-shadow:
    inset 0 6px 0 0 #1f2937,
    inset 0 -6px 0 0 #1f2937;
}

@media (prefers-reduced-motion: reduce) {
  .slide-inner {
    will-change: auto;
  }
}
</style>
