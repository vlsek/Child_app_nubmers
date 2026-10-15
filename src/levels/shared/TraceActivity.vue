<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'
import { glyphFor } from './digitPaths'

/** Общая активность «Напиши цифру»: проведи пальцем по пунктиру от зелёной точки. */
const props = defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayLine, stopVoice } = useAudio()
const glyph = computed(() => glyphFor(props.level.value))

const STEP = 2 // расстояние между точками-образцами вдоль линии
const REACH = 26 // на сколько образцов вперёд можно «перепрыгнуть» за одно движение
const TOLERANCE = 20 // как далеко от линии может быть палец

const svg = ref<SVGSVGElement | null>(null)
const paths = ref<SVGPathElement[]>([])
const samples = ref<{ x: number; y: number }[][]>([])
const stroke = ref(0) // какую линию сейчас пишем
const cur = ref(0) // сколько образцов уже пройдено на ней
const done = ref(false)
const pressed = ref(false)
/** Длина уже закрашенной части каждой линии. */
const filled = ref<number[]>([])

onMounted(async () => {
  await nextTick()
  samples.value = paths.value.map((p) => {
    const len = p.getTotalLength()
    const out: { x: number; y: number }[] = []
    for (let l = 0; l <= len + 0.01; l += STEP) out.push(p.getPointAtLength(Math.min(l, len)))
    return out
  })
  filled.value = samples.value.map(() => 0)
  void sayLine('trace-digit', 'Обведи цифру пальчиком')
})
onBeforeUnmount(stopVoice)

function toSvg(e: PointerEvent): { x: number; y: number } | null {
  const el = svg.value
  const m = el?.getScreenCTM()
  if (!el || !m) return null
  const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
  return { x: pt.x, y: pt.y }
}

function onMove(e: PointerEvent): void {
  if (!pressed.value || done.value) return
  const pt = toSvg(e)
  const pts = samples.value[stroke.value]
  if (!pt || !pts) return
  let best = -1
  let bestD = TOLERANCE
  for (let j = cur.value; j < Math.min(pts.length, cur.value + REACH); j++) {
    const d = Math.hypot(pts[j]!.x - pt.x, pts[j]!.y - pt.y)
    if (d < bestD) {
      bestD = d
      best = j
    }
  }
  if (best <= cur.value) return
  cur.value = best
  filled.value[stroke.value] = best * STEP
  if (best >= pts.length - 2) {
    filled.value[stroke.value] = 9999
    if (stroke.value + 1 < samples.value.length) {
      stroke.value++
      cur.value = 0
    } else {
      done.value = true
      pressed.value = false
      emit('complete')
    }
  }
}

function onDown(e: PointerEvent): void {
  pressed.value = true
  ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
  onMove(e)
}

/** Зелёная точка-старт: начало текущей линии. */
const start = computed(() => samples.value[stroke.value]?.[cur.value] ?? null)
</script>

<template>
  <div class="relative flex h-full w-full items-center justify-center">
    <svg
      ref="svg"
      :viewBox="`-20 -14 ${glyph.width + 40} 168`"
      class="h-full max-h-[34rem] w-full touch-none"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      role="img"
      :aria-label="`Обведи цифру ${level.value}`"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="pressed = false"
      @pointercancel="pressed = false"
    >
      <!-- Дорожка -->
      <path v-for="(d, i) in glyph.strokes" :key="'g' + i" :d="d" stroke="#fff" stroke-width="26" opacity=".7" />
      <path v-for="(d, i) in glyph.strokes" :key="'p' + i" :ref="(el) => { if (el) paths[i] = el as SVGPathElement }" :d="d" stroke="#64748b" stroke-width="3" stroke-dasharray="1 9" />
      <!-- Пройденная часть -->
      <path
        v-for="(d, i) in glyph.strokes"
        :key="'f' + i"
        :d="d"
        :stroke="level.color"
        stroke-width="18"
        :stroke-dasharray="`${filled[i] ?? 0} 99999`"
      />
      <!-- Старт -->
      <circle v-if="start && !done" :cx="start.x" :cy="start.y" r="9" fill="#22c55e" stroke="#fff" stroke-width="3" class="pulse" />
    </svg>
    <Crocodile class="pointer-events-none absolute -bottom-2 right-0 w-28 sm:w-40" :mood="done ? 'happy' : 'idle'" :mouth="done ? 0.3 : 0" :look="1" />
  </div>
</template>

<style scoped>
.pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: pulse 0.9s ease-in-out infinite;
}
@keyframes pulse {
  50% {
    transform: scale(1.35);
  }
}
</style>
