<script setup lang="ts">
import GiveActivity from '../shared/GiveActivity.vue'
import type { NumberLevel } from '@/types/game'

/** Цифра 5: «Дай другу 5». */
defineProps<{ level: NumberLevel }>()
defineEmits<{ complete: [] }>()
</script>

<template>
  <GiveActivity :level="level" :n="5" item="star" intro-key="give-5-intro" intro-text="Дай другу пять звёздочек!" @complete="$emit('complete')" />
</template>
