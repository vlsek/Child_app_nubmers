<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Crocodile from '@/components/art/Crocodile.vue'
import StickerBadge from '@/components/game/StickerBadge.vue'
import { useAudio } from '@/composables/useAudio'
import { useGameStore } from '@/stores/useGameStore'

/**
 * Награда за пройденный уровень: крокодил показывает новую наклейку.
 * Появляется сам, пока в сторе есть `newSticker`; касание уносит наклейку в альбом.
 */
const game = useGameStore()
const router = useRouter()
const { sayLine } = useAudio()
const open = ref(false)

function show(): void {
  if (game.newSticker === null) return
  open.value = true
  void sayLine('croc-new-sticker', 'Ура! Новая наклейка!')
}

onMounted(show)
watch(() => game.newSticker, show)

function take(): void {
  open.value = false
  game.clearNewSticker()
  void router.push({ name: 'album' })
}
</script>

<template>
  <Transition name="award">
    <button v-if="open && game.newSticker !== null" type="button" class="award" aria-label="Забрать наклейку в альбом" @click="take">
      <svg viewBox="0 0 440 320" class="h-full max-h-[34rem] w-full max-w-3xl" style="overflow: visible" aria-hidden="true">
        <g class="pop" transform="translate(220 105)"><g transform="scale(2.4)"><StickerBadge :value="game.newSticker" /></g></g>
        <Crocodile x="150" y="190" width="140" height="102" mood="happy" :mouth="0.5" />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.award {
  position: fixed;
  inset: 0;
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.55);
  cursor: pointer;
}
.pop {
  animation: pop 0.7s cubic-bezier(0.3, 1.6, 0.5, 1) both;
}
@keyframes pop {
  from {
    opacity: 0;
    transform: translate(220px, 105px) scale(0.2);
  }
}
.award-enter-active,
.award-leave-active {
  transition: opacity 0.25s;
}
.award-enter-from,
.award-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .pop {
    animation: none;
  }
}
</style>
