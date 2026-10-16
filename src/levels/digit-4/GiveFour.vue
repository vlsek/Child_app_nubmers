<script setup lang="ts">
import GiveActivity from '../shared/GiveActivity.vue'
import type { NumberLevel } from '@/types/game'

/** Цифра 4: «Дай другу 4». */
defineProps<{ level: NumberLevel }>()
defineEmits<{ complete: [] }>()
</script>

<template>
  <GiveActivity :level="level" :n="4" item="apple" intro-key="give-4-intro" intro-text="Дай другу четыре яблока!" @complete="$emit('complete')" />
</template>
