<script setup lang="ts">
import Icon from '@/components/common/Icon.vue'
import VehicleArt from '@/components/art/VehicleArt.vue'
import type { NumberLevel } from '@/types/game'

defineProps<{
  look: NumberLevel
  /** Цифра на двери (для «Найди цифру» — самая большая цифра уровня). */
  digit: number
  /** Сколько зверей в машине. */
  count: number
  learned?: boolean
  label: string
}>()

defineEmits<{ select: [] }>()
</script>

<template>
  <button type="button" class="card" :aria-label="label" @click="$emit('select')">
    <VehicleArt
      :kind="look.vehicle"
      :color="look.color"
      :shade="look.shade"
      :animal="look.animal"
      :count="count"
      :digit="digit"
      class="block w-full"
    />
    <span v-if="learned" class="star" aria-hidden="true"><Icon name="star" /></span>
  </button>
</template>

<style scoped>
.card {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  filter: drop-shadow(0 10px 8px rgba(0, 0, 0, 0.3));
  transition: transform 0.12s ease-out;
  cursor: pointer;
}
.card:active {
  transform: scale(0.94) translateY(4px);
}
.card:focus-visible {
  outline: 6px solid #fff;
  outline-offset: 6px;
  border-radius: 2rem;
}
.star {
  position: absolute;
  top: -2%;
  right: 0;
  width: 22%;
  font-size: 0;
  animation: star-pop 0.45s ease-out both;
}
.star :deep(svg) {
  width: 100%;
  height: auto;
}
@keyframes star-pop {
  0% { transform: scale(0) rotate(-30deg); }
  70% { transform: scale(1.2) rotate(8deg); }
  100% { transform: scale(1) rotate(0); }
}
</style>
