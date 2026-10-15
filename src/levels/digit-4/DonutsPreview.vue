<script setup lang="ts">
import Crocodile from '@/components/art/Crocodile.vue'
import type { NumberLevel } from '@/types/game'

defineProps<{ level: NumberLevel }>()
</script>

<template>
  <svg viewBox="0 0 160 100" class="h-full w-full" aria-hidden="true">
    <Crocodile x="0" y="14" width="110" height="80" :mouth="0.6" />
    <g transform="translate(132 40)">
      <circle r="17" fill="#d9954f" stroke="#8a4b16" stroke-width="3" />
      <circle r="13" fill="#f9a8d4" stroke="#8a4b16" stroke-width="2" />
      <circle r="5" fill="#bae6fd" stroke="#8a4b16" stroke-width="2" />
    </g>
  </svg>
</template>
