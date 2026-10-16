<script setup lang="ts">
import AnimalHead from '../AnimalHead.vue'

/** ЗАГЛУШКА: заменить полноценным рисунком (см. BACKLOG.md, «Звери в полный рост»). Холст 220×160, смотрит вправо. */
</script>

<template>
  <g>
    <ellipse cx="80" cy="124" rx="52" ry="34" fill="#f9a8bb" stroke="#4a2f22" stroke-width="4" />
    <g transform="translate(86 6) scale(1.1)"><AnimalHead kind="pig" /></g>
  </g>
</template>
