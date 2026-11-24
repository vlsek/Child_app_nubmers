<script setup lang="ts">
import { computed } from 'vue'
import { STARS_PER_GIFT } from '@/data/gifts'
import { useGameStore } from '@/stores/useGameStore'

/**
 * Звёзды копятся к подарку: восемь звёздочек, и когда все горят, коробка прыгает и просит открыть.
 * Подарок надевает на крокодила новый наряд. Когда все наряды собраны, значок исчезает.
 */
const emit = defineEmits<{ open: [] }>()
const game = useGameStore()

const ready = computed(() => game.giftsReady > 0)
const filled = computed(() => (ready.value ? STARS_PER_GIFT : game.starsIntoGift))
const dots = Array.from({ length: STARS_PER_GIFT }, (_, i) => i)
</script>

<template>
  <button
    v-if="!game.allGifts"
    type="button"
    class="gift [@media(max-height:500px)]:h-14"
    :class="{ ready }"
    :aria-label="ready ? 'Открыть подарок' : `Звёзд собрано: ${filled} из ${STARS_PER_GIFT}`"
    @click="ready && emit('open')"
  >
    <svg viewBox="0 0 48 48" class="box" aria-hidden="true" stroke-linejoin="round" stroke-linecap="round">
      <rect x="6" y="20" width="36" height="24" rx="4" fill="#f43f5e" stroke="#be123c" stroke-width="2.5" />
      <rect x="3" y="12" width="42" height="11" rx="4" fill="#fb7185" stroke="#be123c" stroke-width="2.5" />
      <rect x="21" y="12" width="6" height="32" fill="#facc15" stroke="#d97706" stroke-width="2" />
      <path d="M24 12 C16 2 8 8 14 12 Z M24 12 C32 2 40 8 34 12 Z" fill="#facc15" stroke="#d97706" stroke-width="2" />
    </svg>
    <span class="dots" aria-hidden="true">
      <svg v-for="i in dots" :key="i" viewBox="0 0 20 20" class="dot" :class="{ on: i < filled }" stroke-linejoin="round">
        <path d="M10 1.8l2.5 5.4 5.9.7-4.4 4 1.2 5.8L10 14.7l-5.2 3 1.2-5.8-4.4-4 5.9-.7z" />
      </svg>
    </span>
  </button>
</template>

<style scoped>
.gift {
  display: flex;
  height: 5rem;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem 0 0.75rem;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 8px 14px rgba(0, 0, 0, 0.18);
}
.box {
  width: 2.75rem;
  height: 2.75rem;
  flex: none;
}
.dots {
  display: grid;
  grid-template-columns: repeat(4, 1.1rem);
  gap: 0.2rem;
}
.dot {
  width: 1.1rem;
  height: 1.1rem;
  fill: #e5e7eb;
  stroke: #d1d5db;
  stroke-width: 1.4;
  transition: fill 0.3s;
}
.dot.on {
  fill: #facc15;
  stroke: #d97706;
}
.ready {
  animation: bounce 0.9s ease-in-out infinite;
  box-shadow: 0 0 0 6px rgba(250, 204, 21, 0.55), 0 8px 14px rgba(0, 0, 0, 0.18);
}
.ready .box {
  animation: wiggle 0.9s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes wiggle {
  0%, 100% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg); }
}
@media (prefers-reduced-motion: reduce) {
  .ready, .ready .box { animation: none; }
}
</style>
