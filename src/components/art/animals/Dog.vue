<script setup lang="ts">
/** Щенок: бежевый, висячее тёмное ухо, красный ошейник, язычок, виляющий хвост. Холст 220×160. */
</script>

<template>
  <g stroke="#5a3b22" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <!-- Хвост вверх -->
    <g class="fig-tail wag" style="transform-origin: 36px 128px">
      <path d="M36 130 Q8 128 12 94" fill="none" stroke="#5a3b22" stroke-width="18" />
      <path d="M36 130 Q8 128 12 94" fill="none" stroke="#e2b27a" stroke-width="10" />
    </g>
    <g class="fig-breathe">
      <!-- Тело -->
      <ellipse cx="78" cy="122" rx="54" ry="34" fill="#e2b27a" />
      <ellipse cx="98" cy="130" rx="28" ry="20" fill="#fbe9cc" stroke="none" />
      <path d="M42 102 Q56 92 74 94" fill="none" stroke="#fff" stroke-width="4" opacity=".35" />
      <ellipse cx="64" cy="148" rx="22" ry="10" fill="#d4a068" />
      <ellipse cx="122" cy="148" rx="18" ry="10" fill="#e2b27a" />
      <path d="M115 150 v5 M122 151 v5 M129 150 v5" stroke-width="2.5" fill="none" />
      <!-- Дальнее ухо -->
      <g class="ear-far" style="transform-origin: 156px 40px">
        <path d="M148 40 Q164 18 178 34 Q184 54 166 60Z" fill="#7a4d2a" />
      </g>
      <!-- Голова -->
      <ellipse cx="128" cy="76" rx="48" ry="42" fill="#e2b27a" />
      <path d="M100 56 Q112 42 130 42" fill="none" stroke="#fff" stroke-width="4" opacity=".35" />
      <!-- Тёмное пятно вокруг дальнего глаза -->
      <ellipse cx="152" cy="64" rx="14" ry="16" fill="#8a5a33" stroke="none" />
      <!-- Мордочка -->
      <ellipse cx="158" cy="92" rx="26" ry="19" fill="#fbe9cc" />
      <ellipse cx="177" cy="83" rx="10" ry="7" fill="#2b1c14" stroke="none" />
      <ellipse cx="174" cy="80.5" rx="3.5" ry="2" fill="#fff" stroke="none" opacity=".7" />
      <path d="M177 90 V96 M164 98 Q170 103 177 96" fill="none" stroke-width="3" />
      <!-- Язычок -->
      <path d="M168 99 q0 15 9 14 q8 -2 5 -16Z" fill="#ff6f8e" stroke-width="3" />
      <path d="M175 100 v7" stroke-width="2" fill="none" />
      <ellipse cx="110" cy="92" rx="10" ry="6" fill="#ff8aa5" opacity=".55" stroke="none" />
      <!-- Висячее ухо -->
      <g class="ear-near" style="transform-origin: 100px 46px">
        <path d="M104 44 Q76 34 76 70 Q78 100 100 96 Q116 84 112 56Z" fill="#7a4d2a" />
        <path d="M90 52 Q84 70 90 86" fill="none" stroke="#fff" stroke-width="3" opacity=".25" />
      </g>
      <!-- Глаза -->
      <g class="fig-blink">
        <circle cx="124" cy="68" r="10" fill="#fff" stroke-width="3" />
        <circle cx="127" cy="69" r="6" fill="#2a1a12" stroke="none" />
        <circle cx="129" cy="66.5" r="2.2" fill="#fff" stroke="none" />
      </g>
      <g class="fig-blink">
        <circle cx="153" cy="65" r="9" fill="#fff" stroke-width="3" />
        <circle cx="156" cy="66" r="5.5" fill="#2a1a12" stroke="none" />
        <circle cx="158" cy="63.5" r="2" fill="#fff" stroke="none" />
      </g>
      <!-- Ошейник -->
      <path d="M90 112 Q116 126 150 112" fill="none" stroke="#5a3b22" stroke-width="11" />
      <path d="M90 112 Q116 126 150 112" fill="none" stroke="#ef4444" stroke-width="5" />
      <circle cx="122" cy="123" r="5" fill="#facc15" stroke-width="2.5" />
    </g>
  </g>
</template>

<style scoped>
.wag { animation-duration: 0.9s; }
.ear-near {
  transform-box: view-box;
  animation: ear-flop 3.6s ease-in-out var(--phase, 0s) infinite;
}
.ear-far {
  transform-box: view-box;
  animation: ear-flop 3.6s ease-in-out calc(var(--phase, 0s) - 0.4s) infinite;
}
@keyframes ear-flop {
  0%, 100% { transform: rotate(0); }
  50% { transform: rotate(3deg); }
}
@media (prefers-reduced-motion: reduce) {
  .wag, .ear-near, .ear-far { animation: none; }
}
</style>
