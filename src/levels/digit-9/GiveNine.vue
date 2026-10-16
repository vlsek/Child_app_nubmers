<script setup lang="ts">
import GiveActivity from '../shared/GiveActivity.vue'
import type { NumberLevel } from '@/types/game'

/** Цифра 9: «Дай другу 9». */
defineProps<{ level: NumberLevel }>()
defineEmits<{ complete: [] }>()
</script>

<template>
  <GiveActivity :level="level" :n="9" item="star" intro-key="give-9-intro" intro-text="Дай другу девять звёздочек!" @complete="$emit('complete')" />
</template>
