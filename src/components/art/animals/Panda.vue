<script setup lang="ts">
/** Панда: чёрно-белый мишка с пятнами вокруг глаз, сидит боком, смотрит вправо. Холст 220×160. */
</script>

<template>
  <g stroke="#2b2b33" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <g class="fig-tail" style="transform-origin: 34px 128px">
      <circle cx="26" cy="128" r="11" fill="#fff" />
    </g>
    <g class="fig-breathe">
      <!-- Тело -->
      <ellipse cx="78" cy="120" rx="56" ry="36" fill="#fafafa" />
      <!-- Чёрная передняя лапа-плечо и лапки -->
      <path d="M96 94 Q86 112 100 146 L128 148 Q134 120 122 98Z" fill="#2f2f38" />
      <path d="M44 100 Q50 88 70 86" fill="none" stroke="#b8c4d6" stroke-width="3" opacity=".7" />
      <ellipse cx="62" cy="148" rx="22" ry="10" fill="#2f2f38" />
      <ellipse cx="118" cy="148" rx="19" ry="10" fill="#2f2f38" />
      <path d="M110 150 v5 M118 151 v5 M126 150 v5" stroke="#9aa0b0" stroke-width="2.5" fill="none" />
      <!-- Уши -->
      <circle cx="94" cy="36" r="16" fill="#2f2f38" />
      <circle cx="96" cy="38" r="7" fill="#4b4b58" stroke="none" />
      <g class="ear-far" style="transform-origin: 158px 38px">
        <circle cx="160" cy="28" r="14" fill="#2f2f38" />
        <circle cx="159" cy="30" r="6" fill="#4b4b58" stroke="none" />
      </g>
      <!-- Голова -->
      <ellipse cx="127" cy="72" rx="50" ry="44" fill="#fafafa" />
      <path d="M96 50 Q112 34 134 36" fill="none" stroke="#b8c4d6" stroke-width="4" opacity=".6" />
      <!-- Пятна у глаз -->
      <ellipse cx="119" cy="66" rx="14" ry="17" transform="rotate(25 119 66)" fill="#2f2f38" />
      <ellipse cx="153" cy="62" rx="12" ry="15" transform="rotate(25 153 62)" fill="#2f2f38" />
      <!-- Мордочка -->
      <ellipse cx="158" cy="88" rx="22" ry="16" fill="#fff" stroke="none" />
      <ellipse cx="172" cy="80" rx="8" ry="5.5" fill="#2f2f38" stroke="none" />
      <ellipse cx="170" cy="78" rx="3" ry="1.6" fill="#fff" stroke="none" opacity=".7" />
      <path d="M172 85 V91 M162 93 Q167 99 172 91 Q177 99 183 92" fill="none" stroke-width="3" />
      <ellipse cx="116" cy="92" rx="10" ry="6" fill="#ff8aa5" opacity=".6" stroke="none" />
      <!-- Глаза -->
      <g class="fig-blink">
        <circle cx="121" cy="65" r="7.5" fill="#fff" stroke="none" />
        <circle cx="123" cy="66" r="4.6" fill="#15151a" stroke="none" />
        <circle cx="124.6" cy="64" r="1.8" fill="#fff" stroke="none" />
      </g>
      <g class="fig-blink">
        <circle cx="152" cy="61" r="7" fill="#fff" stroke="none" />
        <circle cx="154" cy="62" r="4.3" fill="#15151a" stroke="none" />
        <circle cx="155.5" cy="60" r="1.7" fill="#fff" stroke="none" />
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
