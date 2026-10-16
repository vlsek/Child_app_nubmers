<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 1: «Один подарок».
 * Крокодил и друг нашли подарок. Тап по коробке: крышка улетает, из неё выпрыгивает
 * цыплёнок, голос говорит «один».
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const opened = ref(false)
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

async function open(): Promise<void> {
  if (opened.value) return
  opened.value = true
  const said = sayNumber(1)
  await said
  await sleep(1100)
  if (alive) emit('complete')
}
</script>

<template>
  <svg viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full" role="img" aria-label="Открой подарок">
    <rect x="-20" y="262" width="480" height="70" fill="#4ade80" />
    <rect x="-20" y="258" width="480" height="8" fill="#22c55e" />

    <Crocodile x="-12" y="170" width="170" height="124" :mood="opened ? 'happy' : 'idle'" :mouth="opened ? 0.45 : 0" :look="1" class="pointer-events-none" />
    <g transform="translate(346 196) scale(.7)" :class="opened ? 'cheer' : 'wait'"><AnimalHead :kind="level.animal" /></g>

    <!-- Цыплёнок выпрыгивает -->
    <g transform="translate(222 200)">
      <g v-if="opened" class="chick"><g transform="translate(-34 -34) scale(.68)"><AnimalHead kind="chick" /></g></g>
    </g>

    <!-- Подарок -->
    <g transform="translate(222 262)" :class="{ box: !opened }" @click="open">
      <rect x="-56" y="-78" width="112" height="78" rx="8" fill="#ef4444" stroke="#991b1b" stroke-width="4" />
      <rect x="-12" y="-78" width="24" height="78" fill="#fde047" stroke="#a16207" stroke-width="3" />
      <g :class="{ lid: opened }">
        <rect x="-64" y="-104" width="128" height="30" rx="8" fill="#f87171" stroke="#991b1b" stroke-width="4" />
        <rect x="-12" y="-104" width="24" height="30" fill="#fde047" stroke="#a16207" stroke-width="3" />
        <path d="M0 -104 q-30 -34 -38 -8 q14 8 38 8 q24 0 38 -8 q-8 -26 -38 8Z" fill="#fde047" stroke="#a16207" stroke-width="3" stroke-linejoin="round" />
      </g>
      <rect x="-70" y="-110" width="140" height="116" fill="transparent" />
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
.lid {
  animation: lid 0.6s ease-out forwards;
}
@keyframes lid {
  to {
    transform: translate(40px, -110px) rotate(35deg);
    opacity: 0;
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
.wait,
.cheer {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}
.cheer {
  animation: hop 0.5s ease-in-out 3;
}
@keyframes hop {
  50% {
    transform: translateY(-14px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .box,
  .cheer {
    animation: none;
  }
}
</style>
