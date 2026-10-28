<script setup lang="ts">
import { RouterView } from 'vue-router'
import Clouds from '@/components/common/Clouds.vue'
import RotateOverlay from '@/components/common/RotateOverlay.vue'
import { useAudio } from '@/composables/useAudio'

// Фоновая музыка стартует с первого касания: раньше браузер звук не разрешит.
useAudio().startMusicOnFirstTouch()
</script>

<template>
  <Clouds />
  <RotateOverlay />
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.98);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-24px) scale(0.98);
}
</style>
