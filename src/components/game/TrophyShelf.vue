<script setup lang="ts">
import { computed } from 'vue'
import Crocodile from '@/components/art/Crocodile.vue'

/**
 * Полка наград под выбором машинки: десять звёздочек (по одной за каждую выученную цифру).
 * Когда горят все десять, крокодил надевает корону и радуется.
 */
const props = defineProps<{ learned: boolean[] }>()
const all = computed(() => props.learned.length > 0 && props.learned.every(Boolean))
</script>

<template>
  <div class="flex shrink-0 items-center justify-center gap-3 px-4 pb-3" aria-hidden="true">
    <svg v-if="all" viewBox="0 0 110 80" class="h-16 w-24 shrink-0 sm:h-20 sm:w-28">
      <Crocodile x="0" y="14" width="110" height="66" mood="happy" :mouth="0.3" />
      <path d="M38 22 L42 6 L52 16 L60 2 L68 16 L78 6 L82 22Z" fill="#facc15" stroke="#b45309" stroke-width="3" stroke-linejoin="round" />
    </svg>
    <svg viewBox="0 0 250 26" class="h-6 w-60 sm:h-8 sm:w-80">
      <path
        v-for="(on, i) in learned"
        :key="i"
        :transform="`translate(${i * 25 + 12.5} 13) scale(.5)`"
        d="M0 -22 L6 -7 L22 -7 L9 3 L14 19 L0 10 L-14 19 L-9 3 L-22 -7 L-6 -7Z"
        :fill="on ? '#facc15' : '#ffffff'"
        :fill-opacity="on ? 1 : 0.45"
        :stroke="on ? '#b45309' : '#94a3b8'"
        stroke-width="3"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>
