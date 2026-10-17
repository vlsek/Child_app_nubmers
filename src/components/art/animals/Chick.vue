<script setup lang="ts">
/** Цыплёнок: круглый жёлтый пушистик, хохолок, оранжевый клюв, крылышко машет. Холст 220×160, смотрит вправо. */
</script>

<template>
  <g stroke="#b8661a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <!-- Хвостик из перьев -->
    <g class="fig-tail" style="transform-origin: 44px 120px">
      <path d="M46 126 Q24 122 20 96 Q36 100 44 108 Q34 88 44 78 Q56 92 56 110Z" fill="#ffd93b" />
    </g>
    <!-- Ножки -->
    <path d="M82 138 V154 M82 154 l-9 2 M82 154 l9 2" fill="none" stroke="#f08a1c" stroke-width="4.5" />
    <path d="M118 138 V154 M118 154 l-9 2 M118 154 l9 2" fill="none" stroke="#f08a1c" stroke-width="4.5" />
    <g class="fig-breathe">
      <!-- Круглое тельце -->
      <ellipse cx="98" cy="104" rx="58" ry="44" fill="#ffe14d" />
      <ellipse cx="108" cy="120" rx="32" ry="20" fill="#fff4b0" stroke="none" />
      <path d="M52 90 Q60 74 78 70" fill="none" stroke="#fff" stroke-width="4" opacity=".5" />
      <!-- Крылышко машет -->
      <g class="chick-wing">
        <path d="M64 100 Q50 124 78 136 Q100 128 94 104 Q80 92 64 100Z" fill="#ffd22e" />
        <path d="M72 112 Q78 124 86 126" fill="none" stroke-width="3" />
      </g>
      <!-- Хохолок -->
      <path d="M118 36 Q108 14 120 12 Q124 22 128 30 Q130 8 142 10 Q142 22 138 34 Q152 20 158 28 Q154 38 146 44Z" fill="#ffd22e" />
      <!-- Голова -->
      <ellipse cx="132" cy="68" rx="48" ry="42" fill="#ffe14d" />
      <path d="M100 50 Q122 34 150 38" fill="none" stroke="#fff" stroke-width="4" opacity=".5" />
      <!-- Клюв -->
      <path d="M168 66 Q192 64 200 74 Q190 86 168 82Z" fill="#ff9a2e" />
      <path d="M170 76 Q186 78 196 74" fill="none" stroke-width="2.5" />
      <!-- Глаза -->
      <g class="fig-blink">
        <circle cx="128" cy="60" r="11" fill="#fff" stroke-width="3" />
        <circle cx="131" cy="62" r="6.5" fill="#2b1a0e" stroke="none" />
        <circle cx="133.5" cy="58.5" r="2.4" fill="#fff" stroke="none" />
      </g>
      <g class="fig-blink">
        <circle cx="160" cy="58" r="8.5" fill="#fff" stroke-width="3" />
        <circle cx="162.5" cy="60" r="5" fill="#2b1a0e" stroke="none" />
        <circle cx="164.5" cy="57" r="1.8" fill="#fff" stroke="none" />
      </g>
      <ellipse cx="116" cy="84" rx="9" ry="5.5" fill="#ff8a6b" opacity=".6" stroke="none" />
      <ellipse cx="158" cy="82" rx="7" ry="4.5" fill="#ff8a6b" opacity=".6" stroke="none" />
    </g>
  </g>
</template>

<style scoped>
.chick-wing {
  transform-box: view-box;
  transform-origin: 78px 98px;
  animation: chick-flap 2.8s ease-in-out var(--phase, 0s) infinite;
}
@keyframes chick-flap {
  0%, 80%, 100% { transform: rotate(0); }
  86% { transform: rotate(-16deg); }
  92% { transform: rotate(4deg); }
  96% { transform: rotate(-10deg); }
}
@media (prefers-reduced-motion: reduce) {
  .chick-wing { animation: none; }
}
</style>
