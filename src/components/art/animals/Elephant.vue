<script setup lang="ts">
/** Слонёнок: большие уши, хобот с завитком, маленькие бивни. Холст 220×160, смотрит вправо. */
</script>

<template>
  <g stroke="#3f5273" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <g class="fig-tail" style="transform-origin: 34px 124px">
      <path d="M36 128 Q16 134 16 114" fill="none" stroke="#3f5273" stroke-width="9" />
      <path d="M36 128 Q16 134 16 114" fill="none" stroke="#a9c1de" stroke-width="4" />
      <ellipse cx="16" cy="110" rx="5" ry="8" fill="#6d84a6" />
    </g>
    <g class="fig-breathe">
      <ellipse cx="82" cy="118" rx="56" ry="38" fill="#a9c1de" />
      <ellipse cx="100" cy="128" rx="28" ry="22" fill="#dbe7f5" stroke="none" />
      <path d="M44 100 Q56 90 76 92" fill="none" stroke="#fff" stroke-width="4" opacity=".45" />
      <ellipse cx="62" cy="148" rx="22" ry="10" fill="#97b1d2" />
      <ellipse cx="124" cy="148" rx="20" ry="10" fill="#a9c1de" />
      <path d="M114 150 v5 M124 151 v5 M134 150 v5" stroke-width="2.5" fill="none" />
      <!-- Дальнее ухо -->
      <g class="ear-far" style="transform-origin: 150px 60px"><ellipse cx="158" cy="64" rx="22" ry="30" fill="#8fa9cc" /></g>
      <!-- Голова -->
      <ellipse cx="132" cy="78" rx="42" ry="38" fill="#a9c1de" />
      <path d="M106 60 Q118 46 138 44" fill="none" stroke="#fff" stroke-width="4" opacity=".45" />
      <!-- Хобот с завитком -->
      <path d="M152 86 Q186 84 186 118 Q186 140 170 142 Q158 144 160 132 Q172 132 172 118 Q172 102 150 104Z" fill="#a9c1de" />
      <path d="M170 100 q8 4 8 14 M168 112 q4 2 4 8" fill="none" stroke="#7f99bd" stroke-width="3" />
      <path d="M142 104 q-4 12 4 16" fill="none" stroke="#fff" stroke-width="5" />
      <!-- Ближнее ухо -->
      <g class="ear-near" style="transform-origin: 108px 62px">
        <ellipse cx="104" cy="86" rx="28" ry="34" fill="#b8cde6" />
        <ellipse cx="106" cy="88" rx="16" ry="22" fill="#ffc2d4" stroke="none" opacity=".8" />
      </g>
      <ellipse cx="128" cy="100" rx="9" ry="6" fill="#ff8aa5" opacity=".5" stroke="none" />
      <g class="fig-blink">
        <ellipse cx="123" cy="71" rx="10" ry="11" fill="#fff" stroke-width="3" />
        <ellipse cx="126" cy="72" rx="5.5" ry="7" fill="#2a1a12" stroke="none" />
        <circle cx="128" cy="68.5" r="2.4" fill="#fff" stroke="none" />
      </g>
      <g class="fig-blink">
        <ellipse cx="154" cy="68" rx="9" ry="10" fill="#fff" stroke-width="3" />
        <ellipse cx="157" cy="69" rx="5" ry="6.5" fill="#2a1a12" stroke="none" />
        <circle cx="159" cy="65.5" r="2.2" fill="#fff" stroke="none" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.ear-near, .ear-far {
  transform-box: view-box;
  animation: ear-twitch 5.2s ease-in-out var(--phase, 0s) infinite;
}
.ear-far { animation-delay: calc(var(--phase, 0s) - 0.7s); }
@keyframes ear-twitch {
  0%, 88%, 100% { transform: rotate(0); }
  92% { transform: rotate(-6deg); }
  96% { transform: rotate(3deg); }
}
@media (prefers-reduced-motion: reduce) {
  .ear-near, .ear-far { animation: none; }
}
</style>
