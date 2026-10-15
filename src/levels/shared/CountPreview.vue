<script setup lang="ts">
import AnimalHead from '@/components/art/AnimalHead.vue'
import type { NumberLevel } from '@/types/game'

defineProps<{ level: NumberLevel }>()
</script>

<template>
  <svg viewBox="0 0 100 100" class="h-full w-full" aria-hidden="true">
    <g transform="translate(6 18) scale(.5)"><AnimalHead :kind="level.animal" /></g>
    <g transform="translate(44 18) scale(.5)"><AnimalHead :kind="level.animal" /></g>
    <g transform="translate(25 50) scale(.5)"><AnimalHead :kind="level.animal" /></g>
  </svg>
</template>
