<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Icon from '@/components/common/Icon.vue'
import VehicleCard from '@/components/game/VehicleCard.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

export interface CarouselItem {
  key: string | number
  look: NumberLevel
  digit: number
  count: number
  learned: boolean
  label: string
}

const props = defineProps<{
  items: readonly CarouselItem[]
  /** С какой машины начать (индекс с 0). */
  start: number
  /** Показывать подсказку «листай», пока малыш не коснулся экрана. */
  hint: boolean
}>()

const emit = defineEmits<{
  select: [index: number]
  /** Центральная машина сменилась. */
  active: [index: number]
  /** Карусель остановилась на машине (после приветствия, если оно звучит). */
  settle: [index: number]
}>()

const { greetOnce } = useAudio()

const scroller = ref<HTMLElement | null>(null)
const slides = ref<HTMLElement[]>([])

/** Положение карусели в «номерах машин»: 0 — первая по центру, 1.5 — между второй и третьей. */
const pos = ref(0)
const last = computed(() => props.items.length - 1)
const active = computed(() => Math.min(last.value, Math.max(0, Math.round(pos.value))))

/** Расстояние между центрами соседних машин в пикселях (меряем: зависит от экрана). */
function stepPx(): number {
  const [a, b] = slides.value
  return a && b ? b.offsetLeft - a.offsetLeft : 1
}

/** Куда карусель едет сейчас: быстрые нажатия подряд складываются. */
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

const interacted = ref(false)
const showHint = computed(() => props.hint && !interacted.value && props.items.length > 1)

function scrollToIndex(index: number, smooth = true): void {
  const i = Math.min(last.value, Math.max(0, index))
  target = smooth ? i : null
  scroller.value?.scrollTo({ left: i * stepPx(), behavior: smooth ? 'smooth' : 'instant' })
}

function go(delta: number): void {
  interacted.value = true
  scrollToIndex((target ?? active.value) + delta)
}

/** Центральная машина открывает уровень, соседняя выезжает на её место. */
function onSelect(index: number): void {
  if (index !== active.value) {
    interacted.value = true
    scrollToIndex(index)
    return
  }
  emit('select', index)
}

let speakTimer: ReturnType<typeof setTimeout> | undefined
/** Приветствие при первом касании: озвучка машин ждёт его конца, а не перебивает. */
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
  await nextTick()
  const first = Math.min(last.value, Math.max(0, props.start))
  scrollToIndex(first, false)
  pos.value = first

  watch(active, (index) => {
    emit('active', index)
    clearTimeout(speakTimer)
    // Ждём полной остановки: при быстром свайпе по пути ничего не говорим.
    speakTimer = setTimeout(async () => {
      await hello
      if (index === active.value) emit('settle', index)
    }, 450)
  })
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  clearTimeout(speakTimer)
  cancelAnimationFrame(frame)
  window.removeEventListener('keydown', onKey)
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

const roadShift = computed(() => `${-Math.round(pos.value * stepPx())}px`)
</script>

<template>
  <section
    class="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-6 pb-6 [@media(max-height:500px)]:gap-1 [@media(max-height:500px)]:pb-2"
    aria-roledescription="карусель"
    aria-label="Выбор уровня"
  >
    <!-- Дорога стоит на месте, разметка едет за свайпом -->
    <div class="road pointer-events-none absolute inset-x-0" :style="{ '--shift': roadShift }" />

    <button
      type="button"
      class="btn-round absolute left-3 top-1/2 z-[200] hidden -translate-y-1/2 disabled:opacity-30 sm:flex"
      aria-label="Предыдущая машинка"
      :disabled="active === 0"
      @click="go(-1)"
    >
      <Icon name="left" />
    </button>
    <button
      type="button"
      class="btn-round absolute right-3 top-1/2 z-[200] hidden -translate-y-1/2 disabled:opacity-30 sm:flex"
      aria-label="Следующая машинка"
      :disabled="active === last"
      @click="go(1)"
    >
      <Icon name="right" />
    </button>

    <ul
      ref="scroller"
      class="scroller relative z-10 flex w-full items-center overflow-x-auto"
      @scroll.passive="onScroll"
      @pointerdown="onPointerDown"
    >
      <li
        v-for="(item, i) in items"
        :key="item.key"
        :ref="(el) => { if (el) slides[i] = el as HTMLElement }"
        class="slide"
        :aria-current="i === active ? 'true' : undefined"
      >
        <div class="slide-inner" :style="slideStyle(i)">
          <VehicleCard
            :look="item.look"
            :digit="item.digit"
            :count="item.count"
            :learned="item.learned"
            :label="item.label"
            @select="onSelect(i)"
          />
        </div>
      </li>
    </ul>

    <div v-if="items.length > 1" class="relative z-10 flex items-center gap-1" role="tablist" aria-label="Машинки">
      <button
        v-for="(item, i) in items"
        :key="item.key"
        type="button"
        role="tab"
        class="flex h-10 w-7 items-center justify-center"
        :aria-selected="i === active"
        :aria-label="item.label"
        @click="((interacted = true), scrollToIndex(i))"
      >
        <span
          class="block rounded-full transition-all duration-200"
          :class="i === active ? 'h-4 w-4 bg-white shadow-md' : 'h-3 w-3 bg-white/55'"
        />
      </button>
    </div>

    <div
      v-if="showHint"
      class="pointer-events-none absolute bottom-24 [@media(max-height:500px)]:bottom-10 left-1/2 z-[150] -translate-x-1/2 text-7xl"
      aria-hidden="true"
    >
      <span class="inline-block animate-swipe drop-shadow-[0_6px_0_rgba(0,0,0,0.25)]"><Icon name="hand" /></span>
    </div>
  </section>
</template>

<style scoped>
.scroller {
  --slide-w: min(84vw, 34rem, calc((100dvh - 17rem) * 4 / 3));
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-block: 2rem;
  padding-inline: calc(50% - var(--slide-w) * 0.36);
  -webkit-overflow-scrolling: touch;
}
.scroller::-webkit-scrollbar {
  display: none;
}
.slide {
  flex: none;
  width: var(--slide-w);
  margin-inline: calc(var(--slide-w) * -0.14);
  scroll-snap-align: center;
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
    repeating-linear-gradient(to right, #fde047 0 36px, transparent 36px 76px) var(--shift, 0) 50% / auto 6px repeat-x,
    linear-gradient(180deg, #4b5563 0%, #374151 100%);
  box-shadow: inset 0 6px 0 0 #1f2937, inset 0 -6px 0 0 #1f2937;
}
/* Низкий экран (телефон лёжа): машинка крупнее, запас под шапку и кружки меньше */
@media (max-height: 500px) {
  .scroller {
    --slide-w: min(60vw, 34rem, calc((100dvh - 10rem) * 4 / 3));
    padding-block: 1.6rem 1.4rem;
  }
  .road {
    height: min(9rem, 34vh);
  }
}
@media (prefers-reduced-motion: reduce) {
  .slide-inner {
    will-change: auto;
  }
}
</style>
