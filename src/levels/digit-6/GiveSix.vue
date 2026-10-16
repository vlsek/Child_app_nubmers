<script setup lang="ts">
import GiveActivity from '../shared/GiveActivity.vue'
import type { NumberLevel } from '@/types/game'

/** Цифра 6: «Дай другу 6». */
defineProps<{ level: NumberLevel }>()
defineEmits<{ complete: [] }>()
</script>

<template>
  <GiveActivity :level="level" :n="6" item="apple" intro-key="give-6-intro" intro-text="Дай другу шесть яблок!" @complete="$emit('complete')" />
</template>
