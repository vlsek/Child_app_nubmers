<script setup lang="ts">
import GiveActivity from '../shared/GiveActivity.vue'
import type { NumberLevel } from '@/types/game'

/** Цифра 1: «Дай другу 1». */
defineProps<{ level: NumberLevel }>()
defineEmits<{ complete: [] }>()
</script>

<template>
  <GiveActivity :level="level" :n="1" item="melon" intro-key="give-1-intro" intro-text="Дай другу один арбуз!" @complete="$emit('complete')" />
</template>
