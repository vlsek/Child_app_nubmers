<script setup lang="ts">
import GiveActivity from '../shared/GiveActivity.vue'
import type { NumberLevel } from '@/types/game'

/** Цифра 8: «Дай другу 8». */
defineProps<{ level: NumberLevel }>()
defineEmits<{ complete: [] }>()
</script>

<template>
  <GiveActivity :level="level" :n="8" item="ball" intro-key="give-8-intro" intro-text="Дай другу восемь мячиков!" @complete="$emit('complete')" />
</template>
