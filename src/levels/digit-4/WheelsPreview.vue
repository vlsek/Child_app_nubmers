<script setup lang="ts">
import type { NumberLevel } from '@/types/game'

defineProps<{ level: NumberLevel }>()
</script>

<template>
  <svg viewBox="0 0 160 100" class="h-full w-full" aria-hidden="true">
    <path d="M12 62 Q12 44 30 44 L48 24 H110 L128 44 Q148 44 148 62 V70 H12Z" :fill="level.color" :stroke="level.shade" stroke-width="4" stroke-linejoin="round" />
    <path d="M54 42 L62 30 H104 L116 42Z" fill="#d4ecfb" />
    <g v-for="x in [42, 118]" :key="x" :transform="`translate(${x} 72)`">
      <circle r="17" fill="#1f2937" />
      <circle r="9" fill="#cbd5e1" />
      <circle r="3" fill="#64748b" />
    </g>
  </svg>
</template>
