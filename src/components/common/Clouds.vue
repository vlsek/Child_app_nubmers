<script setup lang="ts">
/** Облачка, которые медленно плывут за игрой. Фон: не ловят касания, лежат под содержимым. */
const clouds = [
  { top: '9%', size: 150, dur: 90, delay: -20, op: 0.75 },
  { top: '24%', size: 100, dur: 120, delay: -70, op: 0.55 },
  { top: '60%', size: 130, dur: 105, delay: -45, op: 0.5 },
]
</script>

<template>
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <svg
      v-for="(c, i) in clouds"
      :key="i"
      viewBox="0 0 120 60"
      class="cloud absolute left-0"
      :style="{ top: c.top, width: `${c.size}px`, opacity: c.op, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }"
    >
      <path d="M24 52 Q4 52 6 36 Q8 22 26 24 Q30 6 52 8 Q70 8 74 24 Q88 14 100 26 Q116 30 112 44 Q110 52 96 52Z" fill="#fff" />
    </svg>
  </div>
</template>

<style scoped>
.cloud {
  animation: drift linear infinite;
  transform: translateX(-200px);
}
@keyframes drift {
  from { transform: translateX(-200px); }
  to { transform: translateX(calc(100vw + 200px)); }
}
@media (prefers-reduced-motion: reduce) {
  .cloud { animation: none; transform: translateX(10vw); }
}
</style>
