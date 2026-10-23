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
 * `hat` — колпак на голове: party (праздничный) или chef (поварской); сидит по макушке каждого зверя (таблица HEAD).
 * `mood`: idle / happy (радуется, подпрыгивает).
 * Рисунки лежат в `animals/<Вид>.vue`; общие классы анимации: .fig-blink, .fig-breathe, .fig-tail
 * (см. src/style.css).
 */
const props = withDefaults(defineProps<{ kind: AnimalKind; flip?: boolean; mood?: 'idle' | 'happy'; crop?: boolean; seated?: boolean; hat?: 'party' | 'chef' }>(), { mood: 'idle' })

/** Макушка каждого зверя в холсте 220×160 (смотрит вправо): центр головы по x и верхний край по y. */
const HEAD: Record<AnimalKind, { cx: number; top: number }> = {
  bear: { cx: 127, top: 30 }, bunny: { cx: 128, top: 50 }, cat: { cx: 128, top: 38 }, chick: { cx: 132, top: 28 }, dog: { cx: 128, top: 36 },
  frog: { cx: 120, top: 52 }, monkey: { cx: 128, top: 32 }, panda: { cx: 127, top: 30 }, pig: { cx: 128, top: 34 }, tiger: { cx: 124, top: 42 },
}
const head = computed(() => HEAD[props.kind])

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
      <g v-if="hat" :transform="`translate(${head.cx} ${head.top + 8}) rotate(-7)`" stroke="#be185d" stroke-width="4" stroke-linejoin="round">
        <template v-if="hat === 'party'">
          <polygon points="0,-48 -20,0 20,0" fill="#f472b6" />
          <path d="M-12 -22 L12 -22 M-17 -10 L17 -10" stroke="#fde047" stroke-width="5" fill="none" />
          <circle cy="-50" r="7" fill="#fde047" stroke="#ca8a04" stroke-width="3" />
        </template>
        <template v-else>
          <g stroke="#94a3b8">
            <path d="M-22 -8 Q-36 -26 -20 -36 Q-18 -54 0 -46 Q18 -54 20 -36 Q36 -26 22 -8Z" fill="#fff" />
            <rect x="-22" y="-12" width="44" height="16" rx="4" fill="#fff" />
          </g>
          <path d="M-8 -38 V-18 M8 -38 V-18" stroke="#cbd5e1" stroke-width="3" fill="none" />
        </template>
      </g>
    </g>
  </svg>
</template>
