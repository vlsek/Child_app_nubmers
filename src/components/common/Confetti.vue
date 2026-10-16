<script setup lang="ts">
/**
 * Салют из конфетти и звёздочек. Меняйте `burst` (счётчик) — каждый новый номер запускает новый залп.
 * Работает только на CSS, не мешает касаниям. `big` — залп побольше (конец уровня).
 */
const props = defineProps<{ burst: number; big?: boolean }>()

const COLORS = ['#f43f5e', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#a855f7', '#ec4899']
const pieces = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5
    const r = 90 + Math.random() * (props.big ? 200 : 130)
    return {
      dx: Math.round(Math.cos(a) * r),
      dy: Math.round(Math.sin(a) * r - 40),
      rot: Math.round(Math.random() * 720 - 360),
      color: COLORS[i % COLORS.length]!,
      star: i % 4 === 0,
      delay: Math.round(Math.random() * 120),
    }
  })
</script>

<template>
  <div v-if="burst > 0" :key="burst" class="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
    <div class="absolute left-1/2 top-[45%]">
      <span
        v-for="(p, i) in pieces(big ? 44 : 26)"
        :key="i"
        class="piece"
        :class="{ star: p.star }"
        :style="{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg`, background: p.star ? 'transparent' : p.color, color: p.color, animationDelay: `${p.delay}ms` }"
      >
        <template v-if="p.star">★</template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.piece {
  position: absolute;
  width: 12px;
  height: 18px;
  border-radius: 3px;
  opacity: 0;
  animation: burst 1.3s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
}
.piece.star {
  width: auto;
  height: auto;
  font-size: 26px;
  line-height: 1;
}
@keyframes burst {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(0.3);
  }
  60% {
    opacity: 1;
    transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--dx), calc(var(--dy) + 120px)) rotate(calc(var(--rot) * 1.5)) scale(0.9);
  }
}
@media (prefers-reduced-motion: reduce) {
  .piece {
    animation-duration: 0.01s;
  }
}
</style>
