<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { whoosh } from '@/composables/synth'
import { useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 1: «Крокодил тянет слонёнка за хобот».
 * Крокодила тянут пальцем вправо, и хобот становится всё длиннее. Дотянул до конца: хобот «бум!»
 * возвращается, слонёнок смеётся, голос говорит «один». Отпустил раньше: хобот мягко возвращается.
 * Если просто ткнуть в крокодила, он тянет сам.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const stretch = ref(0)
const pulling = ref(false) // крокодил тянет сам (после тапа)
const svg = ref<SVGSVGElement | null>(null)
const HOME = { x: 268, y: 188 } // где крокодил стоит, пока хобот не тянут
const REACH = 132 // на сколько единиц надо утащить крокодила вправо
const happy = ref(false)
const done = ref(false)
let raf = 0
let last = 0
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const tip = computed(() => 118 + 132 * stretch.value)
const trunk = computed(() => `M72 214 C72 266 ${tip.value - 30} 272 ${tip.value} 258`)
const width = computed(() => 26 - 12 * stretch.value)

function tick(now: number): void {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  if (done.value) {
    // «Бум!»: быстро возвращается
    stretch.value = Math.max(0, stretch.value - dt * 4)
  } else if (drag.active.value) {
    const dx = drag.active.value.x - HOME.x
    stretch.value = Math.max(0, Math.min(1, dx / REACH))
    if (stretch.value >= 1) void finish()
  } else if (pulling.value) {
    stretch.value = Math.min(1, stretch.value + dt * 0.9)
    if (stretch.value >= 1) void finish()
  } else {
    stretch.value = Math.max(0, stretch.value - dt * 1.5)
  }
  if (alive) raf = requestAnimationFrame(tick)
}

async function finish(): Promise<void> {
  if (done.value) return
  done.value = true
  pulling.value = false
  happy.value = true
  whoosh()
  const said = sayNumber(1)
  await said
  await sleep(700)
  if (alive) emit('complete')
}

onMounted(() => {
  void sayLine('trunk-intro', 'Потяни хоботок!')
  last = performance.now()
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => {
  alive = false
  cancelAnimationFrame(raf)
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: () => {
    pulling.value = false
    return !done.value
  },
  onDrop: () => false, // отпустил раньше: хобот возвращается сам (см. tick)
  onTap: () => {
    pulling.value = true
  },
})
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Потяни хобот слонёнка вместе с крокодилом">
    <rect x="-800" y="276" width="2040" height="900" fill="#4ade80" />
    <rect x="-800" y="272" width="2040" height="8" fill="#22c55e" />

    <!-- Слонёнок -->
    <g stroke="#475569" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <!-- Тело: круглый бок, ножки с ноготками, хвостик -->
      <path d="M12 226 q-14 6 -10 22" fill="none" stroke-width="5" />
      <ellipse cx="68" cy="232" rx="66" ry="44" fill="#b3bccb" />
      <rect x="22" y="246" width="34" height="30" rx="12" fill="#b3bccb" />
      <rect x="82" y="246" width="34" height="30" rx="12" fill="#b3bccb" />
      <path d="M30 272 h18 M90 272 h18" stroke="#e2e8f0" stroke-width="4" />
      <circle cx="26" cy="168" r="30" fill="#9aa6b8" />
      <circle cx="26" cy="168" r="18" fill="#f9a8d4" stroke="none" />
      <circle cx="118" cy="168" r="30" fill="#9aa6b8" />
      <circle cx="118" cy="168" r="18" fill="#f9a8d4" stroke="none" />
      <!-- Хобот: обводка и цвет -->
      <path :d="trunk" fill="none" stroke="#475569" :stroke-width="width + 8" />
      <path :d="trunk" fill="none" stroke="#b3bccb" :stroke-width="width" />
      <circle cx="72" cy="170" r="46" fill="#b3bccb" />
      <g v-if="!happy" stroke="none">
        <circle cx="56" cy="160" r="6" fill="#1e293b" />
        <circle cx="88" cy="160" r="6" fill="#1e293b" />
        <circle cx="58" cy="158" r="2" fill="#fff" />
        <circle cx="90" cy="158" r="2" fill="#fff" />
      </g>
      <g v-else fill="none" stroke-width="4">
        <path d="M48 162 q8 -12 16 0" />
        <path d="M80 162 q8 -12 16 0" />
      </g>
      <ellipse cx="44" cy="184" rx="7" ry="4" fill="#f9a8d4" opacity=".7" stroke="none" />
      <ellipse cx="100" cy="184" rx="7" ry="4" fill="#f9a8d4" opacity=".7" stroke="none" />
    </g>

    <!-- Крокодил зубами держит кончик хобота и тянет вправо -->
    <g :transform="`translate(${tip + 150} 188) scale(-1 1)`" class="croc" @pointerdown="drag.start($event, 0, HOME)">
      <Crocodile width="170" height="124" :mood="happy ? 'happy' : 'idle'" :mouth="drag.active.value || pulling ? 0.1 : done ? 0.5 : 0.35" :look="1" />
      <rect x="-10" y="-10" width="190" height="144" fill="transparent" />
    </g>

    <!-- Подсказка: стрелка тянуть вправо -->
    <g v-if="stretch < 0.05 && !done" class="hint" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M262 150 H330 M312 132 L332 150 L312 168" />
    </g>
  </svg>
</template>

<style scoped>
.croc {
  cursor: grab;
}
.hint {
  animation: nudge 1s ease-in-out infinite;
}
@keyframes nudge {
  50% {
    transform: translateX(14px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .hint {
    animation: none;
  }
}
</style>
