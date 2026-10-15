<script setup lang="ts">
/** Простые векторные значки вместо эмодзи: одинаково выглядят на любом устройстве. */
export type IconName = 'sound' | 'mute' | 'left' | 'right' | 'back' | 'home' | 'star' | 'hand' | 'again'

defineProps<{ name: IconName }>()
</script>

<template>
  <svg viewBox="0 0 48 48" class="h-[1em] w-[1em]" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <template v-if="name === 'sound' || name === 'mute'">
      <path d="M8 19h7l10-8v26l-10-8H8z" fill="#475569" stroke="#475569" stroke-width="3" />
      <template v-if="name === 'sound'">
        <path d="M31 17c3 4 3 10 0 14" stroke="#475569" stroke-width="4" />
        <path d="M36 11c6 7 6 19 0 26" stroke="#475569" stroke-width="4" />
      </template>
      <path v-else d="M32 18l10 12M42 18L32 30" stroke="#ef4444" stroke-width="4.5" />
    </template>
    <path v-else-if="name === 'left'" d="M30 9L14 24l16 15z" fill="#475569" stroke="#475569" stroke-width="5" />
    <path v-else-if="name === 'right'" d="M18 9l16 15-16 15z" fill="#475569" stroke="#475569" stroke-width="5" />
    <path v-else-if="name === 'back'" d="M40 24H10M22 11L9 24l13 13" stroke="#475569" stroke-width="6" />
    <template v-else-if="name === 'home'">
      <path d="M7 24L24 9l17 15" stroke="#475569" stroke-width="5" />
      <path d="M13 22v16h22V22" fill="#475569" stroke="#475569" stroke-width="3" />
      <path d="M21 38V28h6v10" fill="#fff" />
    </template>
    <path
      v-else-if="name === 'star'"
      d="M24 4l6.2 12.8 14 1.9-10.2 9.9 2.5 14L24 35.9 11.5 42.6l2.5-14L3.8 18.7l14-1.9z"
      fill="#facc15"
      stroke="#d97706"
      stroke-width="3"
    />
    <template v-else-if="name === 'hand'">
      <path
        d="M19 6a3 3 0 016 0v17l3-.5a3 3 0 013 2.5l.5 .3a3 3 0 013 2.5l1 .3a3 3 0 012 3l-1 8c-.5 4-3 6-7 6h-6c-3 0-5-1-7-4l-8-12a3 3 0 015-3l3 4z"
        fill="#fff"
        stroke="#334155"
        stroke-width="2.5"
      />
    </template>
    <path v-else d="M38 24a14 14 0 11-5-10.7M38 8v8h-8" stroke="#475569" stroke-width="5" />
  </svg>
</template>
