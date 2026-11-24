<script setup lang="ts">
import { computed } from 'vue'
import AnimalFigure from '@/components/art/AnimalFigure.vue'
import { FIND_TILE_RATIO } from '@/data/findLevels'
import { getNumberLevel } from '@/data/numbersLevels'
import { glyphFor } from '@/levels/shared/digitPaths'

/**
 * Один вариант в «Найди цифру»: зверь стоит за табличкой, на табличке нарисована цифра.
 * У каждой цифры свой зверь (тот же, что в «Учим цифры»). Рисуется в сцене 440×X:
 * `cx` — центр по x, `ground` — линия земли под табличкой, `w` — ширина плитки.
 * state: idle / wrong (мягко качает головой и бледнеет) / right (радуется) / hint (подсвечена).
 */
const props = defineProps<{
  n: number
  cx: number
  ground: number
  w: number
  state?: 'idle' | 'wrong' | 'right' | 'hint'
  /** Порядковый номер для задержки появления. */
  order?: number
}>()
const emit = defineEmits<{ pick: [n: number] }>()

const look = computed(() => getNumberLevel(props.n)!)
const glyph = computed(() => glyphFor(props.n))
/** Табличка — квадрат; зверь выглядывает над ней головой. */
const card = computed(() => props.w * 0.72)
const figH = computed(() => (props.w * 160) / 220)
const figY = computed(() => props.ground - card.value - figH.value * 0.78)
/** Цифра (высота 140) занимает 70 % таблички. */
const k = computed(() => (card.value * 0.7) / 140)
const gx = computed(() => -(glyph.value.width * k.value) / 2)
const gy = computed(() => -card.value + (card.value - 140 * k.value) / 2)
const hitH = computed(() => props.w * FIND_TILE_RATIO + 4)
</script>

<template>
  <g :transform="`translate(${cx} ${ground})`">
    <!-- Тень на траве -->
    <ellipse cx="0" cy="2" :rx="w * 0.46" :ry="w * 0.07" fill="#15803d" opacity=".35" />
    <g
      class="tile"
      :class="`tile--${state ?? 'idle'}`"
      :style="{ animationDelay: `${(order ?? 0) * 70}ms` }"
      role="button"
      tabindex="0"
      :aria-label="`Цифра ${n}`"
      @click="emit('pick', n)"
      @keydown.enter.prevent="emit('pick', n)"
      @keydown.space.prevent="emit('pick', n)"
    >
      <g :class="{ 'tile-pulse': state === 'hint' }">
        <!-- Зверь: за табличкой, голова над ней -->
        <AnimalFigure
          :kind="look.animal"
          :variant="n"
          :flip="cx > 220"
          :mood="state === 'right' ? 'happy' : 'idle'"
          :x="-w / 2"
          :y="figY - ground"
          :width="w"
          :height="figH"
          class="pointer-events-none"
        />
        <!-- Табличка с цифрой -->
        <rect :x="-card / 2" :y="-card + 4" :width="card" :height="card" :rx="card * 0.2" :fill="look.shade" />
        <rect :x="-card / 2" :y="-card" :width="card" :height="card" :rx="card * 0.2" :fill="look.color" stroke="#fff" :stroke-width="card * 0.06" />
        <g :transform="`translate(${gx} ${gy}) scale(${k})`" fill="none" stroke="#fff" stroke-width="17" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none">
          <path v-for="(d, i) in glyph.strokes" :key="i" :d="d" stroke="rgba(0,0,0,.22)" transform="translate(2 4)" />
          <path v-for="(d, i) in glyph.strokes" :key="'t' + i" :d="d" />
        </g>
        <!-- Невидимая зона касания на всю плитку -->
        <rect :x="-w / 2" :y="-hitH" :width="w" :height="hitH" fill="transparent" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.tile {
  cursor: pointer;
  outline: none;
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: tile-in 0.45s cubic-bezier(0.2, 1.4, 0.4, 1) both;
}
.tile--wrong {
  animation: tile-in 0.45s both, tile-no 0.55s 0.05s both;
  opacity: 0.35;
  pointer-events: none;
  transition: opacity 0.4s 0.4s;
}
.tile--right {
  animation: tile-yes 0.7s ease-in-out 2;
  filter: drop-shadow(0 0 10px #fde047);
}
.tile-pulse {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: tile-pulse 0.9s ease-in-out infinite;
  filter: drop-shadow(0 0 9px #fde047);
}
.tile:active {
  transform: scale(0.94);
}
@keyframes tile-in {
  from {
    transform: scale(0.2);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes tile-no {
  20% { transform: translateX(-6px) rotate(-3deg); }
  45% { transform: translateX(6px) rotate(3deg); }
  70% { transform: translateX(-3px) rotate(-1.5deg); }
  100% { transform: none; }
}
@keyframes tile-yes {
  40% { transform: translateY(-16px) scale(1.06); }
}
@keyframes tile-pulse {
  50% { transform: scale(1.07); }
}
@media (prefers-reduced-motion: reduce) {
  .tile, .tile--wrong, .tile--right, .tile-pulse { animation: none; }
}
</style>
