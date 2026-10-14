<script setup lang="ts">
import { computed } from 'vue'
import { animalColumns } from '@/data/numbersLevels'
import type { NumberLevel } from '@/types/game'

const props = defineProps<{
  level: NumberLevel
  /** Уровень уже пройден: на машине появляется звёздочка. */
  learned?: boolean
  /** Порядковый номер в пробке: сдвигает фазу покачивания, чтобы машины не дёргались хором. */
  index?: number
}>()

defineEmits<{ select: [level: NumberLevel] }>()

/**
 * Размер зверей в окне (в cqw — процентах ширины машины). Подобран так, чтобы
 * все звери помещались в окно; число зверей в ряду задаёт animalColumns().
 */
const ANIMAL_SIZE: Record<number, number> = {
  1: 28,
  2: 22,
  3: 15,
  4: 15,
  5: 14,
  6: 14,
  7: 11,
  8: 11,
  9: 9,
  10: 9,
}

const layout = computed(() => ({
  cols: animalColumns(props.level.value),
  size: ANIMAL_SIZE[props.level.value] ?? 9,
}))
const animals = computed(() => Array.from({ length: props.level.value }, (_, i) => i))

const cssVars = computed(() => ({
  '--car': props.level.color,
  '--car-dark': props.level.shade,
  '--cols': layout.value.cols,
  '--animal-size': `${layout.value.size}cqw`,
  '--delay': `${-(props.index ?? 0) * 0.37}s`,
}))
</script>

<template>
  <button
    type="button"
    class="car"
    :style="cssVars"
    :aria-label="`Цифра ${level.value}, ${level.word}`"
    @click="$emit('select', level)"
  >
    <span class="car-inner">
      <!-- Кабина с окном и зверями -->
      <span class="car-cabin">
        <span class="car-window">
          <span class="car-animals">
            <span v-for="i in animals" :key="i" class="car-animal" aria-hidden="true">{{
              level.animal
            }}</span>
          </span>
        </span>
      </span>

      <!-- Кузов с цифрой на двери -->
      <span class="car-body">
        <span class="car-digit" :class="{ 'car-digit--wide': level.value >= 10 }">{{
          level.value
        }}</span>
        <span class="car-light car-light--front" />
        <span class="car-light car-light--back" />
      </span>

      <span class="car-wheel car-wheel--left" />
      <span class="car-wheel car-wheel--right" />

      <span v-if="learned" class="car-star" aria-hidden="true">⭐</span>
    </span>
  </button>
</template>

<style scoped>
.car {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  /* cqw в стилях ниже считается от ширины именно этой кнопки */
  container-type: inline-size;
  filter: drop-shadow(0 1.2cqw 0.8cqw rgba(0, 0, 0, 0.35));
  transition: transform 0.12s ease-out;
  cursor: pointer;
}

.car:active {
  transform: scale(0.94) translateY(4px);
}

.car:focus-visible {
  outline: 6px solid #fff;
  outline-offset: 6px;
  border-radius: 2rem;
}

/* Машина «пыхтит» на холостом ходу: еле заметно покачивается. */
.car-inner {
  position: absolute;
  inset: 0;
  animation: idle 1.8s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes idle {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-1.5%) rotate(0.6deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .car-inner {
    animation: none;
  }
}

.car-cabin {
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 60%;
  background: var(--car);
  border: 1.2cqw solid var(--car-dark);
  border-radius: 9cqw 9cqw 2cqw 2cqw;
}

.car-window {
  position: absolute;
  inset: 9% 8% 6% 8%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #e0f2fe;
  border: 0.9cqw solid var(--car-dark);
  border-radius: 6cqw 6cqw 1.5cqw 1.5cqw;
}

/* Ширина блока = столбцы × ширина зверя, поэтому ряды получаются ровными. */
.car-animals {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: calc(var(--cols) * var(--animal-size) * 1.15);
}

.car-animal {
  width: calc(var(--animal-size) * 1.15);
  font-size: var(--animal-size);
  line-height: 1.05;
  text-align: center;
}

.car-body {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 36%;
  background: var(--car);
  border: 1.2cqw solid var(--car-dark);
  border-radius: 6cqw;
}

.car-digit {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 21cqw;
  height: 21cqw;
  transform: translate(-50%, -50%);
  background: #fff;
  border: 1cqw solid var(--car-dark);
  border-radius: 50%;
  color: var(--car-dark);
  font-size: 15cqw;
  font-weight: 900;
  line-height: 1;
}

.car-digit--wide {
  font-size: 11.5cqw;
  letter-spacing: -0.4cqw;
}

.car-light {
  position: absolute;
  top: 22%;
  width: 7cqw;
  height: 5cqw;
  border: 0.8cqw solid var(--car-dark);
  border-radius: 2cqw;
}

.car-light--front {
  right: -0.8cqw;
  background: #fef08a;
}

.car-light--back {
  left: -0.8cqw;
  background: #f87171;
}

.car-wheel {
  position: absolute;
  bottom: 1.5cqw;
  width: 17cqw;
  height: 17cqw;
  background: radial-gradient(circle, #d1d5db 0 24%, #111827 25%);
  border: 1.2cqw solid #374151;
  border-radius: 50%;
}

.car-wheel--left {
  left: 13cqw;
}

.car-wheel--right {
  right: 13cqw;
}

.car-star {
  position: absolute;
  top: -3cqw;
  right: -1cqw;
  font-size: 17cqw;
  line-height: 1;
  filter: drop-shadow(0 0.6cqw 0 rgba(0, 0, 0, 0.25));
  animation: star-pop 0.45s ease-out both;
}

@keyframes star-pop {
  0% {
    transform: scale(0) rotate(-30deg);
  }
  70% {
    transform: scale(1.2) rotate(8deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}
</style>
