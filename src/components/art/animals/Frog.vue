<script setup lang="ts">
/** Лягушонок: широкая улыбка, глаза-бугорки, задняя лапа и перепончатая передняя. Холст 220×160, смотрит вправо. */
</script>

<template>
  <g stroke="#1f6a34" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <!-- Задняя лапа (согнутая) -->
    <g>
      <path d="M14 150 Q10 118 40 112 Q66 110 74 134 L76 152 Z" fill="#4fc45a" />
      <path d="M12 154 Q22 146 30 154 M26 154 Q36 146 44 154 M40 154 Q50 146 58 154" fill="none" stroke-width="3" />
      <path d="M26 128 Q34 118 48 120" fill="none" stroke="#7fe08a" stroke-width="4" opacity=".7" />
    </g>
    <!-- Тело и голова дышат -->
    <g class="fig-breathe">
      <ellipse cx="82" cy="118" rx="54" ry="38" fill="#5fd068" />
      <ellipse cx="96" cy="130" rx="30" ry="24" fill="#e6f9b4" stroke="none" />
      <g fill="#3fae4c" stroke="none" opacity=".65"><circle cx="50" cy="100" r="5" /><circle cx="66" cy="92" r="3.5" /><circle cx="42" cy="116" r="3.5" /></g>
      <!-- Передняя лапка -->
      <ellipse cx="128" cy="148" rx="20" ry="9" fill="#4fc45a" />
      <path d="M114 152 v4 M124 154 v4 M134 154 v4 M144 152 v4" stroke-width="3" fill="none" />
      <!-- Голова -->
      <path d="M62 84 Q62 52 120 50 Q184 50 196 80 Q200 112 150 118 Q96 122 66 106 Q62 98 62 84Z" fill="#6fdc74" />
      <path d="M84 62 Q120 52 160 58" fill="none" stroke="#fff" stroke-width="4" opacity=".35" />
      <!-- Глаза-бугорки -->
      <circle cx="102" cy="48" r="20" fill="#6fdc74" />
      <circle cx="160" cy="48" r="20" fill="#6fdc74" />
      <g class="fig-blink">
        <circle cx="104" cy="47" r="14" fill="#fff" stroke-width="3" />
        <circle cx="108" cy="48" r="7" fill="#1b2a1f" stroke="none" />
        <circle cx="111" cy="45" r="2.6" fill="#fff" stroke="none" />
      </g>
      <g class="fig-blink">
        <circle cx="160" cy="47" r="14" fill="#fff" stroke-width="3" />
        <circle cx="165" cy="48" r="7" fill="#1b2a1f" stroke="none" />
        <circle cx="168" cy="45" r="2.6" fill="#fff" stroke="none" />
      </g>
      <!-- Щёки, ноздри, улыбка -->
      <ellipse cx="94" cy="96" rx="10" ry="6" fill="#ff8aa5" opacity=".6" stroke="none" />
      <ellipse cx="178" cy="94" rx="9" ry="5.5" fill="#ff8aa5" opacity=".6" stroke="none" />
      <circle cx="150" cy="72" r="2.4" fill="#1f6a34" stroke="none" />
      <circle cx="166" cy="72" r="2.4" fill="#1f6a34" stroke="none" />
      <path d="M100 90 Q136 112 184 86" fill="none" stroke-width="4" />
      <path d="M126 102 Q140 112 156 100 Q142 98 126 102Z" fill="#f472b6" stroke-width="2.5" />
    </g>
  </g>
</template>
