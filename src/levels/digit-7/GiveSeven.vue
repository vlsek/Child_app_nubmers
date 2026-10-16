<script setup lang="ts">
import GiveActivity from '../shared/GiveActivity.vue'
import type { NumberLevel } from '@/types/game'

/** Цифра 7: «Дай другу 7». */
defineProps<{ level: NumberLevel }>()
defineEmits<{ complete: [] }>()
</script>

<template>
  <GiveActivity :level="level" :n="7" item="cookie" intro-key="give-7-intro" intro-text="Дай другу семь печенек!" @complete="$emit('complete')" />
</template>
