<script setup lang="ts">
/** Мышонок: большие круглые ушки, тонкий розовый хвост, усики. Холст 220×160, смотрит вправо. */
</script>

<template>
  <g stroke="#4f4a63" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <g class="fig-tail" style="transform-origin: 40px 128px">
      <path d="M42 134 Q4 146 8 108 Q10 84 28 88" fill="none" stroke="#4f4a63" stroke-width="9" />
      <path d="M42 134 Q4 146 8 108 Q10 84 28 88" fill="none" stroke="#f9a8c4" stroke-width="4" />
    </g>
    <g class="fig-breathe">
      <ellipse cx="80" cy="122" rx="52" ry="33" fill="#c9c9d6" />
      <ellipse cx="100" cy="130" rx="27" ry="19" fill="#f1eff7" stroke="none" />
      <path d="M44 104 Q56 94 74 96" fill="none" stroke="#fff" stroke-width="4" opacity=".5" />
      <ellipse cx="64" cy="148" rx="20" ry="9" fill="#b9b9c8" />
      <ellipse cx="124" cy="148" rx="17" ry="9" fill="#c9c9d6" />
      <path d="M117 150 v5 M124 151 v5 M131 150 v5" stroke-width="2.5" fill="none" />
      <g class="ear-far" style="transform-origin: 156px 56px"><circle cx="158" cy="42" r="21" fill="#b9b9c8" /><circle cx="158" cy="43" r="12" fill="#ffb3c7" stroke="none" /></g>
      <ellipse cx="130" cy="86" rx="46" ry="37" fill="#d6d6e2" />
      <g class="ear-near" style="transform-origin: 104px 62px"><circle cx="102" cy="46" r="23" fill="#c9c9d6" /><circle cx="102" cy="47" r="13" fill="#ffb3c7" stroke="none" /></g>
      <path d="M98 76 Q108 62 126 60" fill="none" stroke="#fff" stroke-width="4" opacity=".5" />
      <ellipse cx="158" cy="98" rx="24" ry="16" fill="#f1eff7" stroke="none" />
      <circle cx="180" cy="94" r="6.5" fill="#ff7aa2" stroke-width="2.5" />
      <path d="M172 100 Q166 108 158 104 M172 100 Q178 108 186 104" fill="none" stroke-width="3" />
      <path d="M166 104 h6 v9 q-3 2 -6 0Z" fill="#fff" stroke-width="2.5" />
      <path d="M160 94 l-20 -5 M160 98 l-22 3 M184 90 l20 -8 M186 96 l20 0" stroke-width="2" fill="none" opacity=".7" />
      <ellipse cx="110" cy="98" rx="9" ry="6" fill="#ff8aa5" opacity=".55" stroke="none" />
      <g class="fig-blink">
        <ellipse cx="121" cy="75" rx="10" ry="11" fill="#fff" stroke-width="3" />
        <ellipse cx="124" cy="76" rx="5.5" ry="7" fill="#2a1a12" stroke="none" />
        <circle cx="126" cy="72.5" r="2.4" fill="#fff" stroke="none" />
      </g>
      <g class="fig-blink">
        <ellipse cx="152" cy="72" rx="9" ry="10" fill="#fff" stroke-width="3" />
        <ellipse cx="155" cy="73" rx="5" ry="6.5" fill="#2a1a12" stroke="none" />
        <circle cx="157" cy="69.5" r="2.2" fill="#fff" stroke="none" />
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
