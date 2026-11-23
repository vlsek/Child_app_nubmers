<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

/**
 * Главный герой игры — крокодил (голова и плечи, смотрит вправо). Холст 220×160.
 *
 * `mood`:  idle — спокойный, happy — радуется, sleep — спит (с «Z»).
 * `mouth`: насколько открыта пасть, 0…1 (0 — закрыта). Анимируйте этим числом:
 * для «хватает шарик» или «лопает пончик» меняйте его из 0 в 1 и обратно.
 * `look`:  куда смотрят зрачки, -1 (назад) … 1 (вперёд).
 * Новое: mood surprised (удивлён, пасть «о»), sad (грустит, слезинка), laugh (хохочет, трясётся);
 * `walk` — лёгкая походка (покачивается, лапка шагает);
 * `outfit` — аксессуары: 'party' (колпак), 'glasses', 'bow' (бабочка), 'backpack'.
 *
 * Компонент — корневой <svg>: ставьте как есть или вкладывайте в другой <svg>
 * через x / y / width / height.
 */
export type CrocMood = 'idle' | 'happy' | 'sleep' | 'surprised' | 'sad' | 'laugh'
export type CrocOutfit = 'party' | 'glasses' | 'bow' | 'backpack'
const props = withDefaults(
  defineProps<{ mood?: CrocMood; mouth?: number; look?: number; walk?: boolean; outfit?: CrocOutfit[] }>(),
  { mood: 'idle', mouth: 0, look: 0.4, walk: false, outfit: () => [] },
)
const has = (o: CrocOutfit) => props.outfit.includes(o)

const H = { x: 72, y: 92 } // шарнир челюстей
const MOOD_MOUTH: Partial<Record<CrocMood, number>> = { surprised: 0.3, laugh: 0.5 }
const target = computed(() => Math.min(1, Math.max(MOOD_MOUTH[props.mood] ?? 0, props.mouth)))

/** Пасть открывается плавно: показываемое значение догоняет заданное (лёгкий «пружинный» ход). */
const open = ref(target.value)
let raf = 0
let vel = 0
function step(): void {
  const diff = target.value - open.value
  vel = vel * 0.62 + diff * 0.3
  open.value += vel
  if (Math.abs(diff) < 0.004 && Math.abs(vel) < 0.004) {
    open.value = target.value
    raf = 0
    return
  }
  raf = requestAnimationFrame(step)
}
watch(target, () => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) open.value = target.value
  else if (!raf) raf = requestAnimationFrame(step)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))

/** Чтобы несколько крокодилов на экране не моргали в такт. */
const blinkDelay = `${-(Math.random() * 4).toFixed(2)}s`
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
  // Только глубина пасти: у кончиков морды красного нет, там виден фон
  const u = rot({ x: 166, y: 90 }, -upA.value)
  const l = rot({ x: 166, y: 96 }, lowA.value)
  const t = rot({ x: 140, y: 96 }, lowA.value * 0.9)
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
  <svg viewBox="0 0 220 160" aria-hidden="true" stroke-linejoin="round" stroke-linecap="round" :class="{ 'croc-happy': mood === 'happy', 'croc-laugh': mood === 'laugh', 'croc-walk': walk }">
    <g stroke="#1f5a2a" stroke-width="4">
      <!-- Хвост виляет -->
      <g class="tail">
        <path d="M2 128 Q14 96 40 108 L50 140 Q20 150 2 128Z" fill="#4cae45" />
        <path d="M10 122 Q18 108 32 112" fill="none" stroke="#3f9f3b" stroke-width="3" />
      </g>
      <!-- Тело дышит -->
      <g class="body">
        <ellipse cx="62" cy="122" rx="52" ry="36" fill="#5bbf4a" />
        <ellipse cx="72" cy="132" rx="30" ry="20" fill="#d4f29b" stroke="none" />
        <path d="M54 126 h36 M56 134 h32 M60 142 h26" stroke="#b6dc78" stroke-width="2.5" fill="none" />
        <g fill="#3f9f3b" stroke="none" opacity=".65"><circle cx="30" cy="112" r="4.5" /><circle cx="44" cy="102" r="3.5" /><circle cx="22" cy="126" r="3.5" /></g>
        <!-- Спинные зубцы -->
        <path d="M30 92 l8 -16 l9 14 l9 -16 l9 14" fill="#3f9f3b" stroke-width="3" />
        <!-- Лапка -->
        <g class="paw">
          <ellipse cx="96" cy="150" rx="16" ry="9" fill="#4cae45" />
          <path d="M89 152 v5 M96 153 v5 M103 152 v5" stroke="#1f5a2a" stroke-width="2.5" />
        </g>
        <!-- Бабочка -->
        <g v-if="has('bow')" transform="translate(68 129)">
          <path d="M0 0 L-17 -10 V10Z M0 0 L17 -10 V10Z" fill="#ec4899" stroke="#9d174d" stroke-width="3" />
          <circle r="5" fill="#f9a8d4" stroke="#9d174d" stroke-width="3" />
        </g>
        <!-- Рюкзак на спине -->
        <g v-if="has('backpack')">
          <rect x="16" y="102" width="30" height="38" rx="10" fill="#f97316" />
          <rect x="21" y="118" width="20" height="14" rx="4" fill="#fdba74" stroke-width="3" />
          <path d="M20 110 h22" stroke="#c2410c" stroke-width="3" fill="none" />
          <path d="M46 108 Q60 112 62 128" stroke="#c2410c" stroke-width="4" fill="none" />
        </g>
      </g>

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
        <path d="M96 52 Q140 50 184 62" fill="none" stroke="#fff" stroke-width="4" opacity=".28" />
        <ellipse cx="204" cy="68" rx="9" ry="6" fill="#4cae45" stroke="none" opacity=".6" />
        <path d="M58 94 Q54 50 90 44 L186 58 Q214 62 211 82 Q209 94 196 94 H62Z" fill="#5bbf4a" />
        <g fill="#fff" stroke-width="2.5">
          <path v-for="x in toothUp" :key="x" :d="`M${x - 6 + 12} 94 L${x + 12} 105 L${x + 6 + 12} 94Z`" transform="translate(-6 0)" />
        </g>
        <!-- Ноздря и щека -->
        <ellipse cx="198" cy="70" rx="4.5" ry="3.2" fill="#1f5a2a" stroke="none" />
        <ellipse cx="136" cy="82" rx="9" ry="5" fill="#ff8aa5" opacity=".55" stroke="none" />
        <!-- Глаз на «бугорке» -->
        <circle cx="92" cy="46" r="17" fill="#5bbf4a" />
        <g v-if="mood === 'idle' || mood === 'sad'" class="blink" :style="{ animationDelay: blinkDelay }">
          <circle cx="92" cy="46" r="11.5" fill="#fff" stroke-width="2.5" />
          <circle :cx="pupil.cx" :cy="mood === 'sad' ? 50 : pupil.cy" r="5.5" fill="#1b2a1f" stroke="none" />
          <circle :cx="pupil.cx + 1.8" :cy="(mood === 'sad' ? 50 : pupil.cy) - 2" r="1.8" fill="#fff" stroke="none" />
        </g>
        <template v-if="mood === 'sad'">
          <path d="M78 36 L104 28" fill="none" stroke-width="4.5" />
          <path d="M100 58 Q104 66 100 72 Q96 66 100 58Z" fill="#7dd3fc" stroke="#0369a1" stroke-width="2" class="tear" />
        </template>
        <template v-else-if="mood === 'surprised'">
          <circle cx="92" cy="46" r="13.5" fill="#fff" stroke-width="2.5" />
          <circle :cx="94 + look * 2" cy="46" r="3.4" fill="#1b2a1f" stroke="none" />
          <path d="M78 26 Q92 16 106 26" fill="none" stroke-width="4" />
        </template>
        <template v-else-if="mood === 'happy' || mood === 'laugh'">
          <path d="M82 49 Q92 36 102 49" fill="none" stroke-width="4.5" />
          <path d="M80 34 Q92 26 104 34" fill="none" stroke-width="3" />
        </template>
        <path v-else-if="mood === 'sleep'" d="M82 44 Q92 54 102 44" fill="none" stroke-width="4.5" />
        <!-- Очки -->
        <g v-if="has('glasses')" fill="none" stroke="#1e293b" stroke-width="3.5">
          <circle cx="92" cy="46" r="15" fill="#bae6fd" fill-opacity=".35" />
          <path d="M77 44 L58 52" />
        </g>
        <!-- Праздничный колпак -->
        <g v-if="has('party')" transform="translate(132 50) rotate(10)" stroke="#be185d" stroke-width="4">
          <polygon points="0,-46 -20,0 20,0" fill="#f472b6" />
          <path d="M-12 -22 L12 -22 M-17 -10 L17 -10" stroke="#fde047" stroke-width="5" fill="none" />
          <circle cy="-48" r="7" fill="#fde047" stroke="#ca8a04" stroke-width="3" />
        </g>
      </g>
    </g>
    <text v-if="mood === 'sleep'" x="150" y="38" font-size="26" font-weight="900" fill="#fff" stroke="#38bdf8" stroke-width="1.5" paint-order="stroke">Z z</text>
  </svg>
</template>

<style scoped>
.tail {
  transform-box: view-box;
  transform-origin: 44px 124px;
  animation: wag 2.4s ease-in-out infinite;
}
@keyframes wag {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(7deg); }
}
.croc-happy .tail {
  animation-duration: 0.6s;
}
.body {
  transform-box: view-box;
  transform-origin: 62px 156px;
  animation: breathe 3.2s ease-in-out infinite;
}
@keyframes breathe {
  50% { transform: scale(1.02, 1.035); }
}
.blink {
  transform-box: fill-box;
  transform-origin: center;
  animation: blink 4s infinite;
}
@keyframes blink {
  0%, 93%, 100% { transform: scaleY(1); }
  96% { transform: scaleY(0.08); }
}
.croc-happy {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: croc-hop 0.7s ease-in-out infinite;
}
@keyframes croc-hop {
  50% { transform: translateY(-4px) rotate(-1.5deg); }
}
.croc-laugh {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: croc-laugh 0.32s ease-in-out infinite;
}
.croc-laugh .tail { animation-duration: 0.5s; }
@keyframes croc-laugh {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-3px) rotate(1.2deg); }
}
.croc-walk {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: croc-walk 0.8s ease-in-out infinite;
}
.croc-walk .tail { animation-duration: 0.8s; }
.croc-walk .paw {
  transform-box: fill-box;
  transform-origin: 50% 0;
  animation: croc-step 0.8s ease-in-out infinite;
}
@keyframes croc-walk {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  25%, 75% { transform: translateY(-3px) rotate(0); }
  50% { transform: translateY(0) rotate(1deg); }
}
@keyframes croc-step {
  0%, 100% { transform: translateX(-4px) rotate(8deg); }
  50% { transform: translateX(4px) rotate(-8deg); }
}
.tear {
  animation: tear 2.4s ease-in infinite;
}
@keyframes tear {
  0% { transform: translateY(-2px); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(26px); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .tail, .body, .blink, .croc-happy, .croc-laugh, .croc-walk, .paw, .tear { animation: none; }
}
</style>
