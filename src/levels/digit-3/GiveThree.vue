<script setup lang="ts">
import GiveActivity from '../shared/GiveActivity.vue'
import type { NumberLevel } from '@/types/game'

/** Цифра 3: «Дай другу 3». */
defineProps<{ level: NumberLevel }>()
defineEmits<{ complete: [] }>()
</script>

<template>
  <GiveActivity :level="level" :n="3" item="cookie" intro-key="give-3-intro" intro-text="Дай другу три печеньки!" @complete="$emit('complete')" />
</template>
