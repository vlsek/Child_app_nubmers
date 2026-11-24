<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { SCALE, useTone } from '@/composables/useTone'
import { fanfare, thump } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 8: «Осьминог-барабанщик». На стойке лежат восемь палочек. Палочку тащат к осьминогу: очередная лапа
 * берёт её и бьёт по своему барабану (нота, голос считает). Когда у всех восьми лап по палочке, осьминог играет мелодию.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()
const { tone } = useTone()

const N = 8
const OCT = { x: 300, y: 124 }
const COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899']
const DRUMS = COLORS.map((color, i) => ({ color, x: 200 + i * 33, y: 238 }))
const ARMS = DRUMS.map((d, i) => {
  const bx = OCT.x + (i - 3.5) * 12
  return { d: `M${bx} 150 C ${bx + (d.x - bx) * 0.15} 205 ${d.x} 186 ${d.x} 224`, x: d.x }
})
const HOMES = COLORS.map((_, i) => ({ x: 28 + i * 52, y: 30 }))

/** got[i] — какой по счёту палочке досталась лапа (0 — палочка ещё на стойке). */
const got = ref<number[]>(COLORS.map(() => 0))
const count = computed(() => got.value.filter(Boolean).length)
/** Номер лапы, у которой палочка (палочка i достаётся лапе got[i]-1). */
const armsHave = computed(() => Array.from({ length: N }, (_, k) => k < count.value))
const pulse = ref<number[]>(COLORS.map(() => 0))
const finale = ref(false)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('drummer-intro', 'Дай осьминогу палочки!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: (i) => !got.value[i],
  onDrop: (i, p) => near(p, OCT, 95) && give(i),
  onTap: (i) => void give(i),
})

function hitDrum(k: number): void {
  pulse.value[k]!++
  thump(150 + k * 28)
  tone(SCALE[k]!, 0.4)
}

function give(i: number): boolean {
  if (got.value[i]) return false
  void take(i)
  return true
}

async function take(i: number): Promise<void> {
  const n = count.value + 1
  got.value[i] = n
  hitDrum(n - 1)
  const said = sayNumber(n)
  if (n < N) return
  await said
  finale.value = true
  fanfare()
  for (const k of [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0]) {
    if (!alive) return
    hitDrum(k)
    await sleep(190)
  }
  await sleep(700)
  if (alive) emit('complete')
}
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Осьминог играет на восьми барабанах">
    <rect x="-800" y="-1200" width="2040" height="1462" fill="#312e81" />
    <g fill="#fde68a" opacity=".8" class="pointer-events-none">
      <circle cx="70" cy="90" r="2.5" /><circle cx="150" cy="60" r="2" /><circle cx="210" cy="95" r="2.5" /><circle cx="400" cy="80" r="2" /><circle cx="120" cy="130" r="2" />
    </g>
    <rect x="-800" y="262" width="2040" height="900" fill="#7c3aed" />
    <rect x="-800" y="258" width="2040" height="8" fill="#a78bfa" />

    <!-- Стойка для палочек -->
    <rect x="8" y="46" width="424" height="7" rx="3.5" fill="#b9793a" stroke="#7c4a1e" stroke-width="2.5" class="pointer-events-none" />

    <!-- Звери-слушатели -->
    <AnimalFigure :kind="level.animal" :mood="finale ? 'happy' : 'idle'" x="96" y="196" width="90" height="65" class="pointer-events-none" />
    <Crocodile x="-34" y="176" width="150" height="110" :mood="finale ? 'happy' : 'idle'" :mouth="0" :look="1" class="pointer-events-none" />

    <!-- Осьминог: лапы -->
    <g class="pointer-events-none" fill="none" stroke-linecap="round">
      <path v-for="(a, k) in ARMS" :key="`o${k}`" :d="a.d" stroke="#5b21b6" stroke-width="15" />
      <path v-for="(a, k) in ARMS" :key="`i${k}`" :d="a.d" stroke="#a78bfa" stroke-width="9" />
    </g>

    <!-- Барабаны -->
    <g v-for="(d, k) in DRUMS" :key="`d${k}`" class="pointer-events-none">
      <g :key="pulse[k]" class="drum" :class="{ ring: pulse[k] }">
        <rect :x="d.x - 14" :y="d.y" width="28" height="20" rx="3" :fill="d.color" stroke="#0f172a" stroke-opacity=".45" stroke-width="3" />
        <ellipse :cx="d.x" :cy="d.y" rx="14" ry="6" fill="#fef3c7" stroke="#0f172a" stroke-opacity=".45" stroke-width="3" />
      </g>
    </g>

    <!-- Палочки в лапах -->
    <g v-for="(a, k) in ARMS" :key="`s${k}`" :transform="`translate(${a.x} 224)`" class="pointer-events-none">
      <g v-if="armsHave[k]" class="stick" :style="{ animationDelay: `${-k * 0.13}s` }">
        <path d="M-14 -16 L6 8" stroke="#7c4a1e" stroke-width="6" stroke-linecap="round" />
        <path d="M-14 -16 L6 8" stroke="#e8b878" stroke-width="3" stroke-linecap="round" />
        <circle cx="6" cy="8" r="5" fill="#f43f5e" stroke="#9f1239" stroke-width="2.5" />
      </g>
    </g>

    <!-- Осьминог: голова -->
    <g :class="{ sway: true, party: finale }" class="pointer-events-none">
      <ellipse :cx="OCT.x" :cy="OCT.y" rx="54" ry="48" fill="#a78bfa" stroke="#5b21b6" stroke-width="5" />
      <ellipse :cx="OCT.x - 18" :cy="OCT.y - 22" rx="12" ry="7" fill="#fff" opacity=".35" />
      <circle :cx="OCT.x - 18" :cy="OCT.y - 4" r="11" fill="#fff" stroke="#5b21b6" stroke-width="3" />
      <circle :cx="OCT.x + 18" :cy="OCT.y - 4" r="11" fill="#fff" stroke="#5b21b6" stroke-width="3" />
      <circle :cx="OCT.x - 16" :cy="OCT.y - 3" r="5" fill="#0f172a" />
      <circle :cx="OCT.x + 20" :cy="OCT.y - 3" r="5" fill="#0f172a" />
      <path :d="finale ? `M${OCT.x - 14} ${OCT.y + 18} Q${OCT.x} ${OCT.y + 36} ${OCT.x + 14} ${OCT.y + 18}Z` : `M${OCT.x - 12} ${OCT.y + 20} Q${OCT.x} ${OCT.y + 30} ${OCT.x + 12} ${OCT.y + 20}`" :fill="finale ? '#7f1d1d' : 'none'" stroke="#5b21b6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- Палочки на стойке -->
    <g
      v-for="(h, i) in HOMES"
      :key="`p${i}`"
      :style="
        got[i]
          ? { transform: `translate(${OCT.x}px, ${OCT.y}px) scale(.3)`, opacity: 0, transition: 'transform .45s ease-in, opacity .2s .3s', pointerEvents: 'none' }
          : drag.style(i, h)
      "
      @pointerdown="drag.start($event, i, h)"
    >
      <g :class="{ wob: !got[i] && drag.active.value?.id !== i }" :style="{ animationDelay: `${-i * 0.2}s` }">
        <path d="M-16 12 L14 -12" stroke="#7c4a1e" stroke-width="8" stroke-linecap="round" />
        <path d="M-16 12 L14 -12" stroke="#e8b878" stroke-width="4" stroke-linecap="round" />
        <circle cx="15" cy="-13" r="7" :fill="COLORS[i]" stroke="#0f172a" stroke-opacity=".4" stroke-width="3" />
      </g>
      <circle r="30" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.drum {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}
.ring {
  animation: ring 0.35s cubic-bezier(0.3, 1.6, 0.5, 1);
}
@keyframes ring {
  30% {
    scale: 1.15 0.8;
  }
}
.stick {
  animation: tap 0.7s ease-in-out infinite alternate;
}
@keyframes tap {
  from {
    transform: rotate(-22deg);
  }
  to {
    transform: rotate(8deg);
  }
}
.sway {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: sway 2.4s ease-in-out infinite;
}
.party {
  animation-duration: 0.5s;
}
@keyframes sway {
  50% {
    transform: rotate(2.5deg);
  }
}
.wob {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: wob 1.8s ease-in-out infinite;
}
@keyframes wob {
  50% {
    transform: rotate(8deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ring,
  .stick,
  .sway,
  .wob {
    animation: none;
  }
}
</style>
