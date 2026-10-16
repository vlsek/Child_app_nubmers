<script setup lang="ts">
import GiveActivity from '../shared/GiveActivity.vue'
import type { NumberLevel } from '@/types/game'

/** Цифра 2: «Дай другу 2». */
defineProps<{ level: NumberLevel }>()
defineEmits<{ complete: [] }>()
</script>

<template>
  <GiveActivity :level="level" :n="2" item="ball" intro-key="give-2-intro" intro-text="Дай другу два мячика!" @complete="$emit('complete')" />
</template>
