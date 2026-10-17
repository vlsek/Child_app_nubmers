<script setup lang="ts">
/** Зайчик: светло-серый, длинные уши с розовой серединкой, пушистый хвостик. Холст 220×160. */
</script>

<template>
  <g stroke="#5b4a5e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <g class="fig-tail" style="transform-origin: 34px 128px">
      <circle cx="24" cy="126" r="13" fill="#fff" />
      <path d="M17 122 Q20 117 26 118" fill="none" stroke="#d9d3e0" stroke-width="3" />
    </g>
    <g class="fig-breathe">
      <!-- Тело -->
      <ellipse cx="78" cy="122" rx="54" ry="34" fill="#e3dfe8" />
      <ellipse cx="98" cy="130" rx="28" ry="20" fill="#fff" stroke="none" />
      <path d="M42 102 Q56 92 74 94" fill="none" stroke="#fff" stroke-width="4" opacity=".7" />
      <!-- Большая задняя лапа и передняя -->
      <ellipse cx="66" cy="148" rx="28" ry="10" fill="#d4cfdc" />
      <path d="M52 150 v5 M62 151 v5 M72 151 v5" stroke-width="2.5" fill="none" />
      <ellipse cx="124" cy="148" rx="17" ry="9" fill="#e3dfe8" />
      <path d="M118 150 v5 M125 151 v5 M131 150 v5" stroke-width="2.5" fill="none" />
      <!-- Уши -->
      <g class="ear-near" style="transform-origin: 108px 58px">
        <path d="M100 58 Q82 22 98 8 Q116 10 118 56Z" fill="#e3dfe8" />
        <path d="M104 52 Q94 26 101 16 Q110 20 111 50Z" fill="#ffb3c7" stroke="none" />
      </g>
      <g class="ear-far" style="transform-origin: 148px 52px">
        <path d="M142 52 Q142 14 160 8 Q176 20 164 54Z" fill="#d4cfdc" />
        <path d="M148 48 Q148 24 159 17 Q166 26 160 48Z" fill="#f59cb4" stroke="none" />
      </g>
      <!-- Голова -->
      <ellipse cx="128" cy="86" rx="46" ry="38" fill="#e3dfe8" />
      <path d="M98 72 Q108 58 128 56" fill="none" stroke="#fff" stroke-width="4" opacity=".7" />
      <!-- Мордочка -->
      <ellipse cx="156" cy="98" rx="22" ry="16" fill="#fff" stroke="none" />
      <path d="M168 92 q4 -5 8 0 q-3 6 -8 0Z" fill="#ff7aa2" stroke-width="2.5" />
      <path d="M172 97 V102 M162 103 Q167 108 172 102 Q177 108 182 103" fill="none" stroke-width="3" />
      <!-- Зубки -->
      <path d="M166 106 h7 v8 q-3.5 2 -7 0Z" fill="#fff" stroke-width="2.5" />
      <ellipse cx="110" cy="102" rx="10" ry="6" fill="#ff8aa5" opacity=".55" stroke="none" />
      <!-- Глаза -->
      <g class="fig-blink">
        <circle cx="122" cy="82" r="10" fill="#fff" stroke-width="3" />
        <circle cx="125" cy="83" r="6" fill="#3b2b45" stroke="none" />
        <circle cx="127" cy="80.5" r="2.2" fill="#fff" stroke="none" />
      </g>
      <g class="fig-blink">
        <circle cx="152" cy="79" r="9" fill="#fff" stroke-width="3" />
        <circle cx="155" cy="80" r="5.5" fill="#3b2b45" stroke="none" />
        <circle cx="157" cy="77.5" r="2" fill="#fff" stroke="none" />
      </g>
    </g>
  </g>
</template>

<style scoped>
.ear-near, .ear-far {
  transform-box: view-box;
  animation: ear-wiggle 4.6s ease-in-out var(--phase, 0s) infinite;
}
.ear-far { animation-delay: calc(var(--phase, 0s) - 0.3s); }
@keyframes ear-wiggle {
  0%, 80%, 100% { transform: rotate(0); }
  86% { transform: rotate(-7deg); }
  92% { transform: rotate(4deg); }
}
@media (prefers-reduced-motion: reduce) {
  .ear-near, .ear-far { animation: none; }
}
</style>
