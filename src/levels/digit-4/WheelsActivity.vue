<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import Crocodile from '@/components/art/Crocodile.vue'
import { useAudio } from '@/composables/useAudio'
import { inRect, useDrag } from '@/composables/useDrag'
import type { NumberLevel } from '@/types/game'

/**
 * Цифра 4: «Поставь машине четыре колеса».
 * Длинная машина с крокодилом за рулём стоит без колёс. Колесо перетаскивают на машину
 * (или просто тапают, тогда оно само катится) и оно встаёт на ближайшее свободное место,
 * голос считает «один, два, три, четыре».
 * С четвёртым колесом машина поднимается и уезжает.
 */
defineProps<{ level: NumberLevel }>()
const emit = defineEmits<{ complete: [] }>()

const { sayNumber, sayLine, stopVoice } = useAudio()
const clip = useId()

/** Центры мест под колёса на земле (y = 224) и стартовые места колёс на «складе». */
const SLOTS = [90, 150, 290, 350].map((x) => ({ x, y: 224 }))
const TRAY = [130, 195, 260, 325].map((x) => ({ x, y: 292 }))

/** slot[i] — на какое место ушло колесо i (-1 — лежит на складе). */
const slot = ref<number[]>([-1, -1, -1, -1])
const placed = computed(() => slot.value.filter((s) => s >= 0).length)
const driving = ref(false)
let alive = true
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

onMounted(() => void sayLine('wheels-intro', 'Поставь машине колёса!'))
onBeforeUnmount(() => {
  alive = false
  stopVoice()
})

const svg = ref<SVGSVGElement | null>(null)
/** Зона машины: сюда нужно донести колесо. */
const CAR = { x: 10, y: 90, w: 420, h: 180 }

const drag = useDrag<number>(svg, {
  canGrab: (i) => slot.value[i]! < 0 && !driving.value,
  onDrop: (i, p) => inRect(p, CAR) && put(i),
  onTap: (i) => void put(i),
})

function put(i: number): boolean {
  if (slot.value[i]! >= 0 || driving.value) return false
  const n = placed.value
  slot.value[i] = n
  void after(n)
  return true
}

async function after(n: number): Promise<void> {
  const said = sayNumber(n + 1)
  if (n + 1 < 4) return
  await said
  await sleep(300)
  if (!alive) return
  driving.value = true
  void sayLine('wheels-go', 'Поехали! Би-бип!')
  await sleep(1900)
  if (alive) emit('complete')
}

function wheelStyle(i: number): Record<string, string> {
  const s = slot.value[i]!
  if (s < 0) return drag.style(i, TRAY[i]!)
  return { transform: `translate(${SLOTS[s]!.x}px, ${SLOTS[s]!.y}px)`, transition: 'transform .7s cubic-bezier(.4,.1,.3,1)' }
}

/** Машина опускается ниже, пока колёс не хватает. */
const sag = computed(() => (4 - placed.value) * 6)
const mouth = computed(() => (driving.value ? 0.45 : 0))
const nextSlot = computed(() => SLOTS[placed.value])
</script>

<template>
  <svg ref="svg" viewBox="0 0 440 320" class="mx-auto h-full max-h-[34rem] w-full touch-none" aria-hidden="false" role="img" aria-label="Поставь машине четыре колеса">
    <defs>
      <clipPath :id="clip"><rect x="30" y="150" width="380" height="66" rx="18" /></clipPath>
    </defs>

    <!-- Земля -->
    <rect x="-40" y="250" width="520" height="90" fill="#6b7280" />
    <rect x="-40" y="246" width="520" height="8" fill="#4b5563" />

    <g class="scene" :style="{ transform: driving ? 'translateX(620px)' : 'translateX(0)', transition: driving ? 'transform 1.7s cubic-bezier(.5,0,.9,.6)' : 'none' }">
      <!-- Кузов (оседает, пока колёс мало) -->
      <g :style="{ transform: `translateY(${sag}px)`, transition: 'transform .45s ease-out' }" stroke-linejoin="round">
        <!-- Крыша и стёкла -->
        <path d="M60 152 L84 100 Q88 94 96 94 H312 Q322 94 326 102 L352 152Z" :fill="level.color" :stroke="level.shade" stroke-width="5" />
        <path d="M92 148 L108 108 H316 L336 148Z" fill="#d4ecfb" :stroke="level.shade" stroke-width="3" />
        <!-- Друзья едут вместе с крокодилом -->
        <g v-for="x in [112, 160]" :key="x" :transform="`translate(${x} 108) scale(.4)`"><AnimalFigure :kind="level.animal" :x="-10" :y="0" :width="120" :height="89.5" crop /></g>
        <!-- Крокодил за рулём -->
        <Crocodile x="226" y="96" width="104" height="76" :mood="driving ? 'happy' : 'idle'" :mouth="mouth" :look="1" />
        <path d="M92 148 L108 108 H316 L336 148Z" fill="none" :stroke="level.shade" stroke-width="3" />
        <!-- Нижняя часть -->
        <rect x="30" y="150" width="380" height="66" rx="18" :fill="level.color" :stroke="level.shade" stroke-width="5" />
        <rect x="46" y="160" width="60" height="6" rx="3" fill="#fff" opacity=".35" />
        <!-- Арки колёс -->
        <g :clip-path="`url(#${clip})`">
          <circle v-for="s in SLOTS" :key="s.x" :cx="s.x" :cy="s.y" r="34" fill="#1f2937" />
        </g>
        <!-- Фары, бампер, дверные ручки -->
        <circle cx="405" cy="176" r="9" fill="#fef08a" :stroke="level.shade" stroke-width="3" />
        <rect x="26" y="168" width="8" height="16" rx="3" fill="#f87171" />
        <rect x="200" y="162" width="16" height="5" rx="2.5" :fill="level.shade" />
        <path d="M196 152 V212" :stroke="level.shade" stroke-width="2.5" opacity=".5" fill="none" />
      </g>

      <!-- Пустые места: мигают, подсказывая, куда катить -->
      <circle v-if="nextSlot && !driving" :cx="nextSlot.x" :cy="nextSlot.y" r="34" fill="#fff" fill-opacity=".18" stroke="#fff" stroke-width="4" stroke-dasharray="7 7" class="blink" />

      <!-- Колёса -->
      <g
        v-for="(s, i) in slot"
        :key="i"
        class="wheel"
        :style="wheelStyle(i)"
        @pointerdown="drag.start($event, i, TRAY[i]!)"
      >
        <g :class="{ 'wheel--idle': s < 0 && drag.active.value?.id !== i }">
          <g :style="{ transform: `rotate(${(s >= 0 ? 720 : 0) + (driving ? 2160 : 0)}deg)`, transition: `transform ${driving ? 1.7 : 0.7}s ${driving ? 'linear' : 'ease-out'}` }">
            <circle r="28" fill="#1f2937" stroke="#0f172a" stroke-width="3" />
            <circle r="16" fill="#cbd5e1" stroke="#64748b" stroke-width="3" />
            <circle r="5" fill="#64748b" />
            <path d="M0 -16 V16 M-16 0 H16" stroke="#64748b" stroke-width="3" />
          </g>
        </g>
        <!-- Невидимая большая зона для маленького пальца -->
        <circle v-if="s < 0" r="42" fill="transparent" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.scene,
.wheel {
  /* Двигаем по пользовательским единицам SVG */
  transform-box: view-box;
}
.wheel--idle {
  animation: bounce 1.1s ease-in-out infinite;
}
@keyframes bounce {
  50% {
    translate: 0 -6px;
  }
}
.blink {
  animation: blink 0.9s ease-in-out infinite;
}
@keyframes blink {
  50% {
    opacity: 0.25;
  }
}
@media (prefers-reduced-motion: reduce) {
  .wheel--idle,
  .blink {
    animation: none;
  }
}
</style>
