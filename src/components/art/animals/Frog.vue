<script setup lang="ts">
/** Лягушонок: широкая улыбка, глаза-бугорки, задняя лапа и перепончатая передняя. Холст 220×160, смотрит вправо. */
</script>

<template>
  <g stroke="#1f6a34" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
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
    <!-- Задняя лапа: бедро поверх тела, ступня с перепонками стоит на земле -->
    <g>
      <ellipse cx="46" cy="124" rx="31" ry="27" fill="#58c963" />
      <path d="M30 108 Q42 102 56 108" fill="none" stroke="#7fe08a" stroke-width="4" opacity=".7" />
      <path d="M8 156 Q8 142 26 144 L74 146 Q84 152 76 158 L14 158 Q8 158 8 156Z" fill="#4fc45a" />
      <path d="M22 158 v-8 M38 158 v-8 M54 158 v-8" fill="none" stroke-width="3" />
    </g>
  </g>
</template>
