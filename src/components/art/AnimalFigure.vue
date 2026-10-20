<script setup lang="ts">
import { computed } from 'vue'
import type { AnimalKind } from '@/types/art'
import Bear from './animals/Bear.vue'
import Bunny from './animals/Bunny.vue'
import Cat from './animals/Cat.vue'
import Chick from './animals/Chick.vue'
import Dog from './animals/Dog.vue'
import Frog from './animals/Frog.vue'
import Monkey from './animals/Monkey.vue'
import Panda from './animals/Panda.vue'
import Pig from './animals/Pig.vue'
import Tiger from './animals/Tiger.vue'

/**
 * Зверь «в полный рост» (голова и плечи, как у крокодила): холст 220×160, смотрит вправо.
 * Корневой <svg>: ставьте как есть или вкладывайте в другой <svg> через x y width height.
 * `flip` — развернуть влево (друг стоит справа и смотрит на крокодила).
 * `crop` — показать только голову и плечи (для окон машин): viewBox 62 0 158 118.
 * `seated` — зверь «сидит в машине»: весь рисунок целиком (низ закроет борт машины); отдельный флаг, чтобы звери не обрезались.
 * `mood`: idle / happy (радуется, подпрыгивает).
 * Рисунки лежат в `animals/<Вид>.vue`; общие классы анимации: .fig-blink, .fig-breathe, .fig-tail
 * (см. src/style.css).
 */
const props = withDefaults(defineProps<{ kind: AnimalKind; flip?: boolean; mood?: 'idle' | 'happy'; crop?: boolean; seated?: boolean }>(), { mood: 'idle' })

const parts = { bear: Bear, bunny: Bunny, cat: Cat, chick: Chick, dog: Dog, frog: Frog, monkey: Monkey, panda: Panda, pig: Pig, tiger: Tiger }
/** Для окон: голова и плечи. У цыплёнка тело круглое, его не обрезаем. */
const box = computed(() => (props.seated ? '0 0 220 160' : props.crop && props.kind !== 'chick' ? (props.flip ? '0 0 158 118' : '62 0 158 118') : '0 0 220 160'))
const roundCrop = computed(() => props.crop && props.kind === 'bear')
const part = computed(() => parts[props.kind])
/** Своя фаза анимации у каждой фигуры, чтобы не двигались хором. */
const phase = `${-(Math.random() * 4).toFixed(2)}s`
</script>

<template>
  <svg :viewBox="box" aria-hidden="true" stroke-linejoin="round" stroke-linecap="round" :class="{ 'fig-happy': mood === 'happy' }" :style="{ '--phase': phase }">
    <!-- У медведя в окне плечо обрезалось по прямой: подрезаем овалом вокруг головы -->
    <defs v-if="roundCrop"><clipPath id="fig-bear-crop"><ellipse cx="125" cy="64" rx="68" ry="62" /></clipPath></defs>
    <g :transform="flip ? 'translate(220 0) scale(-1 1)' : undefined">
      <g :clip-path="roundCrop ? 'url(#fig-bear-crop)' : undefined"><component :is="part" /></g>
    </g>
  </svg>
</template>
