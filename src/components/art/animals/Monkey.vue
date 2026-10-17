<script setup lang="ts">
/** Обезьянка: коричневая, светлая мордочка-«сердечко», круглые ушки, длинный закрученный хвост. Холст 220×160, смотрит вправо. */
</script>

<template>
  <g stroke="#4a2a14" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <!-- Длинный хвост с завитком -->
    <g class="fig-tail" style="transform-origin: 40px 128px">
      <path d="M44 132 Q6 140 8 104 Q10 74 32 76 Q44 80 38 92" fill="none" stroke-width="12" />
      <path d="M44 132 Q6 140 8 104 Q10 74 32 76 Q44 80 38 92" fill="none" stroke="#b97a45" stroke-width="5" />
    </g>
    <g class="fig-breathe">
      <ellipse cx="80" cy="120" rx="54" ry="38" fill="#b97a45" />
      <ellipse cx="96" cy="132" rx="30" ry="22" fill="#f7dcb4" stroke="none" />
      <path d="M40 104 Q50 92 70 94" fill="none" stroke="#fff" stroke-width="4" opacity=".35" />
      <!-- Лапки -->
      <ellipse cx="62" cy="150" rx="17" ry="8" fill="#a56a38" />
      <ellipse cx="124" cy="148" rx="18" ry="9" fill="#a56a38" />
      <ellipse cx="124" cy="148" rx="11" ry="5" fill="#f7dcb4" stroke="none" />
      <!-- Дальнее ухо -->
      <circle cx="176" cy="48" r="18" fill="#a56a38" />
      <circle cx="176" cy="48" r="9" fill="#f7dcb4" stroke="none" />
      <!-- Голова -->
      <ellipse cx="128" cy="76" rx="54" ry="46" fill="#b97a45" />
      <path d="M96 52 Q120 38 152 42" fill="none" stroke="#fff" stroke-width="4" opacity=".35" />
      <!-- Ближнее ухо -->
      <circle cx="80" cy="72" r="19" fill="#b97a45" />
      <circle cx="82" cy="72" r="10" fill="#f7dcb4" stroke="none" />
      <!-- Светлая мордочка -->
      <path d="M108 64 Q122 52 138 66 Q152 52 170 62 Q196 70 190 96 Q182 118 152 118 Q114 118 106 94 Q102 78 108 64Z" fill="#f7dcb4" />
      <!-- Глаза -->
      <g class="fig-blink">
        <ellipse cx="128" cy="72" rx="9.5" ry="11.5" fill="#fff" stroke-width="3" />
        <circle cx="131" cy="74" r="6" fill="#2a170a" stroke="none" />
        <circle cx="133.5" cy="70.5" r="2.2" fill="#fff" stroke="none" />
      </g>
      <g class="fig-blink">
        <ellipse cx="164" cy="72" rx="8.5" ry="11" fill="#fff" stroke-width="3" />
        <circle cx="167" cy="74" r="5.5" fill="#2a170a" stroke="none" />
        <circle cx="169" cy="70.5" r="2" fill="#fff" stroke="none" />
      </g>
      <ellipse cx="118" cy="96" rx="8" ry="5" fill="#ff8a8a" opacity=".6" stroke="none" />
      <ellipse cx="182" cy="92" rx="6" ry="4.5" fill="#ff8a8a" opacity=".6" stroke="none" />
      <ellipse cx="152" cy="88" rx="4" ry="2.8" fill="#4a2a14" stroke="none" />
      <path d="M132 98 Q150 112 174 98" fill="none" stroke-width="3.5" />
    </g>
  </g>
</template>
