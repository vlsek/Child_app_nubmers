<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { drop } from '@/composables/synth'
import { inRect, useDrag } from '@/composables/useDrag'
import type { AnimalKind } from '@/types/art'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 5: «Крокодил-машинист везёт пять друзей».
 * Пять вагончиков висят над рельсами. Вагончик перетаскивают к паровозу на рельсы
 * (или тапают, тогда он сам опускается), он цепляется к следующему месту в составе, в окошке
 * появляется друг, на борту цифра, голос считает. Прицепили все пять, и поезд едет.
 */
const props = defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()

/** Зверь в каждом вагончике свой. */
const KINDS: AnimalKind[] = ['bunny', 'cat', 'pig', 'bear', 'dog']
const COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#a855f7']
const SLOT_X = (i: number) => 98 + i * 66

/** Центр вагончика (рисуем вокруг 0,0): дом на весу и место в составе. */
const HOME = (i: number) => ({ x: SLOT_X(i) + 31, y: 148 })
const SPOT = (k: number) => ({ x: SLOT_X(k) + 31, y: 240 })
/** Зона рельсов: сюда нужно опустить вагончик. */
const TRACK = { x: 0, y: 186, w: 440, h: 110 }

/** hooked[i] — каким по счёту прицеплен вагон i (0 — висит). */
const hooked = ref<number[]>([0, 0, 0, 0, 0])
const count = computed(() => hooked.value.filter(Boolean).length)
const driving = ref(false)
const svg = ref<SVGSVGElement | null>(null)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('train-intro', 'Прицепи вагончики!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const drag = useDrag<number>(svg, {
  canGrab: (i) => !hooked.value[i] && !driving.value,
  onDrop: (i, p) => inRect(p, TRACK) && hook(i),
  onTap: (i) => void hook(i),
})

function hook(i: number): boolean {
  if (hooked.value[i] || driving.value) return false
  const n = count.value + 1
  hooked.value[i] = n
  void go(n)
  return true
}

async function go(n: number): Promise<void> {
  drop()
  const said = sayNumber(n)
  if (n < 5) return
  await said
  await sleep(500)
  if (!alive) return
  driving.value = true
  void sayLine('train-go', 'Чух-чух! Поехали!')
  await sleep(2000)
  if (alive) emit('complete')
}

function wagonStyle(i: number): Record<string, string> {
  const k = hooked.value[i]!
  if (k) return { transform: `translate(${SPOT(k - 1).x}px, ${SPOT(k - 1).y}px)`, transition: 'transform .6s cubic-bezier(.4,1.4,.5,1)' }
  return drag.style(i, HOME(i))
}

void props
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" role="img" aria-label="Прицепи пять вагончиков">
    <rect x="-800" y="270" width="2040" height="900" fill="#a3a3a3" opacity=".0" />
    <rect x="-800" y="276" width="2040" height="900" fill="#4ade80" />
    <!-- Рельсы -->
    <rect x="-800" y="270" width="2040" height="7" fill="#78350f" />
    <path d="M-800 266 H1240" stroke="#475569" stroke-width="5" />

    <g :style="{ transform: driving ? 'translateX(-560px)' : 'translateX(0)', transition: driving ? 'transform 1.9s cubic-bezier(.5,0,.9,.6)' : 'none' }">
      <!-- Паровозик с крокодилом-машинистом -->
      <g transform="translate(8 0)">
        <rect x="0" y="206" width="90" height="48" rx="8" :fill="level.color" :stroke="level.shade" stroke-width="4" />
        <rect x="52" y="174" width="38" height="38" rx="6" :fill="level.color" :stroke="level.shade" stroke-width="4" />
        <rect x="58" y="180" width="26" height="22" rx="4" fill="#d4ecfb" />
        <rect x="10" y="184" width="16" height="26" rx="3" fill="#475569" stroke="#1e293b" stroke-width="3" />
        <rect x="6" y="178" width="24" height="10" rx="4" fill="#64748b" />
        <clipPath id="train-cab"><rect x="0" y="140" width="120" height="63" /></clipPath>
        <g clip-path="url(#train-cab)"><g transform="translate(142 0) scale(-1 1)"><Crocodile x="48" y="166" width="68" height="50" mood="happy" :mouth="driving ? 0.5 : 0" :look="1" /></g></g>
        <rect x="50" y="200" width="44" height="7" rx="3" :fill="level.shade" />
        <g class="puff" fill="#fff" opacity=".85"><circle cx="18" cy="168" r="7" /><circle cx="26" cy="156" r="5" /></g>
        <g v-for="x in [22, 62]" :key="x" :transform="`translate(${x} 262)`"><circle r="11" fill="#1f2937" /><circle r="4" fill="#cbd5e1" /></g>
      </g>

      <!-- Куда цеплять: следующее место в составе -->
      <rect v-if="count < 5 && !driving" :x="SPOT(count).x - 35" :y="SPOT(count).y - 28" width="70" height="62" rx="10" fill="#fff" fill-opacity=".25" stroke="#fff" stroke-width="4" stroke-dasharray="8 8" class="hint pointer-events-none" />

      <!-- Вагончики (центр в 0,0) -->
      <g
        v-for="(c, i) in COLORS"
        :key="i"
        :style="wagonStyle(i)"
        @pointerdown="drag.start($event, i, HOME(i))"
      >
        <g :class="{ hang: !hooked[i] && drag.active.value?.id !== i }">
          <g transform="translate(-31 -240)">
            <!-- Сцепка -->
            <rect x="-6" y="244" width="10" height="6" fill="#475569" />
            <!-- Свой зверь в каждом вагончике: торчит одна голова над бортом -->
            <AnimalFigure :kind="KINDS[i]!" crop :mood="hooked[i] ? 'happy' : 'idle'" x="6" y="186" width="50" height="37" />
            <rect x="0" y="214" width="62" height="44" rx="6" :fill="c" stroke="#0f172a" stroke-opacity=".4" stroke-width="3.5" />
            <rect x="8" y="224" width="22" height="16" rx="4" fill="#d4ecfb" />
            <circle v-if="hooked[i]" cx="48" cy="236" r="9" fill="#fff" />
            <text v-if="hooked[i]" x="48" y="241" text-anchor="middle" font-size="14" font-weight="900" fill="#334155">{{ hooked[i] }}</text>
            <g v-for="x in [14, 48]" :key="x" :transform="`translate(${x} 262)`"><circle r="9" fill="#1f2937" /><circle r="3" fill="#cbd5e1" /></g>
          </g>
          <rect v-if="!hooked[i]" x="-40" y="-38" width="80" height="76" fill="transparent" />
        </g>
      </g>
    </g>
  </svg>
</template>

<style scoped>

.hint {
  animation: blink 0.9s ease-in-out infinite;
}
@keyframes blink {
  50% {
    opacity: 0.35;
  }
}
.hang {
  animation: sway 1.4s ease-in-out infinite;
}
@keyframes sway {
  50% {
    rotate: 2deg;
  }
}
.puff {
  animation: puff 1.4s ease-out infinite;
}
@keyframes puff {
  from {
    transform: translateY(6px);
    opacity: 0.9;
  }
  to {
    transform: translateY(-16px);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hang,
  .hint,
  .puff {
    animation: none;
  }
}
</style>
