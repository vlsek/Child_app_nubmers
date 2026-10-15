<script setup lang="ts">
import { glyphFor } from './digitPaths'
import type { NumberLevel } from '@/types/game'

const props = defineProps<{ level: NumberLevel }>()
const g = glyphFor(props.level.value)
</script>

<template>
  <svg :viewBox="`-14 -8 ${g.width + 28} 156`" class="h-full w-full" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path v-for="(d, i) in g.strokes" :key="i" :d="d" stroke="#fff" stroke-width="16" opacity=".55" />
    <path v-for="(d, i) in g.strokes" :key="'d' + i" :d="d" stroke="#334155" stroke-width="4" stroke-dasharray="1 10" />
  </svg>
</template>
