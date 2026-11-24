<script setup lang="ts">
import { computed } from 'vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import { getNumberLevel } from '@/data/numbersLevels'

/**
 * Наклейка за пройденный уровень: круглая, с головой зверя цифры и цифрой на значке.
 * Рисуется вокруг точки (0,0), радиус 36: ставьте через <g transform>. `locked` — пока не заработана (силуэт).
 */
const props = defineProps<{ value: number; locked?: boolean }>()
const level = computed(() => getNumberLevel(props.value)!)
</script>

<template>
  <g v-if="locked" opacity=".5">
    <circle r="34" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="4" stroke-dasharray="7 7" />
    <text y="13" text-anchor="middle" font-size="38" font-weight="900" fill="#fff" fill-opacity=".8">{{ value }}</text>
  </g>
  <g v-else>
    <circle r="38" fill="#fff" stroke="#fff" stroke-width="4" opacity=".9" />
    <circle r="34" :fill="level.color" fill-opacity=".25" :stroke="level.color" stroke-width="5" />
    <g transform="translate(-27 -30) scale(.54)"><AnimalHead :kind="level.animal" /></g>
    <circle cx="22" cy="24" r="14" :fill="level.color" stroke="#fff" stroke-width="3" />
    <text x="22" y="31" text-anchor="middle" font-size="20" font-weight="900" fill="#fff">{{ value }}</text>
  </g>
</template>
