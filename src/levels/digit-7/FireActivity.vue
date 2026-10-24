<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { splash } from '@/composables/synth'
import { useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 7: «Крокодил-пожарный тушит семь огоньков».
 * В домике горит семь огоньков, в окошке ждёт обезьянка. Крокодил держит шланг:
 * брандспойт тащат к огоньку (или тапают по огоньку/брандспойту, тогда он сам наводится),
 * из брандспойта бьёт струя, огонёк гаснет паром, голос считает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

/** Брандспойт дома (в лапе крокодила) и место, откуда выходит шланг. */
const HOME = { x: 150, y: 246 }
const ANCHOR = { x: 70, y: 262 }
const TIP = 24
const FLAMES = [
  { x: 252, y: 130 },
  { x: 320, y: 130 },
  { x: 388, y: 130 },
  { x: 252, y: 198 },
  { x: 388, y: 198 },
  { x: 320, y: 86 },
  { x: 320, y: 244 },
]

/** out[i] — каким по счёту потушен огонёк i (0 — горит). */
const out = ref<number[]>(FLAMES.map(() => 0))
const count = computed(() => out.value.filter(Boolean).length)
const spraying = ref<number | null>(null)
/** Где брандспойт стоит, пока из него бьёт вода (null — дома). */
const held = ref<{ x: number; y: number } | null>(null)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('fire-intro', 'Потуши огоньки!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

function flameNear(p: { x: number; y: number }): number {
  let best = -1
  let bd = Infinity
  FLAMES.forEach((f, i) => {
    const d = Math.hypot(p.x - f.x, p.y - f.y)
    if (!out.value[i] && d < bd) {
      bd = d
      best = i
    }
  })
  return bd <= 110 ? best : -1
}

const drag = useDrag<number>(svg, {
  canGrab: () => spraying.value === null,
  onDrop: (_, p) => {
    const i = flameNear(p)
    if (i < 0) return false
    // Брандспойт встаёт на расстоянии от огонька (с той стороны, откуда его принесли), чтобы струя была видна.
    const f = FLAMES[i]!
    const d = Math.hypot(p.x - f.x, p.y - f.y) || 1
    const ux = d < 8 ? -1 : (p.x - f.x) / d
    const uy = d < 8 ? 0.3 : (p.y - f.y) / d
    held.value = { x: Math.min(Math.max(f.x + ux * 85, 140), 400), y: Math.min(Math.max(f.y + uy * 85, 90), 250) }
    void extinguish(i)
    return true
  },
  // Тап по брандспойту: он сам наводится на первый горящий огонёк.
  onTap: () => {
    const i = out.value.findIndex((o) => !o)
    if (i >= 0) void aimAndSpray(i)
  },
})

/** Брандспойт переезжает так, чтобы смотреть на огонёк с расстояния, и тушит его. */
function aimAndSpray(i: number): Promise<void> {
  if (spraying.value !== null || out.value[i]) return Promise.resolve()
  const f = FLAMES[i]!
  held.value = { x: Math.max(HOME.x, f.x - 90), y: Math.min(250, f.y + 30) }
  return extinguish(i)
}

async function extinguish(i: number): Promise<void> {
  if (out.value[i] || spraying.value !== null) return
  spraying.value = i
  await sleep(550)
  if (!alive) return
  const n = count.value + 1
  out.value[i] = n
  spraying.value = null
  held.value = null
  splash()
  const said = sayNumber(n)
  if (n < 7) return
  await said
  await sleep(500)
  if (alive) emit('complete')
}

const nozzle = computed(() => {
  const a = drag.active.value
  return a ? { x: a.x, y: a.y } : (held.value ?? HOME)
})
/** Угол брандспойта: во время струи смотрит на огонёк, при переноске чуть вверх. */
const angle = computed(() => {
  if (spraying.value === null) return drag.active.value ? -14 : -8
  const f = FLAMES[spraying.value]!
  return (Math.atan2(f.y - nozzle.value.y, f.x - nozzle.value.x) * 180) / Math.PI
})
const tip = computed(() => {
  const r = (angle.value * Math.PI) / 180
  return { x: nozzle.value.x + Math.cos(r) * TIP, y: nozzle.value.y + Math.sin(r) * TIP }
})
const hosePath = computed(() => {
  const n = nozzle.value
  const sag = Math.min(40, Math.abs(n.x - ANCHOR.x) * 0.3 + 14)
  return `M${ANCHOR.x} ${ANCHOR.y} C${ANCHOR.x + 50} ${ANCHOR.y + sag}, ${n.x - 60} ${Math.min(n.y + sag, 268)}, ${n.x - 8} ${n.y + 2}`
})
const streamPath = computed(() => {
  if (spraying.value === null) return ''
  const f = FLAMES[spraying.value]!
  const t = tip.value
  return `M${t.x} ${t.y} Q${(t.x + f.x) / 2} ${Math.min(t.y, f.y) - 36} ${f.x} ${f.y + 6}`
})
const nozzleStyle = computed(() => drag.style(0, held.value ?? HOME))
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Потуши семь огоньков">
    <rect x="-800" y="262" width="2040" height="900" fill="#9ca3af" />
    <rect x="-800" y="258" width="2040" height="8" fill="#6b7280" />

    <!-- Домик -->
    <g stroke-linejoin="round" stroke="#7c4a1e" stroke-width="4">
      <path d="M214 100 L320 36 L426 100Z" fill="#b45309" />
      <rect x="222" y="100" width="196" height="162" fill="#fde68a" />
      <g fill="#bae6fd" stroke="#0369a1">
        <rect x="232" y="108" width="40" height="44" rx="4" /><rect x="300" y="108" width="40" height="44" rx="4" /><rect x="368" y="108" width="40" height="44" rx="4" />
        <rect x="232" y="176" width="40" height="44" rx="4" /><rect x="368" y="176" width="40" height="44" rx="4" /><rect x="300" y="176" width="40" height="44" rx="4" />
      </g>
      <rect x="298" y="224" width="44" height="38" rx="4" fill="#b9793a" />
    </g>
    <!-- Обезьянка в окошке -->
    <g transform="translate(305 180) scale(.3)"><AnimalFigure :kind="level.animal" :x="-10" :y="0" :width="120" :height="89.5" crop /></g>

    <Crocodile x="-14" y="170" width="170" height="124" :mood="count >= 7 ? 'happy' : 'idle'" :mouth="0" :look="1" class="pointer-events-none" />
    <!-- Каска -->
    <g class="pointer-events-none" stroke-linejoin="round" stroke-linecap="round">
      <path d="M26 206 Q26 178 60 174 Q92 178 94 206Z" fill="#ef4444" stroke="#991b1b" stroke-width="4" />
      <path d="M60 176 V204" stroke="#fca5a5" stroke-width="5" opacity=".7" />
      <path d="M22 206 Q60 214 100 206 Q96 202 60 202 Q26 202 22 206Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="3.5" />
      <path d="M48 186 h24 l-4 14 h-16Z" fill="#fde047" stroke="#a16207" stroke-width="2.5" />
    </g>

    <!-- Шланг: от катушки у ног крокодила к брандспойту -->
    <g class="pointer-events-none">
      <circle :cx="ANCHOR.x" :cy="ANCHOR.y" r="10" fill="#dc2626" stroke="#7f1d1d" stroke-width="3" />
      <path :d="hosePath" fill="none" stroke="#7f1d1d" stroke-width="11" stroke-linecap="round" />
      <path :d="hosePath" fill="none" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />
      <path :d="hosePath" fill="none" stroke="#fecaca" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="3 12" />
    </g>

    <!-- Струя воды -->
    <g v-if="spraying !== null" class="pointer-events-none" fill="none" stroke-linecap="round">
      <path class="water" :d="streamPath" stroke="#0ea5e9" stroke-width="11" />
      <path class="water" :d="streamPath" stroke="#bae6fd" stroke-width="4" />
    </g>

    <!-- Брандспойт (рисуем с центром в 0,0, смотрит вправо). Крокодил держит его лапой. -->
    <g :style="nozzleStyle" @pointerdown="drag.start($event, 0, held ?? HOME)">
      <g :style="{ transform: `rotate(${angle}deg)`, transition: spraying === null ? 'transform .25s' : 'none' }">
        <path d="M-16 -6 H2 V6 H-16Z" fill="#fbbf24" stroke="#b45309" stroke-width="3" stroke-linejoin="round" />
        <path d="M2 -9 L24 -5 V5 L2 9Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="3" stroke-linejoin="round" />
        <rect x="22" y="-6" width="4" height="12" rx="1.5" fill="#fbbf24" stroke="#b45309" stroke-width="2" />
        <path d="M-6 6 L-2 18 H8 L6 8" fill="#fbbf24" stroke="#b45309" stroke-width="3" stroke-linejoin="round" />
        <ellipse cx="-8" cy="0" rx="9" ry="9" fill="#5bbf4a" stroke="#1f5a2a" stroke-width="3" />
      </g>
      <circle r="44" fill="transparent" />
    </g>

    <!-- Огоньки -->
    <g v-for="(f, i) in FLAMES" :key="i" :transform="`translate(${f.x} ${f.y})`">
      <g v-if="!out[i]" class="flame" :style="{ animationDelay: `${-i * 0.17}s` }" @click="aimAndSpray(i)">
        <path d="M0 -26 q22 28 0 46 q-22 -18 0 -46Z" fill="#fb923c" stroke="#ea580c" stroke-width="3" />
        <path d="M0 -6 q9 12 0 22 q-9 -10 0 -22Z" fill="#fef08a" />
        <circle r="34" fill="transparent" />
      </g>
      <g v-else class="steam" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2.5">
        <circle cx="-6" cy="0" r="8" /><circle cx="6" cy="-6" r="10" /><circle cx="0" cy="-16" r="7" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.flame {
  cursor: pointer;
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: flicker 0.55s ease-in-out infinite;
}
@keyframes flicker {
  50% {
    transform: scale(1.12, 0.94) rotate(3deg);
  }
}
.steam {
  animation: steam 1s ease-out forwards;
}
@keyframes steam {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-24px);
  }
}
.water {
  stroke-dasharray: 400;
  animation: spray 0.38s ease-out forwards;
}
@keyframes spray {
  from {
    stroke-dashoffset: 400;
  }
  to {
    stroke-dashoffset: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .flame {
    animation: none;
  }
}
</style>
