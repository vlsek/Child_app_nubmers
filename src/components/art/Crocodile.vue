<script setup lang="ts">
import { computed } from 'vue'

/**
 * Главный герой игры — крокодил (голова и плечи, смотрит вправо). Холст 220×160.
 *
 * `mood`:  idle — спокойный, happy — радуется, sleep — спит (с «Z»).
 * `mouth`: насколько открыта пасть, 0…1 (0 — закрыта). Анимируйте этим числом:
 * для «хватает шарик» или «лопает пончик» меняйте его из 0 в 1 и обратно.
 * `look`:  куда смотрят зрачки, -1 (назад) … 1 (вперёд).
 *
 * Компонент — корневой <svg>: ставьте как есть или вкладывайте в другой <svg>
 * через x / y / width / height.
 */
const props = withDefaults(
  defineProps<{ mood?: 'idle' | 'happy' | 'sleep'; mouth?: number; look?: number }>(),
  { mood: 'idle', mouth: 0, look: 0.4 },
)

const H = { x: 72, y: 92 } // шарнир челюстей
const open = computed(() => Math.min(1, Math.max(0, props.mouth)))
const upA = computed(() => open.value * 22)
const lowA = computed(() => open.value * 12)

function rot(p: { x: number; y: number }, deg: number) {
  const a = (deg * Math.PI) / 180
  const dx = p.x - H.x
  const dy = p.y - H.y
  return { x: H.x + dx * Math.cos(a) - dy * Math.sin(a), y: H.y + dx * Math.sin(a) + dy * Math.cos(a) }
}
/** Тёмная пасть между челюстями: треугольник шарнир — кончик верхней — кончик нижней. */
const inside = computed(() => {
  const u = rot({ x: 202, y: 90 }, -upA.value)
  const l = rot({ x: 202, y: 96 }, lowA.value)
  const t = rot({ x: 150, y: 96 }, lowA.value * 0.9)
  return `${H.x},${H.y - 2} ${u.x},${u.y} ${l.x},${l.y}  ${t.x},${t.y}`
})
const tongue = computed(() => {
  const t = rot({ x: 160, y: 96 }, lowA.value)
  return { cx: (t.x + 105) / 2, cy: (t.y + 96) / 2, rx: Math.abs(t.x - 105) / 2.4 }
})
const pupil = computed(() => ({ cx: 92 + props.look * 3, cy: 47 }))
const toothUp = [108, 132, 156, 180]
</script>

<template>
  <svg viewBox="0 0 220 160" aria-hidden="true" stroke-linejoin="round" stroke-linecap="round">
    <g stroke="#1f5a2a" stroke-width="4">
      <!-- Хвост и тело -->
      <path d="M2 128 Q14 96 40 108 L50 140 Q20 150 2 128Z" fill="#4cae45" />
      <ellipse cx="62" cy="122" rx="52" ry="36" fill="#5bbf4a" />
      <ellipse cx="72" cy="132" rx="30" ry="20" fill="#d4f29b" stroke="none" />
      <!-- Спинные зубцы -->
      <path d="M30 92 l8 -16 l9 14 l9 -16 l9 14" fill="#3f9f3b" stroke-width="3" />

      <!-- Пасть внутри (видна, когда открыта) -->
      <template v-if="open > 0.02">
        <polygon :points="inside" fill="#8a1c2b" />
        <ellipse :cx="tongue.cx" :cy="tongue.cy" :rx="tongue.rx" ry="7" fill="#f472b6" stroke="none" />
      </template>

      <!-- Нижняя челюсть -->
      <g :transform="`rotate(${lowA} ${H.x} ${H.y})`">
        <path d="M64 94 H198 Q212 94 209 106 Q205 118 190 118 H76 Q60 116 64 94Z" fill="#4cae45" />
        <path d="M80 116 H192" stroke="none" />
        <path d="M82 104 Q140 112 196 104" fill="none" stroke="#d4f29b" stroke-width="7" opacity=".7" />
        <g fill="#fff" stroke-width="2.5">
          <path v-for="x in toothUp" :key="x" :d="`M${x - 6} 94 L${x} 82 L${x + 6} 94Z`" />
        </g>
      </g>

      <!-- Верхняя челюсть и голова -->
      <g :transform="`rotate(${-upA} ${H.x} ${H.y})`">
        <path d="M58 94 Q54 50 90 44 L186 58 Q214 62 211 82 Q209 94 196 94 H62Z" fill="#5bbf4a" />
        <g fill="#fff" stroke-width="2.5">
          <path v-for="x in toothUp" :key="x" :d="`M${x - 6 + 12} 94 L${x + 12} 105 L${x + 6 + 12} 94Z`" transform="translate(-6 0)" />
        </g>
        <!-- Ноздря и щека -->
        <ellipse cx="198" cy="70" rx="4.5" ry="3.2" fill="#1f5a2a" stroke="none" />
        <ellipse cx="136" cy="82" rx="9" ry="5" fill="#ff8aa5" opacity=".55" stroke="none" />
        <!-- Глаз на «бугорке» -->
        <circle cx="92" cy="46" r="17" fill="#5bbf4a" />
        <template v-if="mood === 'idle'">
          <circle cx="92" cy="46" r="11.5" fill="#fff" stroke-width="2.5" />
          <circle :cx="pupil.cx" :cy="pupil.cy" r="5.5" fill="#1b2a1f" stroke="none" />
          <circle :cx="pupil.cx + 1.8" :cy="pupil.cy - 2" r="1.8" fill="#fff" stroke="none" />
        </template>
        <path v-else-if="mood === 'happy'" d="M82 49 Q92 36 102 49" fill="none" stroke-width="4.5" />
        <path v-else d="M82 44 Q92 54 102 44" fill="none" stroke-width="4.5" />
      </g>
    </g>
    <text v-if="mood === 'sleep'" x="150" y="38" font-size="26" font-weight="900" fill="#fff" stroke="#38bdf8" stroke-width="1.5" paint-order="stroke">Z z</text>
  </svg>
</template>
