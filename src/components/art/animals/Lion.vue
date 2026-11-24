<script setup lang="ts">
/** Львёнок: рыжая грива вокруг мордочки, хвост с кисточкой. Холст 220×160, смотрит вправо. */
</script>

<template>
  <g stroke="#7a4310" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <g class="fig-tail" style="transform-origin: 40px 128px">
      <path d="M40 132 Q14 134 16 102" fill="none" stroke="#7a4310" stroke-width="12" />
      <path d="M40 132 Q14 134 16 102" fill="none" stroke="#f0b24a" stroke-width="5" />
      <ellipse cx="16" cy="96" rx="9" ry="13" fill="#c46a1c" />
    </g>
    <g class="fig-breathe">
      <ellipse cx="80" cy="122" rx="54" ry="34" fill="#f0b24a" />
      <ellipse cx="100" cy="130" rx="28" ry="20" fill="#fde7ad" stroke="none" />
      <path d="M44 104 Q56 94 74 96" fill="none" stroke="#fff" stroke-width="4" opacity=".4" />
      <ellipse cx="64" cy="148" rx="22" ry="10" fill="#e6a23a" />
      <ellipse cx="124" cy="148" rx="19" ry="10" fill="#f0b24a" />
      <path d="M116 150 v5 M124 151 v5 M132 150 v5" stroke-width="2.5" fill="none" />
      <!-- Грива -->
      <circle cx="128" cy="82" r="54" fill="#c46a1c" />
      <path d="M96 40 Q112 30 132 30" fill="none" stroke="#e0883a" stroke-width="5" opacity=".7" />
      <!-- Уши -->
      <g class="ear-far" style="transform-origin: 160px 52px"><circle cx="160" cy="40" r="12" fill="#f3c05a" /><circle cx="160" cy="41" r="5.5" fill="#ff9fb5" stroke="none" /></g>
      <g class="ear-near" style="transform-origin: 98px 52px"><circle cx="98" cy="42" r="13" fill="#f3c05a" /><circle cx="98" cy="43" r="6" fill="#ff9fb5" stroke="none" /></g>
      <!-- Мордочка -->
      <ellipse cx="130" cy="84" rx="40" ry="37" fill="#f6c667" />
      <ellipse cx="154" cy="98" rx="22" ry="16" fill="#fff1c9" stroke="none" />
      <path d="M163 87 h13 l-6.5 8Z" fill="#7a3a1a" stroke-width="2.5" />
      <path d="M169.5 95 V100 M160 102 Q165 107 169.5 100 Q175 107 181 102" fill="none" stroke-width="3" />
      <ellipse cx="108" cy="96" rx="9" ry="6" fill="#ff8aa5" opacity=".55" stroke="none" />
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
