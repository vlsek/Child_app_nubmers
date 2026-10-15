<script setup lang="ts">
import { useId } from 'vue'
import { glyphFor } from './digitPaths'
import type { NumberLevel } from '@/types/game'

const props = defineProps<{ level: NumberLevel }>()
const g = glyphFor(props.level.value)
const id = useId()
</script>

<template>
  <svg :viewBox="`-14 -8 ${g.width + 28} 156`" class="h-full w-full" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <defs>
      <linearGradient :id="id" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f43f5e" />
        <stop offset=".5" stop-color="#facc15" />
        <stop offset="1" stop-color="#22c55e" />
      </linearGradient>
    </defs>
    <path v-for="(d, i) in g.strokes" :key="i" :d="d" stroke="#fff" stroke-width="30" />
    <path v-for="(d, i) in g.strokes" :key="'c' + i" :d="d" :stroke="`url(#${id})`" stroke-width="20" />
  </svg>
</template>
