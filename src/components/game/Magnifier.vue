<script setup lang="ts">
/** Лупа: значок режима «Найди цифру». Покачивается, будто что-то ищет. */
</script>

<template>
  <svg viewBox="0 0 100 100" class="magnifier" aria-hidden="true" style="overflow: visible" stroke-linejoin="round" stroke-linecap="round">
    <g class="sway">
      <line x1="62" y1="62" x2="90" y2="90" stroke="#7c2d12" stroke-width="13" />
      <line x1="62" y1="62" x2="90" y2="90" stroke="#c2410c" stroke-width="7" />
      <circle cx="40" cy="40" r="30" fill="#e0f2fe" fill-opacity="0.65" stroke="#7c2d12" stroke-width="10" />
      <circle cx="40" cy="40" r="30" fill="none" stroke="#f97316" stroke-width="5" />
      <path d="M22 34 A19 19 0 0 1 36 21" fill="none" stroke="#fff" stroke-width="5" opacity="0.95" />
    </g>
  </svg>
</template>

<style scoped>
.magnifier {
  display: block;
  filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.25));
}
.sway {
  transform-origin: 50% 50%;
  animation: sway 2.6s ease-in-out infinite;
}
@keyframes sway {
  0%, 100% { transform: rotate(-9deg) translateX(-3px); }
  50% { transform: rotate(9deg) translateX(3px); }
}
@media (prefers-reduced-motion: reduce) {
  .sway { animation: none; }
}
</style>
