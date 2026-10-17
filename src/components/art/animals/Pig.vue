<script setup lang="ts">
/** Поросёнок: розовый, большой пятачок, ушки-треугольники, хвостик-пружинка. Холст 220×160, смотрит вправо. */
</script>

<template>
  <g stroke="#9d3c5c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <!-- Хвостик-пружинка -->
    <g class="fig-tail" style="transform-origin: 34px 112px">
      <path d="M36 114 Q14 112 16 98 Q20 88 28 94 Q32 102 22 102" fill="none" stroke-width="4.5" />
    </g>
    <g class="fig-breathe">
      <!-- Задняя ножка -->
      <ellipse cx="56" cy="148" rx="18" ry="9" fill="#f59ab4" />
      <ellipse cx="80" cy="120" rx="54" ry="38" fill="#ffb4c8" />
      <ellipse cx="94" cy="132" rx="30" ry="22" fill="#ffe0ea" stroke="none" />
      <path d="M40 104 Q52 92 70 94" fill="none" stroke="#fff" stroke-width="4" opacity=".45" />
      <!-- Передняя ножка -->
      <ellipse cx="116" cy="148" rx="17" ry="9" fill="#f59ab4" />
      <path d="M110 152 v4 M122 152 v4" stroke-width="3" fill="none" />
      <path d="M50 152 v4 M62 152 v4" stroke-width="3" fill="none" />
      <!-- Дальнее ухо -->
      <path d="M78 52 L84 20 L108 40Z" fill="#f59ab4" />
      <!-- Голова -->
      <ellipse cx="128" cy="78" rx="56" ry="46" fill="#ffb4c8" />
      <!-- Ближнее ухо -->
      <path d="M96 44 L98 12 L128 34Z" fill="#ffb4c8" />
      <path d="M100 36 L101 22 L116 33Z" fill="#ff8fb0" stroke="none" />
      <path d="M92 58 Q116 40 150 42" fill="none" stroke="#fff" stroke-width="4" opacity=".4" />
      <!-- Глаза -->
      <g class="fig-blink">
        <ellipse cx="124" cy="68" rx="11" ry="13" fill="#fff" stroke-width="3" />
        <circle cx="127" cy="70" r="6.5" fill="#2a1520" stroke="none" />
        <circle cx="129.5" cy="66.5" r="2.4" fill="#fff" stroke="none" />
      </g>
      <g class="fig-blink">
        <ellipse cx="162" cy="68" rx="9" ry="12" fill="#fff" stroke-width="3" />
        <circle cx="165" cy="70" r="5.5" fill="#2a1520" stroke="none" />
        <circle cx="167" cy="66.5" r="2" fill="#fff" stroke="none" />
      </g>
      <!-- Щёки, пятачок, улыбка -->
      <ellipse cx="112" cy="96" rx="10" ry="6" fill="#ff7a9c" opacity=".6" stroke="none" />
      <ellipse cx="176" cy="94" rx="8" ry="5" fill="#ff7a9c" opacity=".6" stroke="none" />
      <ellipse cx="170" cy="92" rx="26" ry="19" fill="#ff93b2" />
      <ellipse cx="162" cy="92" rx="3.5" ry="6.5" fill="#9d3c5c" stroke="none" />
      <ellipse cx="178" cy="92" rx="3.5" ry="6.5" fill="#9d3c5c" stroke="none" />
      <path d="M140 112 Q156 122 176 112" fill="none" stroke-width="3.5" />
    </g>
  </g>
</template>
