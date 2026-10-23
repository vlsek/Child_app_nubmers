<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { pop } from '@/composables/synth'
import { near, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 8: «Птичка чистит крокодилу зубки».
 * У крокодила широко открытая пасть, на восьми зубах грязные пятнышки. Птенчика с зубной щёткой перетаскивают
 * к грязному зубу (тап по птенчику: он сам прыгает к первому грязному, тап по пятнышку тоже работает):
 * щётка скребёт, летит пена, зуб блестит, голос считает. Когда все чистые, крокодил жмурится от счастья и улыбается.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

const TEETH = Array.from({ length: 8 }, (_, i) => ({ x: 78 + i * 40 }))
const clean = ref<number[]>(TEETH.map(() => 0))
const count = computed(() => clean.value.filter(Boolean).length)
const happy = computed(() => count.value >= 8)
const birdX = ref(220)
const brushing = ref(-1)
const foam = ref<{ id: number; x: number; dx: number }[]>([])
const bird = computed(() => ({ x: birdX.value, y: 224 }))
const svg = ref<SVGSVGElement | null>(null)
let foamId = 0
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('teeth-intro', 'Почисти крокодилу зубки!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

function wash(i: number): boolean {
  if (clean.value[i] || brushing.value >= 0 || count.value >= 8) return false
  brushing.value = i
  birdX.value = TEETH[i]!.x
  void scrub(i)
  return true
}

async function scrub(i: number): Promise<void> {
  const x = TEETH[i]!.x
  for (let k = 0; k < 4; k++) {
    const id = ++foamId
    foam.value.push({ id, x: x + (k % 2 ? 8 : -8), dx: (k - 1.5) * 6 })
    setTimeout(() => (foam.value = foam.value.filter((f) => f.id !== id)), 900)
    pop()
    await sleep(140)
    if (!alive) return
  }
  const n = count.value + 1
  clean.value[i] = n
  brushing.value = -1
  const said = sayNumber(n)
  if (n < 8) return
  await said
  await sleep(1500)
  if (alive) emit('complete')
}

/** Ближайший грязный зуб к точке p (в пределах щедрого радиуса) или -1. */
function dirtyNear(p: { x: number; y: number }): number {
  let best = -1
  let bd = Infinity
  TEETH.forEach((t, i) => {
    const d = Math.hypot(p.x - t.x, p.y - 180)
    if (!clean.value[i] && near(p, { x: t.x, y: 180 }, 62) && d < bd) {
      best = i
      bd = d
    }
  })
  return best
}

const drag = useDrag<number>(svg, {
  canGrab: () => count.value < 8 && brushing.value < 0,
  onDrop: (_, p) => {
    const i = dirtyNear(p)
    return i >= 0 && wash(i)
  },
  onTap: () => {
    const i = clean.value.findIndex((c) => !c)
    if (i >= 0) wash(i)
  },
})
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Почисти восемь зубов крокодилу">
    <rect x="-800" y="-20" width="2040" height="350" fill="#bae6fd" />

    <!-- Нижняя челюсть, горло, язык -->
    <path d="M30 186 Q30 296 220 296 Q410 296 410 186Z" fill="#4cae45" stroke="#1f5a2a" stroke-width="5" stroke-linejoin="round" />
    <path d="M52 186 Q60 268 220 268 Q380 268 388 186Z" fill="#7f1d1d" />
    <ellipse cx="220" cy="214" rx="46" ry="26" fill="#be123c" class="pointer-events-none" />
    <path d="M60 192 Q72 262 220 262 Q368 262 380 192Z" fill="#f87171" />
    <path d="M220 190 V258" stroke="#be123c" stroke-width="4" stroke-linecap="round" />
    <g fill="#fecaca" opacity=".5"><circle cx="150" cy="232" r="5" /><circle cx="290" cy="236" r="5" /><circle cx="190" cy="248" r="4" /><circle cx="256" cy="250" r="4" /></g>
    <!-- нижние зубки -->
    <g fill="#fff" stroke="#94a3b8" stroke-width="2.5" stroke-linejoin="round">
      <path v-for="k in 7" :key="k" :d="`M${58 + k * 46 - 11} 264 Q${58 + k * 46 - 11} 246 ${58 + k * 46} 246 Q${58 + k * 46 + 11} 246 ${58 + k * 46 + 11} 264Z`" />
    </g>

    <!-- Верхняя часть морды -->
    <path d="M18 128 Q18 36 220 36 Q422 36 422 128 L422 150 Q422 162 400 162 H40 Q18 162 18 150Z" fill="#4cae45" stroke="#1f5a2a" stroke-width="5" stroke-linejoin="round" />
    <path d="M60 52 Q220 14 380 52" fill="none" stroke="#7bc96f" stroke-width="6" stroke-linecap="round" opacity=".7" />
    <!-- ноздри и бугорки -->
    <ellipse cx="190" cy="132" rx="6" ry="4" fill="#1f5a2a" /><ellipse cx="250" cy="132" rx="6" ry="4" fill="#1f5a2a" />
    <g fill="#3f9f3b" stroke="#1f5a2a" stroke-width="2.5"><circle cx="40" cy="112" r="8" /><circle cx="400" cy="112" r="8" /><circle cx="220" cy="48" r="7" /></g>

    <!-- Глаза: в конце жмурится -->
    <g v-if="!happy">
      <circle cx="108" cy="82" r="24" fill="#fff" stroke="#1f5a2a" stroke-width="4" /><circle cx="114" cy="86" r="11" fill="#1e293b" /><circle cx="118" cy="81" r="4" fill="#fff" />
      <circle cx="332" cy="82" r="24" fill="#fff" stroke="#1f5a2a" stroke-width="4" /><circle cx="326" cy="86" r="11" fill="#1e293b" /><circle cx="330" cy="81" r="4" fill="#fff" />
    </g>
    <g v-else fill="none" stroke="#14532d" stroke-width="6" stroke-linecap="round">
      <path d="M86 88 Q108 64 130 88" /><path d="M310 88 Q332 64 354 88" />
    </g>
    <path d="M84 56 Q108 42 132 54" fill="none" stroke="#1f5a2a" stroke-width="5" stroke-linecap="round" />
    <path d="M308 54 Q332 42 356 56" fill="none" stroke="#1f5a2a" stroke-width="5" stroke-linecap="round" />
    <g fill="#f472b6" opacity=".55"><ellipse cx="70" cy="118" rx="16" ry="9" /><ellipse cx="370" cy="118" rx="16" ry="9" /></g>

    <!-- Верхние зубы -->
    <g v-for="(t, i) in TEETH" :key="i" :class="{ dirty: !clean[i] }" @click="wash(i)">
      <path :d="`M${t.x - 16} 158 V188 Q${t.x - 16} 206 ${t.x} 206 Q${t.x + 16} 206 ${t.x + 16} 188 V158Z`" :fill="clean[i] ? '#fff' : '#fef3c7'" stroke="#94a3b8" stroke-width="3" stroke-linejoin="round" />
      <template v-if="!clean[i]">
        <ellipse :cx="t.x" cy="177" rx="12" ry="11" fill="#78350f" opacity=".9" /><circle :cx="t.x - 5" cy="173" r="4" fill="#a16207" /><circle :cx="t.x + 5" cy="181" r="2.5" fill="#451a03" />
        <path :d="`M${t.x - 9} 160 q-4 -8 0 -14 M${t.x + 9} 160 q4 -8 0 -14`" fill="none" stroke="#65a30d" stroke-width="2.5" stroke-linecap="round" class="stink" />
      </template>
      <template v-else>
        <path :d="`M${t.x - 8} 166 q4 14 8 20`" fill="none" stroke="#bae6fd" stroke-width="4" stroke-linecap="round" />
        <g :transform="`translate(${t.x + 6} 174)`" class="spark"><path d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5Z" fill="#fde047" stroke="#ca8a04" stroke-width="1.5" /></g>
      </template>
      <rect :x="t.x - 22" y="150" width="44" height="64" fill="transparent" />
    </g>

    <!-- Пена -->
    <circle v-for="f in foam" :key="f.id" :cx="f.x" cy="184" r="6" fill="#fff" stroke="#7dd3fc" stroke-width="2" class="bubble pointer-events-none" :style="{ '--dx': f.dx + 'px' }" />

    <!-- Птенчик с зубной щёткой -->
    <g :style="drag.style(0, bird)" @pointerdown="drag.start($event, 0, bird)">
      <g :class="brushing >= 0 ? 'scrub' : 'idle'">
        <path d="M-14 16 l-6 12 M0 18 l0 12 M12 16 l6 12" stroke="#fb923c" stroke-width="3.5" stroke-linecap="round" />
        <ellipse rx="26" ry="23" fill="#fde047" stroke="#ca8a04" stroke-width="3.5" />
        <path d="M-4 -22 q2 -9 8 -10 M4 -22 q6 -8 12 -6" fill="none" stroke="#ca8a04" stroke-width="3" stroke-linecap="round" />
        <ellipse cx="-22" cy="4" rx="9" ry="13" fill="#facc15" stroke="#ca8a04" stroke-width="3" transform="rotate(20 -22 4)" />
        <circle cx="-8" cy="-5" r="6" fill="#fff" stroke="#ca8a04" stroke-width="2" /><circle cx="-7" cy="-4" r="3" fill="#1e293b" /><circle cx="-6" cy="-5.5" r="1.1" fill="#fff" />
        <circle cx="10" cy="-5" r="6" fill="#fff" stroke="#ca8a04" stroke-width="2" /><circle cx="11" cy="-4" r="3" fill="#1e293b" /><circle cx="12" cy="-5.5" r="1.1" fill="#fff" />
        <path d="M-2 4 L2 4 L0 11Z" fill="#fb923c" stroke="#c2410c" stroke-width="2" stroke-linejoin="round" />
        <ellipse cx="-14" cy="6" rx="5" ry="3" fill="#fb7185" opacity=".6" /><ellipse cx="20" cy="6" rx="5" ry="3" fill="#fb7185" opacity=".6" />
        <!-- щётка в крыле -->
        <g transform="translate(26 -10) rotate(-35)">
          <rect x="-4" y="-34" width="8" height="46" rx="4" fill="#38bdf8" stroke="#0369a1" stroke-width="2.5" />
          <rect x="-7" y="-46" width="14" height="14" rx="3" fill="#fff" stroke="#0369a1" stroke-width="2.5" />
          <path d="M-4 -44 v10 M0 -44 v10 M4 -44 v10" stroke="#38bdf8" stroke-width="2" />
        </g>
      </g>
      <circle r="42" fill="transparent" />
    </g>
  </svg>
</template>

<style scoped>
.dirty {
  cursor: pointer;
}
.idle {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: hop 1.4s ease-in-out infinite;
}
.scrub {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: scrub 0.14s linear infinite;
}
.spark {
  animation: tw 0.9s ease-in-out infinite;
}
.stink {
  animation: tw 1.2s ease-in-out infinite;
}
.bubble {
  animation: bubble 0.9s ease-out forwards;
}
@keyframes hop {
  50% {
    transform: translateY(-6px);
  }
}
@keyframes scrub {
  25% {
    transform: translateX(-4px) rotate(-4deg);
  }
  75% {
    transform: translateX(4px) rotate(4deg);
  }
}
@keyframes tw {
  50% {
    opacity: 0.2;
  }
}
@keyframes bubble {
  from {
    transform: translate(0, 0) scale(0.5);
    opacity: 1;
  }
  to {
    transform: translate(var(--dx), -26px) scale(1.3);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .idle,
  .scrub,
  .spark,
  .stink,
  .bubble {
    animation: none;
  }
}
</style>
