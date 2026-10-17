<script setup lang="ts">
/** Медведь: бурый мишка, сидит боком, смотрит вправо. Холст 220×160. */
</script>

<template>
  <g stroke="#4a2f22" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <!-- Хвостик-шарик -->
    <g class="fig-tail" style="transform-origin: 34px 128px">
      <circle cx="26" cy="128" r="11" fill="#a96a3c" />
    </g>
    <g class="fig-breathe">
      <!-- Тело -->
      <ellipse cx="78" cy="120" rx="56" ry="36" fill="#b97b4b" />
      <ellipse cx="98" cy="128" rx="30" ry="22" fill="#f0cf9f" stroke="none" />
      <path d="M40 98 Q56 88 74 92" fill="none" stroke="#fff" stroke-width="4" opacity=".3" />
      <!-- Задняя лапа и передняя лапка -->
      <ellipse cx="62" cy="148" rx="22" ry="10" fill="#a96a3c" />
      <ellipse cx="122" cy="148" rx="19" ry="10" fill="#b97b4b" />
      <path d="M114 150 v5 M122 151 v5 M130 150 v5" stroke-width="2.5" fill="none" />
      <ellipse cx="62" cy="150" rx="9" ry="4" fill="#f0cf9f" stroke="none" />
      <!-- Уши -->
      <circle cx="94" cy="36" r="16" fill="#b97b4b" />
      <circle cx="95" cy="38" r="8" fill="#f0a48f" stroke="none" />
      <g class="ear-far" style="transform-origin: 158px 38px">
        <circle cx="160" cy="28" r="14" fill="#a96a3c" />
        <circle cx="159" cy="30" r="7" fill="#e69580" stroke="none" />
      </g>
      <!-- Голова -->
      <ellipse cx="127" cy="72" rx="50" ry="44" fill="#b97b4b" />
      <path d="M96 50 Q112 34 134 36" fill="none" stroke="#fff" stroke-width="4" opacity=".3" />
      <!-- Мордочка -->
      <ellipse cx="156" cy="88" rx="25" ry="19" fill="#f0cf9f" />
      <ellipse cx="171" cy="79" rx="9" ry="6" fill="#3a2418" stroke="none" />
      <ellipse cx="169" cy="77" rx="3" ry="1.8" fill="#fff" stroke="none" opacity=".7" />
      <path d="M171 85 V92 M160 94 Q166 101 171 92 Q176 100 183 93" fill="none" stroke-width="3" />
      <!-- Щёчки -->
      <ellipse cx="112" cy="90" rx="10" ry="6" fill="#ff8aa5" opacity=".55" stroke="none" />
      <!-- Глаза -->
      <g class="fig-blink">
        <circle cx="121" cy="64" r="10" fill="#fff" stroke-width="3" />
        <circle cx="124" cy="65" r="6" fill="#2a1a12" stroke="none" />
        <circle cx="126" cy="62.5" r="2.2" fill="#fff" stroke="none" />
      </g>
      <g class="fig-blink">
        <circle cx="152" cy="61" r="9" fill="#fff" stroke-width="3" />
        <circle cx="155" cy="62" r="5.5" fill="#2a1a12" stroke="none" />
        <circle cx="157" cy="59.5" r="2" fill="#fff" stroke="none" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.ear-far {
  transform-box: view-box;
  animation: ear-wiggle 5s ease-in-out var(--phase, 0s) infinite;
}
@keyframes ear-wiggle {
  0%, 85%, 100% { transform: rotate(0); }
  90% { transform: rotate(-8deg); }
  95% { transform: rotate(4deg); }
}
@media (prefers-reduced-motion: reduce) {
  .ear-far { animation: none; }
}
</style>
