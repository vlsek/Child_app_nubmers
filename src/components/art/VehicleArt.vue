<script setup lang="ts">
import { computed, useId } from 'vue'
import type { AnimalKind, VehicleKind } from '@/types/art'
import Passengers, { type Rect } from './Passengers.vue'

/**
 * Десять разных машин для уровней: у каждой своя форма и свой «характер».
 * Холст 400×300, колёса стоят на линии y = 262. Звери сидят в окнах / кузове и
 * считаются: сколько зверей, такая и цифра на двери.
 */
const props = defineProps<{
  kind: VehicleKind
  /** Основной цвет кузова. */
  color: string
  /** Тёмный оттенок: контуры и цифра. */
  shade: string
  animal: AnimalKind
  count: number
  digit: number | string
}>()

const uid = useId()
const glassColor = '#d4ecfb'

interface Config {
  /** Стёкла, которые рисуются за зверями. */
  glass: Rect[]
  /** Где сидят звери. */
  pass: Rect[]
  /** Сколько зверей в ряду (если не так, как обычно). */
  cols?: number
  /** Обрезать зверей по окну (иначе они могут выглядывать за границы). */
  clip: boolean
  wheels: { cx: number; cy: number; r: number }[]
  arches: boolean
  badge: { x: number; y: number; r: number }
  shadow: { cx: number; rx: number }
}

const CONFIG: Record<VehicleKind, Config> = {
  hatch: {
    glass: [{ x: 126, y: 84, w: 148, h: 68 }],
    pass: [{ x: 132, y: 86, w: 136, h: 64 }],
    clip: true,
    wheels: [
      { cx: 120, cy: 232, r: 30 },
      { cx: 282, cy: 232, r: 30 },
    ],
    arches: true,
    badge: { x: 200, y: 196, r: 26 },
    shadow: { cx: 200, rx: 168 },
  },
  convertible: {
    glass: [],
    pass: [{ x: 108, y: 82, w: 132, h: 86 }],
    clip: false,
    wheels: [
      { cx: 112, cy: 232, r: 31 },
      { cx: 292, cy: 232, r: 31 },
    ],
    arches: true,
    badge: { x: 176, y: 204, r: 24 },
    shadow: { cx: 204, rx: 170 },
  },
  taxi: {
    glass: [{ x: 136, y: 96, w: 134, h: 60 }],
    pass: [{ x: 140, y: 98, w: 126, h: 56 }],
    clip: true,
    wheels: [
      { cx: 118, cy: 232, r: 30 },
      { cx: 286, cy: 232, r: 30 },
    ],
    arches: true,
    badge: { x: 202, y: 208, r: 22 },
    shadow: { cx: 200, rx: 170 },
  },
  jeep: {
    glass: [{ x: 132, y: 40, w: 136, h: 96 }],
    pass: [{ x: 136, y: 42, w: 128, h: 92 }],
    clip: true,
    wheels: [
      { cx: 118, cy: 226, r: 36 },
      { cx: 290, cy: 226, r: 36 },
    ],
    arches: true,
    badge: { x: 204, y: 190, r: 26 },
    shadow: { cx: 200, rx: 176 },
  },
  police: {
    glass: [{ x: 130, y: 88, w: 140, h: 68 }],
    pass: [{ x: 134, y: 90, w: 132, h: 64 }],
    clip: true,
    wheels: [
      { cx: 118, cy: 232, r: 30 },
      { cx: 286, cy: 232, r: 30 },
    ],
    arches: true,
    badge: { x: 202, y: 208, r: 21 },
    shadow: { cx: 200, rx: 170 },
  },
  ambulance: {
    glass: [{ x: 60, y: 108, w: 196, h: 80 }],
    pass: [{ x: 64, y: 110, w: 188, h: 76 }],
    clip: true,
    wheels: [
      { cx: 112, cy: 232, r: 30 },
      { cx: 292, cy: 232, r: 30 },
    ],
    arches: true,
    badge: { x: 202, y: 206, r: 21 },
    shadow: { cx: 200, rx: 170 },
  },
  firetruck: {
    glass: [{ x: 56, y: 110, w: 184, h: 70 }],
    pass: [{ x: 60, y: 112, w: 176, h: 66 }],
    clip: true,
    wheels: [
      { cx: 100, cy: 232, r: 30 },
      { cx: 304, cy: 232, r: 30 },
    ],
    arches: true,
    badge: { x: 182, y: 210, r: 20 },
    shadow: { cx: 200, rx: 172 },
  },
  tractor: {
    glass: [],
    pass: [{ x: 38, y: 34, w: 160, h: 100 }],
    clip: false,
    wheels: [
      { cx: 74, cy: 232, r: 30 },
      { cx: 160, cy: 232, r: 30 },
      { cx: 268, cy: 220, r: 42 },
      { cx: 334, cy: 236, r: 26 },
    ],
    arches: false,
    badge: { x: 118, y: 162, r: 22 },
    shadow: { cx: 200, rx: 176 },
  },
  pickup: {
    glass: [],
    pass: [{ x: 62, y: 34, w: 152, h: 132 }],
    cols: 3,
    clip: false,
    wheels: [
      { cx: 100, cy: 230, r: 32 },
      { cx: 302, cy: 230, r: 32 },
    ],
    arches: true,
    badge: { x: 176, y: 204, r: 21 },
    shadow: { cx: 204, rx: 174 },
  },
  bus: {
    glass: [
      { x: 44, y: 64, w: 312, h: 62 },
      { x: 44, y: 140, w: 312, h: 56 },
    ],
    pass: [
      { x: 48, y: 66, w: 304, h: 58 },
      { x: 48, y: 142, w: 304, h: 52 },
    ],
    clip: true,
    wheels: [
      { cx: 100, cy: 232, r: 30 },
      { cx: 300, cy: 232, r: 30 },
    ],
    arches: true,
    badge: { x: 200, y: 214, r: 18 },
    shadow: { cx: 200, rx: 180 },
  },
}

const cfg = computed(() => CONFIG[props.kind])

/** Очень светлый оттенок цвета кузова (для «внутренности» кузова пикапа). */
const tint = computed(() => {
  const n = parseInt(props.color.replace('#', ''), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * 0.82)
  return `rgb(${mix((n >> 16) & 255)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`
})

/** Блик на стекле: косая светлая полоса. */
function shine(r: Rect): string {
  const { x, y, w, h } = r
  return `${x + 0.16 * w},${y} ${x + 0.3 * w},${y} ${x + 0.2 * w},${y + h} ${x + 0.06 * w},${y + h}`
}
</script>

<template>
  <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <defs>
      <clipPath :id="`${uid}-win`">
        <rect
          v-for="(g, i) in cfg.glass"
          :key="i"
          :x="g.x"
          :y="g.y"
          :width="g.w"
          :height="g.h"
          rx="14"
        />
      </clipPath>
      <pattern :id="`${uid}-chk`" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill="#1f2937" />
        <rect x="12" y="12" width="12" height="12" fill="#1f2937" />
      </pattern>
    </defs>

    <ellipse :cx="cfg.shadow.cx" cy="266" :rx="cfg.shadow.rx" ry="9" fill="#000" opacity=".2" />

    <g :stroke="shade" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <!-- ===== Задний план: кузов, на который «садятся» звери ===== -->

      <!-- 1. Малолитражка -->
      <template v-if="kind === 'hatch'">
        <rect x="48" y="152" width="304" height="80" rx="34" :fill="color" />
        <path d="M102 156 C106 92 146 66 200 66 C254 66 294 92 298 156 Z" :fill="color" />
      </template>

      <!-- 2. Кабриолет -->
      <template v-else-if="kind === 'convertible'">
        <rect x="92" y="116" width="150" height="64" rx="22" :fill="shade" stroke="none" />
      </template>

      <!-- 3. Такси -->
      <template v-else-if="kind === 'taxi'">
        <rect x="44" y="162" width="312" height="70" rx="26" :fill="color" />
        <path d="M98 166 L130 94 Q136 82 150 82 L256 82 Q270 82 276 94 L310 166 Z" :fill="color" />
      </template>

      <!-- 4. Джип -->
      <template v-else-if="kind === 'jeep'">
        <circle cx="38" cy="172" r="25" fill="#2b3340" stroke="#111827" />
        <circle cx="38" cy="172" r="11" fill="#94a3b8" stroke="#111827" stroke-width="3" />
        <rect x="122" y="12" width="156" height="8" rx="4" fill="#64748b" stroke="#334155" stroke-width="3" />
        <rect x="138" y="18" width="8" height="12" fill="#64748b" stroke="none" />
        <rect x="254" y="18" width="8" height="12" fill="#64748b" stroke="none" />
        <rect x="118" y="26" width="164" height="126" rx="18" :fill="color" />
        <rect x="44" y="130" width="312" height="102" rx="20" :fill="color" />
      </template>

      <!-- 5. Полиция -->
      <template v-else-if="kind === 'police'">
        <rect x="44" y="162" width="312" height="70" rx="26" :fill="color" />
        <path d="M98 166 L126 84 Q132 72 146 72 L264 72 Q278 72 284 84 L312 166 Z" :fill="color" />
      </template>

      <!-- 6. Скорая -->
      <template v-else-if="kind === 'ambulance'">
        <path
          d="M40 232 V122 Q40 98 64 98 H298 Q314 98 324 112 L352 150 Q360 162 360 178 V232 Z"
          fill="#f8fafc"
        />
        <rect x="42" y="196" width="316" height="13" :fill="color" stroke="none" />
      </template>

      <!-- 7. Пожарная -->
      <template v-else-if="kind === 'firetruck'">
        <rect x="48" y="56" width="206" height="8" rx="4" fill="#e2e8f0" stroke="#64748b" stroke-width="3" />
        <rect x="48" y="74" width="206" height="8" rx="4" fill="#e2e8f0" stroke="#64748b" stroke-width="3" />
        <path d="M64 64 V74 M88 64 V74 M112 64 V74 M136 64 V74 M160 64 V74 M184 64 V74 M208 64 V74 M232 64 V74" stroke="#94a3b8" stroke-width="3.5" fill="none" />
        <rect x="70" y="80" width="9" height="18" fill="#94a3b8" stroke="none" />
        <rect x="222" y="80" width="9" height="18" fill="#94a3b8" stroke="none" />
        <rect x="40" y="96" width="216" height="136" rx="16" :fill="color" />
        <path d="M252 232 V130 Q252 116 266 116 H316 Q328 116 334 126 L354 160 Q360 170 360 182 V232 Z" :fill="color" />
      </template>

      <!-- 8. Трактор с тележкой -->
      <template v-else-if="kind === 'tractor'">
        <rect x="204" y="176" width="34" height="9" rx="3" fill="#475569" stroke="#1f2937" stroke-width="3" />
        <rect x="326" y="96" width="10" height="46" rx="3" fill="#475569" stroke="#1f2937" stroke-width="3" />
        <rect x="321" y="90" width="20" height="9" rx="4" fill="#334155" stroke="#1f2937" stroke-width="3" />
        <rect x="228" y="62" width="82" height="12" rx="6" :fill="shade" />
        <rect x="238" y="72" width="8" height="70" fill="#64748b" stroke="none" />
        <rect x="292" y="72" width="8" height="70" fill="#64748b" stroke="none" />
        <rect x="244" y="78" width="50" height="62" rx="8" :fill="glassColor" stroke-width="4" />
        <rect x="236" y="138" width="110" height="66" rx="18" :fill="color" />
      </template>

      <!-- 9. Пикап -->
      <template v-else-if="kind === 'pickup'">
        <rect x="44" y="26" width="190" height="150" rx="14" :fill="tint" stroke-width="4.5" />
      </template>

      <!-- 10. Двухэтажный автобус -->
      <template v-else>
        <rect x="26" y="50" width="348" height="182" rx="26" :fill="color" />
        <rect x="46" y="44" width="308" height="10" rx="5" :fill="shade" stroke="none" />
      </template>

      <!-- ===== Стёкла ===== -->
      <rect
        v-for="(g, i) in cfg.glass"
        :key="`g${i}`"
        :x="g.x"
        :y="g.y"
        :width="g.w"
        :height="g.h"
        rx="14"
        :fill="glassColor"
        stroke-width="4"
      />

      <!-- ===== Пассажиры ===== -->
      <g :clip-path="cfg.clip ? `url(#${uid}-win)` : undefined" stroke="none">
        <Passengers :rects="cfg.pass" :count="count" :animal="animal" :cols="cfg.cols" />
        <polygon
          v-for="(g, i) in cfg.glass"
          :key="`s${i}`"
          :points="shine(g)"
          fill="#fff"
          opacity=".22"
        />
      </g>

      <!-- ===== Передний план: детали поверх зверей ===== -->

      <template v-if="kind === 'hatch'">
        <path d="M200 156 V228" fill="none" opacity=".35" stroke-width="3" />
        <ellipse cx="338" cy="184" rx="9" ry="12" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="62" cy="184" rx="7" ry="11" fill="#fca5a5" stroke-width="3.5" />
      </template>

      <template v-else-if="kind === 'convertible'">
        <path
          d="M44 232 V194 Q44 168 72 166 L232 166 L258 154 Q294 146 330 156 Q362 166 362 198 V232 Z"
          :fill="color"
        />
        <path d="M236 166 L254 114 L272 114 L262 160 Z" :fill="glassColor" stroke-width="4" opacity=".9" />
        <ellipse cx="350" cy="190" rx="9" ry="12" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="54" cy="192" rx="7" ry="11" fill="#fca5a5" stroke-width="3.5" />
        <path d="M70 178 Q150 170 224 178" fill="none" stroke="#fff" opacity=".3" stroke-width="5" />
      </template>

      <template v-else-if="kind === 'taxi'">
        <rect x="46" y="180" width="308" height="14" :fill="`url(#${uid}-chk)`" stroke="none" />
        <rect x="172" y="60" width="56" height="24" rx="7" fill="#fff" stroke-width="4" />
        <text x="200" y="73" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="900" :fill="shade" stroke="none" font-family="Nunito, 'Trebuchet MS', sans-serif">ТАКСИ</text>
        <ellipse cx="346" cy="190" rx="8" ry="11" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="54" cy="190" rx="7" ry="11" fill="#fca5a5" stroke-width="3.5" />
      </template>

      <template v-else-if="kind === 'jeep'">
        <path d="M204 150 V226" fill="none" opacity=".35" stroke-width="3" />
        <rect x="332" y="206" width="34" height="16" rx="7" fill="#94a3b8" stroke="#475569" stroke-width="3.5" />
        <ellipse cx="344" cy="166" rx="9" ry="11" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="344" cy="190" rx="7" ry="7" fill="#fde68a" stroke-width="3" />
        <ellipse cx="56" cy="196" rx="7" ry="10" fill="#fca5a5" stroke-width="3.5" />
      </template>

      <template v-else-if="kind === 'police'">
        <path d="M44 192 H356 V208 Q356 232 330 232 H70 Q44 232 44 208 Z" fill="#fff" />
        <path d="M168 72 V64 H232 V72 Z" fill="#64748b" stroke-width="3.5" />
        <path d="M172 64 Q172 49 186 49 Q200 49 200 64 Z" fill="#ef4444" stroke-width="3.5" />
        <path d="M200 64 Q200 49 214 49 Q228 49 228 64 Z" fill="#38bdf8" stroke-width="3.5" />
        <ellipse cx="346" cy="186" rx="8" ry="11" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="54" cy="186" rx="7" ry="11" fill="#fca5a5" stroke-width="3.5" />
      </template>

      <template v-else-if="kind === 'ambulance'">
        <path
          d="M40 232 V122 Q40 98 64 98 H298 Q314 98 324 112 L352 150 Q360 162 360 178 V232 Z"
          fill="none"
        />
        <path d="M274 112 H302 Q312 112 318 122 L336 150 H274 Z" :fill="glassColor" stroke-width="4" />
        <path d="M156 98 Q156 83 170 83 Q184 83 184 98 Z" fill="#ef4444" stroke-width="3.5" />
        <g fill="#ef4444" stroke="none">
          <rect x="296" y="166" width="20" height="8" rx="1" />
          <rect x="302" y="160" width="8" height="20" rx="1" />
        </g>
        <ellipse cx="352" cy="176" rx="7" ry="10" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="46" cy="170" rx="6" ry="10" fill="#fca5a5" stroke-width="3.5" />
      </template>

      <template v-else-if="kind === 'firetruck'">
        <path d="M274 130 H314 Q322 130 327 138 L340 160 H274 Z" :fill="glassColor" stroke-width="4" />
        <rect x="42" y="190" width="212" height="8" fill="#e2e8f0" stroke="none" />
        <rect x="278" y="106" width="40" height="10" rx="4" fill="#ef4444" stroke-width="3.5" />
        <ellipse cx="353" cy="176" rx="7" ry="10" fill="#fde68a" stroke-width="3.5" />
        <rect x="344" y="212" width="24" height="12" rx="5" fill="#94a3b8" stroke="#475569" stroke-width="3" />
      </template>

      <template v-else-if="kind === 'tractor'">
        <rect x="30" y="118" width="176" height="84" rx="10" fill="#d4965a" />
        <path d="M32 146 H204 M32 174 H204" fill="none" opacity=".35" stroke-width="3" />
        <ellipse cx="340" cy="166" rx="8" ry="11" fill="#fde68a" stroke-width="3.5" />
      </template>

      <template v-else-if="kind === 'pickup'">
        <path d="M60 30 V164 M112 30 V164 M164 30 V164 M216 30 V164" fill="none" :stroke="shade" stroke-width="3.5" opacity=".8" />
        <rect x="38" y="18" width="198" height="14" rx="7" :fill="color" stroke-width="4.5" />
        <path d="M40 168 H232 V232 H62 Q40 232 40 210 Z" :fill="color" />
        <rect x="36" y="162" width="200" height="12" rx="6" :fill="shade" stroke="none" />
        <path
          d="M236 232 V152 Q236 142 246 136 L268 98 Q274 90 286 90 H322 Q334 90 340 100 L360 150 Q364 160 364 174 V232 Z"
          :fill="color"
        />
        <path d="M270 108 H322 L342 146 H252 Z" :fill="glassColor" stroke-width="4" />
        <ellipse cx="356" cy="178" rx="8" ry="11" fill="#fde68a" stroke-width="3.5" />
        <rect x="350" y="208" width="22" height="14" rx="6" fill="#94a3b8" stroke="#475569" stroke-width="3" />
      </template>

      <template v-else>
        <rect x="46" y="128" width="308" height="8" :fill="shade" opacity=".55" stroke="none" />
        <rect x="46" y="198" width="308" height="4" :fill="shade" opacity=".4" stroke="none" />
        <ellipse cx="366" cy="214" rx="7" ry="10" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="34" cy="214" rx="6" ry="10" fill="#fca5a5" stroke-width="3.5" />
      </template>

      <!-- ===== Колёса ===== -->
      <template v-for="(w, i) in cfg.wheels" :key="`w${i}`">
        <path
          v-if="cfg.arches"
          :d="`M${w.cx - w.r - 8} ${w.cy} A${w.r + 8} ${w.r + 8} 0 0 1 ${w.cx + w.r + 8} ${w.cy} Z`"
          fill="#273141"
          stroke="none"
        />
        <circle :cx="w.cx" :cy="w.cy" :r="w.r" fill="#1f2937" stroke="#0f172a" stroke-width="4" />
        <circle :cx="w.cx" :cy="w.cy" :r="w.r * 0.52" fill="#cbd5e1" stroke="#64748b" stroke-width="3" />
        <circle :cx="w.cx" :cy="w.cy" :r="w.r * 0.17" fill="#64748b" stroke="none" />
      </template>

      <!-- ===== Цифра на двери ===== -->
      <g :transform="`translate(${cfg.badge.x} ${cfg.badge.y})`">
        <circle :r="cfg.badge.r" fill="#fff" stroke-width="4" />
        <text
          text-anchor="middle"
          dominant-baseline="central"
          :font-size="String(digit).length > 1 ? cfg.badge.r * 1.15 : cfg.badge.r * 1.45"
          font-weight="900"
          :fill="shade"
          stroke="none"
          font-family="Nunito, 'Trebuchet MS', sans-serif"
          y="1.5"
        >
          {{ digit }}
        </text>
      </g>
    </g>
  </svg>
</template>
