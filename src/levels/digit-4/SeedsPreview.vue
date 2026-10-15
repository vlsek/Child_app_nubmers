<script setup lang="ts">
import type { NumberLevel } from '@/types/game'

defineProps<{ level: NumberLevel }>()
</script>

<template>
  <svg viewBox="0 0 160 100" class="h-full w-full" aria-hidden="true">
    <path d="M10 30 A70 70 0 0 0 150 30Z" fill="#16a34a" stroke="#14532d" stroke-width="4" stroke-linejoin="round" />
    <path d="M18 30 A62 62 0 0 0 142 30Z" fill="#ef4444" />
    <ellipse v-for="p in [[50,50],[80,62],[108,50],[78,44]]" :key="p.join()" :cx="p[0]" :cy="p[1]" rx="5" ry="8" transform-origin="center" fill="#1f2937" />
  </svg>
</template>
