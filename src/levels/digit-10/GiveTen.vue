<script setup lang="ts">
import GiveActivity from '../shared/GiveActivity.vue'
import type { NumberLevel } from '@/types/game'

/** Цифра 10: «Дай другу 10». */
defineProps<{ level: NumberLevel }>()
defineEmits<{ complete: [] }>()
</script>

<template>
  <GiveActivity :level="level" :n="10" item="melon" intro-key="give-10-intro" intro-text="Дай другу десять арбузов!" @complete="$emit('complete')" />
</template>
