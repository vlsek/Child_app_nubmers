<script setup lang="ts">
/** Тигрёнок: оранжевый в чёрную полоску, белая мордочка и пузико, пушистые щёки, полосатый хвост. Холст 220×160, смотрит вправо. */
</script>

<template>
  <g stroke="#6b3208" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <!-- Полосатый хвост -->
    <g class="fig-tail" style="transform-origin: 40px 128px">
      <path d="M44 134 Q10 144 10 108 Q10 86 24 84" fill="none" stroke-width="15" />
      <path d="M44 134 Q10 144 10 108 Q10 86 24 84" fill="none" stroke="#ffa63a" stroke-width="8" />
      <path d="M22 140 l5 -9 M10 128 l8 -3 M8 114 l9 0 M12 98 l8 4" stroke="#2b1708" stroke-width="3.5" fill="none" />
    </g>
    <g class="fig-breathe">
      <ellipse cx="80" cy="120" rx="54" ry="38" fill="#ffa63a" />
      <ellipse cx="96" cy="132" rx="30" ry="22" fill="#fff3dc" stroke="none" />
      <path d="M42 104 Q52 92 72 94" fill="none" stroke="#fff" stroke-width="4" opacity=".4" />
      <!-- Полоски на спине -->
      <g stroke="#2b1708" stroke-width="5" fill="none"><path d="M40 98 q6 10 4 22" /><path d="M56 90 q6 10 4 22" /><path d="M72 86 q5 8 3 16" /><path d="M32 128 q8 2 12 8" /></g>
      <!-- Лапки -->
      <ellipse cx="60" cy="150" rx="17" ry="8" fill="#ffa63a" />
      <ellipse cx="122" cy="148" rx="18" ry="9" fill="#fff3dc" />
      <path d="M114 152 v4 M122 153 v4 M130 152 v4" stroke-width="2.5" fill="none" />
      <!-- Дальнее ухо -->
      <circle cx="170" cy="40" r="17" fill="#ffa63a" />
      <circle cx="170" cy="42" r="8" fill="#2b1708" stroke="none" opacity=".35" />
      <!-- Голова с пушистыми щёчками -->
      <path d="M72 84 Q74 46 124 42 Q178 40 192 74 L204 84 L192 92 L200 108 L180 110 L170 122 Q150 112 140 120 Q124 112 110 120 L100 108 L82 106 L90 96 Z" fill="#ffa63a" />
      <path d="M96 56 Q124 40 158 46" fill="none" stroke="#fff" stroke-width="4" opacity=".4" />
      <!-- Ближнее ухо -->
      <circle cx="94" cy="50" r="18" fill="#ffa63a" />
      <circle cx="95" cy="52" r="9" fill="#ffd3a0" stroke="none" />
      <!-- Лобные полоски -->
      <g stroke="#2b1708" stroke-width="4.5" fill="none"><path d="M130 44 v12" /><path d="M118 46 q2 8 6 10" /><path d="M142 46 q-2 8 -6 10" /></g>
      <!-- Полоски на щеках -->
      <g stroke="#2b1708" stroke-width="3.5" fill="none"><path d="M84 88 l10 2" /><path d="M86 98 l10 -2" /><path d="M200 84 l-10 2" /><path d="M196 98 l-10 -2" /></g>
      <!-- Белая мордочка -->
      <ellipse cx="156" cy="98" rx="32" ry="20" fill="#fff3dc" />
      <!-- Глаза -->
      <g class="fig-blink">
        <ellipse cx="124" cy="72" rx="11" ry="13" fill="#fff" stroke-width="3" />
        <circle cx="127" cy="74" r="7" fill="#2a1a08" stroke="none" />
        <circle cx="129.5" cy="70" r="2.5" fill="#fff" stroke="none" />
      </g>
      <g class="fig-blink">
        <ellipse cx="166" cy="72" rx="9.5" ry="12" fill="#fff" stroke-width="3" />
        <circle cx="169" cy="74" r="6" fill="#2a1a08" stroke="none" />
        <circle cx="171" cy="70.5" r="2.2" fill="#fff" stroke="none" />
      </g>
      <ellipse cx="112" cy="94" rx="8" ry="5" fill="#ff7a6b" opacity=".55" stroke="none" />
      <!-- Нос и рот -->
      <path d="M150 88 h16 l-8 9Z" fill="#ff7a8c" stroke-width="3" />
      <path d="M158 97 v4 M158 101 Q148 112 140 104 M158 101 Q168 112 176 104" fill="none" stroke-width="3.5" />
    </g>
  </g>
</template>
