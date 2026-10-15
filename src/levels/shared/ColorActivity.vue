<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'
import { glyphFor } from './digitPaths'

/** Общая активность «Раскрась цифру»: выбери краску и води пальцем по цифре. */
const props = defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayLine, stopVoice } = useAudio()
const glyph = computed(() => glyphFor(props.level.value))
const maskId = useId()

const COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7']
const color = ref(COLORS[0]!)

const BRUSH = 13
const CELL = 7
const THICK = 24 // толщина цифры, которую красим

const svg = ref<SVGSVGElement | null>(null)
const paths = ref<SVGPathElement[]>([])
const blobs = ref<{ x: number; y: number; c: string }[]>([])
/** Клетки внутри цифры: когда закрашено 90 % — победа. */
const cells = ref<{ x: number; y: number; hit: boolean }[]>([])
const hitCount = ref(0)
const finished = ref(false)
let pressed = false

onMounted(async () => {
  await nextTick()
  const pts: { x: number; y: number }[] = []
  for (const p of paths.value) {
    const len = p.getTotalLength()
    for (let l = 0; l <= len; l += 4) pts.push(p.getPointAtLength(l))
  }
  const seen = new Set<string>()
  const out: { x: number; y: number; hit: boolean }[] = []
  for (const p of pts) {
    for (let gx = -THICK; gx <= THICK; gx += CELL) {
      for (let gy = -THICK; gy <= THICK; gy += CELL) {
        const x = Math.round((p.x + gx) / CELL) * CELL
        const y = Math.round((p.y + gy) / CELL) * CELL
        const key = `${x},${y}`
        if (seen.has(key)) continue
        // клетка внутри цифры, если до линии не дальше половины толщины
        if (pts.some((q) => Math.hypot(q.x - x, q.y - y) <= THICK / 2 - 1)) {
          seen.add(key)
          out.push({ x, y, hit: false })
        }
      }
    }
  }
  cells.value = out
  void sayLine('color-digit', 'Раскрась цифру!')
})
onBeforeUnmount(stopVoice)

function paint(e: PointerEvent): void {
  const el = svg.value
  const m = el?.getScreenCTM()
  if (!el || !m || finished.value) return
  const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
  const last = blobs.value[blobs.value.length - 1]
  if (!last || Math.hypot(last.x - pt.x, last.y - pt.y) > 3 || last.c !== color.value) {
    blobs.value.push({ x: pt.x, y: pt.y, c: color.value })
  }
  for (const c of cells.value) {
    if (!c.hit && Math.hypot(c.x - pt.x, c.y - pt.y) < BRUSH) {
      c.hit = true
      hitCount.value++
    }
  }
  if (cells.value.length && hitCount.value / cells.value.length >= 0.9) {
    finished.value = true
    emit('complete')
  }
}

const onDown = (e: PointerEvent) => {
  pressed = true
  ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
  paint(e)
}
const onMove = (e: PointerEvent) => pressed && paint(e)
</script>

<template>
  <div class="flex h-full w-full flex-col items-center gap-3">
    <svg
      ref="svg"
      :viewBox="`-20 -14 ${glyph.width + 40} 168`"
      class="min-h-0 w-full flex-1 touch-none"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      role="img"
      :aria-label="`Раскрась цифру ${level.value}`"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="pressed = false"
      @pointercancel="pressed = false"
    >
      <defs>
        <mask :id="maskId" maskUnits="userSpaceOnUse" x="-30" y="-30" :width="glyph.width + 60" height="200">
          <path v-for="(d, i) in glyph.strokes" :key="i" :d="d" stroke="#fff" :stroke-width="THICK" />
        </mask>
      </defs>
      <!-- Контур и белая «бумага» -->
      <path v-for="(d, i) in glyph.strokes" :key="'o' + i" :d="d" stroke="#334155" :stroke-width="THICK + 6" />
      <path v-for="(d, i) in glyph.strokes" :key="'w' + i" :ref="(el) => { if (el) paths[i] = el as SVGPathElement }" :d="d" stroke="#fff" :stroke-width="THICK" />
      <!-- Краска не выходит за контур -->
      <g :mask="`url(#${maskId})`">
        <circle v-for="(b, i) in blobs" :key="i" :cx="b.x" :cy="b.y" :r="BRUSH" :fill="b.c" />
      </g>
    </svg>

    <div class="flex shrink-0 gap-3 pb-2" role="radiogroup" aria-label="Краски">
      <button
        v-for="c in COLORS"
        :key="c"
        type="button"
        role="radio"
        class="h-14 w-14 rounded-full border-4 border-white shadow-md transition-transform"
        :class="c === color ? 'scale-125 ring-4 ring-slate-700' : ''"
        :style="{ background: c }"
        :aria-checked="c === color"
        :aria-label="`Краска ${c}`"
        @click="color = c"
      />
    </div>
  </div>
</template>
