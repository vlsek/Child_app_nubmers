<script setup lang="ts">
/** Котёнок: рыжий полосатый, длинный хвост трубой, усы. Холст 220×160. */
</script>

<template>
  <g stroke="#7a3a12" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <!-- Хвост: тёмная обводка + рыжая заливка -->
    <g class="fig-tail" style="transform-origin: 40px 128px">
      <path d="M40 130 Q6 132 10 96 Q12 76 24 70" fill="none" stroke="#7a3a12" stroke-width="18" />
      <path d="M40 130 Q6 132 10 96 Q12 76 24 70" fill="none" stroke="#f59a3c" stroke-width="10" />
      <path d="M8 108 h8 M10 92 h8 M16 78 l7 3" fill="none" stroke="#c9691c" stroke-width="3" />
    </g>
    <g class="fig-breathe">
      <!-- Тело -->
      <ellipse cx="78" cy="122" rx="54" ry="34" fill="#f59a3c" />
      <ellipse cx="98" cy="130" rx="28" ry="20" fill="#ffe7c4" stroke="none" />
      <path d="M44 100 v10 M54 94 v12 M64 92 v12" stroke="#c9691c" stroke-width="3.5" fill="none" />
      <path d="M42 102 Q56 92 74 94" fill="none" stroke="#fff" stroke-width="4" opacity=".3" />
      <ellipse cx="64" cy="148" rx="22" ry="10" fill="#e8872a" />
      <ellipse cx="122" cy="148" rx="18" ry="10" fill="#f59a3c" />
      <path d="M115 150 v5 M122 151 v5 M129 150 v5" stroke-width="2.5" fill="none" />
      <!-- Уши -->
      <g class="ear-near" style="transform-origin: 106px 50px">
        <path d="M88 60 Q86 22 98 8 Q114 14 128 44Z" fill="#f59a3c" />
        <path d="M95 44 Q96 28 100 20 Q108 24 114 36Z" fill="#ff9fb5" stroke="none" />
      </g>
      <g class="ear-far" style="transform-origin: 160px 44px">
        <path d="M140 44 Q154 14 168 8 Q182 28 172 68Z" fill="#e8872a" />
        <path d="M152 42 Q160 26 166 19 Q172 32 167 54Z" fill="#f78aa6" stroke="none" />
      </g>
      <!-- Голова -->
      <ellipse cx="128" cy="78" rx="49" ry="40" fill="#f59a3c" />
      <path d="M98 62 Q108 48 126 46" fill="none" stroke="#fff" stroke-width="4" opacity=".3" />
      <!-- Полоски на лбу и щеке -->
      <path d="M128 40 v12 M138 40 v10 M118 42 v10" stroke="#c9691c" stroke-width="3.5" fill="none" />
      <path d="M82 76 h10 M84 86 h10" stroke="#c9691c" stroke-width="3.5" fill="none" />
      <!-- Мордочка -->
      <ellipse cx="156" cy="92" rx="22" ry="16" fill="#ffe7c4" stroke="none" />
      <path d="M166 83 h10 l-5 7Z" fill="#ff7aa2" stroke-width="2.5" />
      <path d="M171 90 V95 M161 97 Q166 102 171 95 Q176 102 182 97" fill="none" stroke-width="3" />
      <path d="M150 90 l-22 -4 M150 94 l-24 4 M180 88 l22 -6 M180 94 l22 2" stroke-width="2" fill="none" opacity=".75" />
      <ellipse cx="108" cy="94" rx="10" ry="6" fill="#ff8aa5" opacity=".55" stroke="none" />
      <!-- Глаза -->
      <g class="fig-blink">
        <ellipse cx="121" cy="73" rx="10" ry="11" fill="#fff" stroke-width="3" />
        <ellipse cx="124" cy="74" rx="5.5" ry="7" fill="#2a1a12" stroke="none" />
        <circle cx="126" cy="70.5" r="2.4" fill="#fff" stroke="none" />
      </g>
      <g class="fig-blink">
        <ellipse cx="152" cy="70" rx="9" ry="10" fill="#fff" stroke-width="3" />
        <ellipse cx="155" cy="71" rx="5" ry="6.5" fill="#2a1a12" stroke="none" />
        <circle cx="157" cy="67.5" r="2.2" fill="#fff" stroke="none" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.ear-near, .ear-far {
  transform-box: view-box;
  animation: ear-twitch 5.2s ease-in-out var(--phase, 0s) infinite;
}
@keyframes ear-twitch {
  0%, 88%, 100% { transform: rotate(0); }
  92% { transform: rotate(-6deg); }
  96% { transform: rotate(3deg); }
}
@media (prefers-reduced-motion: reduce) {
  .ear-near, .ear-far { animation: none; }
}
</style>
