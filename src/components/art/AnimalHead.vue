<script setup lang="ts">
import type { AnimalKind } from '@/types/art'

/**
 * Голова зверя, нарисованная в SVG. Холст 100×100, рисунок занимает его целиком,
 * поэтому компонент можно ставить куда угодно через <g transform="...">.
 * Контур у всех один и тот же (тёмно-коричневый), чтобы звери выглядели одной «семьёй».
 */
defineProps<{ kind: AnimalKind }>()

/** Фаза анимации своя у каждой головы, чтобы звери не моргали и не дышали хором. */
const phase = `${-(Math.random() * 4).toFixed(2)}s`
</script>

<template>
  <g class="animal" :style="{ '--phase': phase }" stroke="#4a2f22" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
    <!-- Медведь -->
    <template v-if="kind === 'bear'">
      <circle cx="24" cy="27" r="15" fill="#a56a40" />
      <circle cx="24" cy="27" r="7.5" fill="#e8b98c" stroke="none" />
      <circle cx="76" cy="27" r="15" fill="#a56a40" />
      <circle cx="76" cy="27" r="7.5" fill="#e8b98c" stroke="none" />
      <circle cx="50" cy="56" r="38" fill="#b97b4b" />
      <ellipse cx="50" cy="68" rx="17" ry="13" fill="#f2d5b0" stroke="none" />
      <ellipse cx="50" cy="61" rx="7.5" ry="5.2" fill="#3b2418" stroke="none" />
      <path d="M50 66 V71 M42 74 Q50 80 58 74" fill="none" stroke-width="2.6" />
      <ellipse cx="27" cy="64" rx="6" ry="4" fill="#ff8aa5" stroke="none" opacity=".55" />
      <ellipse cx="73" cy="64" rx="6" ry="4" fill="#ff8aa5" stroke="none" opacity=".55" />
      <circle class="eye" cx="36" cy="48" r="5.2" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="64" cy="48" r="5.2" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="37.6" cy="46.3" r="1.8" fill="#fff" stroke="none" />
      <circle class="eye" cx="65.6" cy="46.3" r="1.8" fill="#fff" stroke="none" />
    </template>

    <!-- Зайчик -->
    <template v-else-if="kind === 'bunny'">
      <ellipse cx="33" cy="25" rx="11" ry="25" transform="rotate(-9 33 25)" fill="#f4f4f8" />
      <ellipse cx="33" cy="27" rx="5.5" ry="17" transform="rotate(-9 33 27)" fill="#ffb3c7" stroke="none" />
      <ellipse cx="67" cy="25" rx="11" ry="25" transform="rotate(9 67 25)" fill="#f4f4f8" />
      <ellipse cx="67" cy="27" rx="5.5" ry="17" transform="rotate(9 67 27)" fill="#ffb3c7" stroke="none" />
      <ellipse cx="50" cy="63" rx="36" ry="31" fill="#f8f8fc" />
      <ellipse cx="26" cy="69" rx="6" ry="4" fill="#ff8aa5" stroke="none" opacity=".55" />
      <ellipse cx="74" cy="69" rx="6" ry="4" fill="#ff8aa5" stroke="none" opacity=".55" />
      <circle class="eye" cx="35" cy="58" r="5.2" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="65" cy="58" r="5.2" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="36.6" cy="56.3" r="1.8" fill="#fff" stroke="none" />
      <circle class="eye" cx="66.6" cy="56.3" r="1.8" fill="#fff" stroke="none" />
      <path d="M44 76 Q50 80 56 76 V86 H44 Z" fill="#fff" stroke-width="2.6" />
      <path d="M50 76 V86" stroke-width="2" />
      <ellipse cx="50" cy="68" rx="5.5" ry="3.8" fill="#ff7a9c" stroke-width="2.4" />
      <path d="M30 70 L14 66 M30 74 L14 76 M70 70 L86 66 M70 74 L86 76" fill="none" stroke-width="2" opacity=".6" />
    </template>

    <!-- Котёнок -->
    <template v-else-if="kind === 'cat'">
      <polygon points="15,42 19,8 46,26" fill="#f4a04a" />
      <polygon points="22,35 23,18 37,27" fill="#ffb8c6" stroke="none" />
      <polygon points="85,42 81,8 54,26" fill="#f4a04a" />
      <polygon points="78,35 77,18 63,27" fill="#ffb8c6" stroke="none" />
      <ellipse cx="50" cy="60" rx="38" ry="33" fill="#f7a94f" />
      <path d="M50 29 V40 M38 31 L41 40 M62 31 L59 40" fill="none" stroke="#c9741a" stroke-width="3.2" />
      <ellipse cx="50" cy="71" rx="15" ry="10.5" fill="#fff1dd" stroke="none" />
      <ellipse cx="26" cy="66" rx="6" ry="4" fill="#ff8aa5" stroke="none" opacity=".5" />
      <ellipse cx="74" cy="66" rx="6" ry="4" fill="#ff8aa5" stroke="none" opacity=".5" />
      <circle class="eye" cx="35" cy="55" r="5.6" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="65" cy="55" r="5.6" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="36.8" cy="53.2" r="1.9" fill="#fff" stroke="none" />
      <circle class="eye" cx="66.8" cy="53.2" r="1.9" fill="#fff" stroke="none" />
      <polygon points="45.5,64 54.5,64 50,69.5" fill="#ff7a9c" stroke-width="2.4" />
      <path d="M50 69.5 V73 Q45 78 40 75 M50 73 Q55 78 60 75" fill="none" stroke-width="2.4" />
      <path d="M30 70 L12 66 M30 74 L12 78 M70 70 L88 66 M70 74 L88 78" fill="none" stroke-width="2" opacity=".6" />
    </template>

    <!-- Щенок -->
    <template v-else-if="kind === 'dog'">
      <path d="M20 28 Q0 38 7 72 Q23 76 29 50 Z" fill="#8d5a2c" />
      <path d="M80 28 Q100 38 93 72 Q77 76 71 50 Z" fill="#8d5a2c" />
      <ellipse cx="50" cy="57" rx="34" ry="34" fill="#e3ad68" />
      <ellipse cx="67" cy="49" rx="11" ry="12.5" fill="#8d5a2c" stroke="none" />
      <ellipse cx="50" cy="71" rx="19" ry="14" fill="#f8e6c8" stroke="none" />
      <circle class="eye" cx="35" cy="49" r="5.4" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="66" cy="49" r="5.4" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="36.7" cy="47.3" r="1.9" fill="#fff" stroke="none" />
      <circle class="eye" cx="67.7" cy="47.3" r="1.9" fill="#fff" stroke="none" />
      <path d="M45 78 Q50 94 55 78 Z" fill="#ff7a9c" stroke-width="2.6" />
      <path d="M50 68 V75 M39 77 Q50 86 61 77" fill="none" stroke-width="2.6" />
      <ellipse cx="50" cy="63" rx="8.5" ry="5.8" fill="#2b1a12" stroke="none" />
      <ellipse cx="47" cy="61.5" rx="2.4" ry="1.4" fill="#fff" stroke="none" opacity=".7" />
    </template>

    <!-- Панда -->
    <template v-else-if="kind === 'panda'">
      <circle cx="22" cy="25" r="14.5" fill="#2e2e36" />
      <circle cx="78" cy="25" r="14.5" fill="#2e2e36" />
      <ellipse cx="50" cy="58" rx="38" ry="35" fill="#fdfdfd" />
      <ellipse cx="34" cy="54" rx="10.5" ry="13.5" transform="rotate(-22 34 54)" fill="#2e2e36" stroke="none" />
      <ellipse cx="66" cy="54" rx="10.5" ry="13.5" transform="rotate(22 66 54)" fill="#2e2e36" stroke="none" />
      <circle class="eye" cx="35" cy="53" r="4.6" fill="#fff" stroke="none" />
      <circle class="eye" cx="65" cy="53" r="4.6" fill="#fff" stroke="none" />
      <circle cx="35.6" cy="53.6" r="2.7" fill="#111" stroke="none" />
      <circle cx="65.6" cy="53.6" r="2.7" fill="#111" stroke="none" />
      <ellipse cx="50" cy="66" rx="6.5" ry="4.4" fill="#2e2e36" stroke="none" />
      <path d="M50 70 Q50 77 43 76 M50 70 Q50 77 57 76" fill="none" stroke-width="2.6" />
      <ellipse cx="25" cy="70" rx="5.5" ry="3.8" fill="#ff8aa5" stroke="none" opacity=".5" />
      <ellipse cx="75" cy="70" rx="5.5" ry="3.8" fill="#ff8aa5" stroke="none" opacity=".5" />
    </template>

    <!-- Лягушонок -->
    <template v-else-if="kind === 'frog'">
      <ellipse cx="50" cy="63" rx="41" ry="30" fill="#8bd152" />
      <circle cx="29" cy="32" r="16" fill="#8bd152" />
      <circle cx="71" cy="32" r="16" fill="#8bd152" />
      <circle cx="29" cy="32" r="10.5" fill="#fff" stroke="none" />
      <circle cx="71" cy="32" r="10.5" fill="#fff" stroke="none" />
      <circle cx="31" cy="33.5" r="5.4" fill="#1d2b12" stroke="none" />
      <circle cx="69" cy="33.5" r="5.4" fill="#1d2b12" stroke="none" />
      <circle class="eye" cx="32.8" cy="31.5" r="1.9" fill="#fff" stroke="none" />
      <circle class="eye" cx="70.8" cy="31.5" r="1.9" fill="#fff" stroke="none" />
      <path d="M20 64 Q50 95 80 64" fill="none" stroke-width="3.2" />
      <circle cx="44" cy="55" r="2" fill="#2d4a17" stroke="none" />
      <circle cx="56" cy="55" r="2" fill="#2d4a17" stroke="none" />
      <ellipse cx="24" cy="71" rx="6" ry="4" fill="#ff8aa5" stroke="none" opacity=".55" />
      <ellipse cx="76" cy="71" rx="6" ry="4" fill="#ff8aa5" stroke="none" opacity=".55" />
    </template>

    <!-- Обезьянка -->
    <template v-else-if="kind === 'monkey'">
      <circle cx="13" cy="55" r="13" fill="#a46f48" />
      <circle cx="13" cy="55" r="6.5" fill="#f3d6b0" stroke="none" />
      <circle cx="87" cy="55" r="13" fill="#a46f48" />
      <circle cx="87" cy="55" r="6.5" fill="#f3d6b0" stroke="none" />
      <ellipse cx="50" cy="52" rx="36" ry="35" fill="#a46f48" />
      <circle cx="39" cy="55" r="16" fill="#f5dab6" stroke="none" />
      <circle cx="61" cy="55" r="16" fill="#f5dab6" stroke="none" />
      <ellipse cx="50" cy="70" rx="22" ry="15" fill="#f5dab6" stroke="none" />
      <circle class="eye" cx="38" cy="52" r="5.2" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="62" cy="52" r="5.2" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="39.6" cy="50.3" r="1.8" fill="#fff" stroke="none" />
      <circle class="eye" cx="63.6" cy="50.3" r="1.8" fill="#fff" stroke="none" />
      <circle cx="46" cy="64" r="1.9" fill="#4a2f22" stroke="none" />
      <circle cx="54" cy="64" r="1.9" fill="#4a2f22" stroke="none" />
      <path d="M37 73 Q50 85 63 73" fill="none" stroke-width="2.8" />
    </template>

    <!-- Поросёнок -->
    <template v-else-if="kind === 'pig'">
      <polygon points="17,38 13,9 41,24" fill="#f48fa7" />
      <polygon points="83,38 87,9 59,24" fill="#f48fa7" />
      <ellipse cx="50" cy="58" rx="38" ry="34" fill="#f9a8bb" />
      <ellipse cx="50" cy="68" rx="17" ry="12.5" fill="#f48fa7" />
      <ellipse cx="44" cy="68" rx="2.6" ry="4.2" fill="#9b2c4a" stroke="none" />
      <ellipse cx="56" cy="68" rx="2.6" ry="4.2" fill="#9b2c4a" stroke="none" />
      <circle class="eye" cx="33" cy="48" r="5.2" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="67" cy="48" r="5.2" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="34.6" cy="46.3" r="1.8" fill="#fff" stroke="none" />
      <circle class="eye" cx="68.6" cy="46.3" r="1.8" fill="#fff" stroke="none" />
      <ellipse cx="21" cy="64" rx="6" ry="4" fill="#ff6d8f" stroke="none" opacity=".5" />
      <ellipse cx="79" cy="64" rx="6" ry="4" fill="#ff6d8f" stroke="none" opacity=".5" />
    </template>

    <!-- Тигрёнок -->
    <template v-else-if="kind === 'tiger'">
      <circle cx="22" cy="27" r="13.5" fill="#f9a11b" />
      <circle cx="22" cy="27" r="6.5" fill="#fff3d6" stroke="none" />
      <circle cx="78" cy="27" r="13.5" fill="#f9a11b" />
      <circle cx="78" cy="27" r="6.5" fill="#fff3d6" stroke="none" />
      <ellipse cx="50" cy="57" rx="38" ry="34" fill="#fba91f" />
      <path d="M50 24 V38 M36 28 L40 38 M64 28 L60 38 M13 55 L26 58 M14 66 L27 64 M87 55 L74 58 M86 66 L73 64" fill="none" stroke="#3b2410" stroke-width="4.2" />
      <ellipse cx="50" cy="69" rx="18" ry="13" fill="#fff3d6" stroke="none" />
      <circle class="eye" cx="35" cy="50" r="5.4" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="65" cy="50" r="5.4" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="36.7" cy="48.3" r="1.9" fill="#fff" stroke="none" />
      <circle class="eye" cx="66.7" cy="48.3" r="1.9" fill="#fff" stroke="none" />
      <polygon points="44,60 56,60 50,67" fill="#ff7a9c" stroke-width="2.4" />
      <path d="M50 67 V72 Q44 78 38 74 M50 72 Q56 78 62 74" fill="none" stroke-width="2.6" />
    </template>

    <!-- Цыплёнок -->
    <template v-else>
      <path d="M41 21 Q35 5 45 10 Q50 -1 55 10 Q65 5 59 21 Z" fill="#ffd83d" />
      <circle cx="50" cy="57" r="38" fill="#ffd83d" />
      <ellipse cx="25" cy="66" rx="6" ry="4" fill="#ff8a5c" stroke="none" opacity=".5" />
      <ellipse cx="75" cy="66" rx="6" ry="4" fill="#ff8a5c" stroke="none" opacity=".5" />
      <circle class="eye" cx="35" cy="49" r="5.6" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="65" cy="49" r="5.6" fill="#2b1a12" stroke="none" />
      <circle class="eye" cx="36.8" cy="47.2" r="1.9" fill="#fff" stroke="none" />
      <circle class="eye" cx="66.8" cy="47.2" r="1.9" fill="#fff" stroke="none" />
      <polygon points="41,59 59,59 50,72" fill="#ff8a1f" stroke-width="2.6" />
      <path d="M43 62 H57" stroke="#c75e00" stroke-width="2" fill="none" />
    </template>
  </g>
</template>

<style scoped>
.animal {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: animal-breathe 3.4s ease-in-out var(--phase) infinite;
}
@keyframes animal-breathe {
  50% { transform: scale(1.015, 1.03); }
}
.eye {
  transform-box: fill-box;
  transform-origin: center;
  animation: animal-blink 4.4s var(--phase) infinite;
}
@keyframes animal-blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95.5% { transform: scaleY(0.08); }
}
@media (prefers-reduced-motion: reduce) {
  .animal, .eye { animation: none; }
}
</style>
