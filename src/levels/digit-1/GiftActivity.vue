<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { pop } from '@/composables/synth'
import { useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 1: «Один подарок».
 * Крокодил и друг нашли подарок. Крышку можно стащить пальцем (или просто ткнуть по коробке):
 * она улетает, из коробки выпрыгивает цыплёнок, голос говорит «один».
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const opened = ref(false)
const svg = ref<SVGSVGElement | null>(null)
const LID = { x: 222, y: 173 } // центр крышки
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const CONFETTI = Array.from({ length: 14 }, (_, i) => ({
  a: (i / 14) * Math.PI * 2,
  r: 70 + (i % 3) * 22,
  c: ['#ef4444', '#facc15', '#3b82f6', '#22c55e', '#ec4899'][i % 5]!,
}))

onMounted(() => void sayLine('gift-intro', 'Какой большой подарок! Открой его!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

/** Крышку потянули в сторону (достаточно чуть сдвинуть) или ткнули в неё. */
const drag = useDrag<number>(svg, {
  canGrab: () => !opened.value,
  onDrop: (_, p) => {
    if (Math.hypot(p.x - LID.x, p.y - LID.y) < 30) return false
    void open()
    return true
  },
  onTap: () => void open(),
})

async function open(): Promise<void> {
  if (opened.value) return
  opened.value = true
  pop()
  const said = sayNumber(1)
  await said
  await sleep(1100)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Открой подарок">
    <rect x="-800" y="262" width="2040" height="900" fill="#4ade80" />
    <rect x="-800" y="258" width="2040" height="8" fill="#22c55e" />

    <Crocodile x="-12" y="170" width="170" height="124" :mood="opened ? 'happy' : 'idle'" :mouth="opened ? 0.45 : 0" :look="1" class="pointer-events-none" />
    <AnimalFigure :kind="level.animal" flip :mood="opened ? 'happy' : 'idle'" x="288" y="158" width="150" height="110" class="pointer-events-none" />

    <!-- Цыплёнок выпрыгивает -->
    <g transform="translate(222 200)">
      <g v-if="opened" class="chick"><g transform="translate(-34 -34) scale(.68)"><AnimalFigure kind="chick" :x="-10" :y="0" :width="120" :height="89.5" crop /></g></g>
    </g>

    <!-- Подарок -->
    <g transform="translate(222 262)" @click="open">
      <rect x="-56" y="-78" width="112" height="78" rx="8" fill="#ef4444" stroke="#991b1b" stroke-width="4" />
      <rect x="-12" y="-78" width="24" height="78" fill="#fde047" stroke="#a16207" stroke-width="3" />
      <rect x="-70" y="-110" width="140" height="116" fill="transparent" />
    </g>

    <!-- Крышка: её можно утащить -->
    <g
      :style="opened ? { transform: `translate(${LID.x + 50}px, ${LID.y - 120}px) rotate(35deg)`, opacity: 0, transition: 'transform .6s ease-out, opacity .6s ease-out', pointerEvents: 'none' } : drag.style(0, LID)"
      @pointerdown="drag.start($event, 0, LID)"
    >
      <g :class="{ box: !opened }">
        <rect x="-64" y="-15" width="128" height="30" rx="8" fill="#f87171" stroke="#991b1b" stroke-width="4" />
        <rect x="-12" y="-15" width="24" height="30" fill="#fde047" stroke="#a16207" stroke-width="3" />
        <path d="M0 -15 q-30 -34 -38 -8 q14 8 38 8 q24 0 38 -8 q-8 -26 -38 8Z" fill="#fde047" stroke="#a16207" stroke-width="3" stroke-linejoin="round" />
        <rect x="-72" y="-48" width="144" height="76" fill="transparent" />
      </g>
    </g>

    <!-- Конфетти -->
    <g v-if="opened" transform="translate(222 150)">
      <circle v-for="(p, i) in CONFETTI" :key="i" r="6" :fill="p.c" class="conf" :style="{ '--dx': `${Math.cos(p.a) * p.r * 1.6}px`, '--dy': `${Math.sin(p.a) * p.r}px` }" />
    </g>
  </svg>
</template>

<style scoped>
.box {
  cursor: pointer;
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: wiggle 1s ease-in-out infinite;
}
@keyframes wiggle {
  25% {
    transform: rotate(-3deg);
  }
  75% {
    transform: rotate(3deg);
  }
}
.chick {
  animation: pop-out 0.7s cubic-bezier(0.3, 1.5, 0.5, 1) forwards;
}
@keyframes pop-out {
  from {
    transform: translateY(40px) scale(0.3);
  }
  to {
    transform: translateY(-70px) scale(1.15);
  }
}
.conf {
  animation: conf 1s ease-out forwards;
}
@keyframes conf {
  from {
    transform: translate(0, 0);
    opacity: 1;
  }
  to {
    transform: translate(var(--dx), var(--dy));
    opacity: 0;
  }
}
g {
  transform-box: view-box;
}
@media (prefers-reduced-motion: reduce) {
  .box {
    animation: none;
  }
}
</style>
