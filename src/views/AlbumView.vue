<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Crocodile from '@/components/art/Crocodile.vue'
import StickerBadge from '@/components/game/StickerBadge.vue'
import Icon from '@/components/common/Icon.vue'
import { useDrag } from '@/composables/useDrag'
import { MAX_LEVEL, MIN_LEVEL } from '@/data/numbersLevels'
import { useGameStore } from '@/stores/useGameStore'
import { useAudio } from '@/composables/useAudio'

/** Альбом наклеек: за каждый пройденный уровень крокодил получает наклейку, её можно двигать по странице. */
const router = useRouter()
const game = useGameStore()
const { sayNumber } = useAudio()

const box = ref<HTMLElement | null>(null)
const svg = ref<SVGSVGElement | null>(null)
const H = 320
const W = ref(H * 1.6)
let ro: ResizeObserver | undefined

function measure(): void {
  const r = box.value?.getBoundingClientRect()
  if (r && r.width > 0 && r.height > 0) W.value = Math.round(H * Math.min(2.6, Math.max(0.4, r.width / r.height)))
}

onMounted(() => {
  measure()
  if (box.value) {
    ro = new ResizeObserver(measure)
    ro.observe(box.value)
  }
  game.clearNewSticker()
})
onBeforeUnmount(() => ro?.disconnect())

const MARGIN = 40
const levels = Array.from({ length: MAX_LEVEL - MIN_LEVEL + 1 }, (_, i) => MIN_LEVEL + i)
const earned = computed(() => levels.filter((v) => game.stickers[v]))
const locked = computed(() => levels.filter((v) => !game.stickers[v]))

function homeOf(v: number): { x: number; y: number } {
  const p = game.stickers[v]!
  return { x: clampX(p.x * W.value), y: clampY(p.y * H) }
}

/** Наклейка всегда целиком на странице, даже если экран потом стал уже. */
const clampX = (x: number): number => Math.min(W.value - MARGIN, Math.max(MARGIN, x))
const clampY = (y: number): number => Math.min(H - MARGIN, Math.max(MARGIN + 20, y))

/** Полка пустых мест: шаг сужается, если не помещается в ширину. */
const shelfStep = computed(() => Math.min(44, (W.value - 60) / Math.max(1, locked.value.length)))

const drag = useDrag<number>(svg, {
  onDrop(id, p) {
    game.moveSticker(id, { x: clampX(p.x) / W.value, y: clampY(p.y) / H })
    void sayNumber(id)
    return true
  },
})

/** Несомая наклейка рисуется последней, то есть поверх остальных. */
const ordered = computed(() => {
  const a = drag.active.value?.id
  return a === undefined ? earned.value : [...earned.value.filter((v) => v !== a), a]
})
</script>

<template>
  <main class="relative flex h-full flex-col overflow-hidden bg-sky-kid">
    <header class="relative z-10 flex shrink-0 items-center justify-between gap-4 p-4 sm:p-6 [@media(max-height:500px)]:p-2">
      <button type="button" class="btn-round" aria-label="Назад" @click="router.push({ name: 'modes' })">
        <Icon name="back" />
      </button>
      <button type="button" class="btn-round" :aria-label="game.sound.muted ? 'Включить звук' : 'Выключить звук'" @click="game.toggleSound()">
        <Icon :name="game.sound.muted ? 'mute' : 'sound'" />
      </button>
    </header>

    <div ref="box" class="relative min-h-0 flex-1">
      <svg ref="svg" :viewBox="`0 0 ${W} ${H}`" class="absolute inset-0 h-full w-full" style="overflow: visible; touch-action: none" role="img" aria-label="Альбом наклеек">
        <rect x="-800" y="-1200" :width="W + 1600" height="1500" fill="#7dd3fc" />
        <rect x="-800" y="262" :width="W + 1600" height="1200" fill="#4ade80" />
        <rect x="-800" y="262" :width="W + 1600" height="8" fill="#16a34a" />
        <!-- Полка: наклейки, которые ещё не получены -->
        <g v-for="(v, i) in locked" :key="`l${v}`" :transform="`translate(${W / 2 - ((locked.length - 1) * shelfStep) / 2 + i * shelfStep} 297) scale(${shelfStep / 80})`">
          <StickerBadge :value="v" locked />
        </g>
        <Crocodile :x="W - 150" y="196" width="120" height="87" mood="happy" :mouth="0.2" />
        <g v-for="v in ordered" :key="v" :style="drag.style(v, homeOf(v))" @pointerdown="drag.start($event, v, homeOf(v))">
          <StickerBadge :value="v" />
        </g>
      </svg>
    </div>
  </main>
</template>
