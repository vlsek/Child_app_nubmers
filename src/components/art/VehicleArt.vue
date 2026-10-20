<script setup lang="ts">
import { computed, useId } from 'vue'
import type { AnimalKind, VehicleKind } from '@/types/art'
import AnimalFigure from './AnimalFigure.vue'
import Passengers, { type Rect } from './Passengers.vue'

/**
 * Десять разных открытых машин для уровней: у каждой своя форма и свой «характер».
 * Холст 400×300, колёса стоят на линии y = 262. Звери сидят в кузове целиком
 * (голова, туловище, лапы на борту; низ закрывает борт) и считаются: сколько зверей,
 * такая и цифра на двери.
 * Порядок слоёв: задний план → звери → борт и детали переднего плана → колёса → цифра.
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
  /** Где сидят звери (нижний край — на борту). */
  pass: Rect[]
  /** Нижний этаж автобуса: звери в окнах, поверх борта. */
  pass2?: Rect[]
  /** Сколько зверей в ряду (если не так, как обычно). */
  cols?: number
  /** Обрезать зверей по областям (двухэтажный автобус: нижний этаж виден в окнах). */
  clip?: Rect[]
  wheels: { cx: number; cy: number; r: number }[]
  badge: { x: number; y: number; r: number }
  /** Водитель (входит в счёт зверей): `x` слева, `bottom` — низ рисунка, `size` — масштаб как у пассажиров. */
  driver?: { x: number; bottom: number; size: number }
  /** Руль (центр кольца). */
  wheel?: { x: number; y: number }
  /** Окно кабины (path): водитель виден в нём поверх борта, а не над ним. */
  cab?: string
  shadow: { cx: number; rx: number }
}

/** Общий кузов легковушек: салон слева, капот справа. */
const SEDAN = 'M44 232 V186 Q44 154 78 154 H236 L260 164 H326 Q358 168 358 200 V232 Z'

const CONFIG: Record<VehicleKind, Config> = {
  hatch: {
    pass: [{ x: 50, y: 34, w: 130, h: 128 }],
    driver: { x: 150, bottom: 164, size: 80 },
    wheel: { x: 248, y: 140 },
    wheels: [{ cx: 112, cy: 232, r: 30 }, { cx: 288, cy: 232, r: 30 }],
    badge: { x: 176, y: 200, r: 24 },
    shadow: { cx: 200, rx: 168 },
  },
  convertible: {
    pass: [{ x: 50, y: 34, w: 130, h: 128 }],
    driver: { x: 150, bottom: 164, size: 80 },
    wheel: { x: 248, y: 138 },
    wheels: [{ cx: 112, cy: 232, r: 30 }, { cx: 288, cy: 232, r: 30 }],
    badge: { x: 176, y: 202, r: 24 },
    shadow: { cx: 200, rx: 168 },
  },
  taxi: {
    pass: [{ x: 50, y: 34, w: 130, h: 128 }],
    driver: { x: 150, bottom: 164, size: 80 },
    wheel: { x: 248, y: 140 },
    wheels: [{ cx: 112, cy: 232, r: 30 }, { cx: 288, cy: 232, r: 30 }],
    badge: { x: 176, y: 208, r: 20 },
    shadow: { cx: 200, rx: 168 },
  },
  jeep: {
    pass: [{ x: 62, y: 36, w: 140, h: 116 }],
    cols: 2,
    driver: { x: 164, bottom: 152, size: 64 },
    wheel: { x: 250, y: 122 },
    wheels: [{ cx: 118, cy: 224, r: 36 }, { cx: 292, cy: 224, r: 36 }],
    badge: { x: 190, y: 190, r: 24 },
    shadow: { cx: 200, rx: 176 },
  },
  police: {
    pass: [{ x: 58, y: 66, w: 112, h: 96 }],
    driver: { x: 170, bottom: 166, size: 56 },
    wheel: { x: 250, y: 144 },
    wheels: [{ cx: 112, cy: 232, r: 30 }, { cx: 288, cy: 232, r: 30 }],
    badge: { x: 176, y: 208, r: 20 },
    shadow: { cx: 200, rx: 168 },
  },
  ambulance: {
    pass: [{ x: 52, y: 30, w: 196, h: 114 }],
    cab: 'M258 130 H298 Q306 130 312 138 L330 164 H258 Z',
    driver: { x: 260, bottom: 166, size: 40 },
    wheel: { x: 318, y: 150 },
    wheels: [{ cx: 112, cy: 232, r: 30 }, { cx: 292, cy: 232, r: 30 }],
    badge: { x: 176, y: 214, r: 18 },
    shadow: { cx: 200, rx: 172 },
  },
  firetruck: {
    pass: [{ x: 52, y: 30, w: 196, h: 114 }],
    cab: 'M258 132 H306 Q314 132 320 140 L336 164 H258 Z',
    driver: { x: 260, bottom: 166, size: 40 },
    wheel: { x: 322, y: 152 },
    wheels: [{ cx: 104, cy: 232, r: 30 }, { cx: 300, cy: 232, r: 30 }],
    badge: { x: 176, y: 212, r: 18 },
    shadow: { cx: 200, rx: 172 },
  },
  tractor: {
    pass: [{ x: 30, y: 34, w: 172, h: 104 }],
    driver: { x: 246, bottom: 152, size: 48 },
    wheel: { x: 306, y: 126 },
    wheels: [{ cx: 72, cy: 232, r: 30 }, { cx: 160, cy: 232, r: 30 }, { cx: 272, cy: 216, r: 44 }, { cx: 340, cy: 236, r: 26 }],
    badge: { x: 116, y: 176, r: 20 },
    shadow: { cx: 200, rx: 176 },
  },
  pickup: {
    pass: [{ x: 52, y: 24, w: 176, h: 138 }],
    cols: 3,
    cab: 'M270 108 H322 L342 146 H252 Z',
    driver: { x: 258, bottom: 148, size: 46 },
    wheel: { x: 324, y: 128 },
    wheels: [{ cx: 100, cy: 230, r: 32 }, { cx: 302, cy: 230, r: 32 }],
    badge: { x: 168, y: 206, r: 20 },
    shadow: { cx: 204, rx: 174 },
  },
  bus: {
    pass: [{ x: 40, y: 30, w: 320, h: 88 }],
    pass2: [{ x: 44, y: 138, w: 292, h: 66 }],
    wheel: { x: 348, y: 176 },
    clip: [{ x: 20, y: 0, w: 360, h: 128 }],
    wheels: [{ cx: 100, cy: 232, r: 30 }, { cx: 300, cy: 232, r: 30 }],
    badge: { x: 200, y: 216, r: 16 },
    shadow: { cx: 200, rx: 180 },
  },
}

const cfg = computed(() => CONFIG[props.kind])
/** Водитель входит в счёт: «пять» значит пять зверей вместе с ним. Автобус делит всех по этажам. */
const passengers = computed(() => (cfg.value.pass2 ? Math.ceil(props.count / 2) : cfg.value.driver ? Math.max(props.count - 1, 0) : props.count))
const driverH = computed(() => (cfg.value.driver ? cfg.value.driver.size * 1.25 * (138 / 196) : 0))

/** Очень светлый оттенок цвета кузова (внутренность кузова пикапа, борта автобуса). */
const tint = computed(() => {
  const n = parseInt(props.color.replace('#', ''), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * 0.82)
  return `rgb(${mix((n >> 16) & 255)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`
})
</script>

<template>
  <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <defs>
      <clipPath v-if="cfg.cab" :id="`${uid}-cab`"><path :d="cfg.cab" /></clipPath>
      <clipPath :id="`${uid}-low`"><rect x="40" y="136" width="320" height="68" rx="14" /></clipPath>
      <clipPath v-if="cfg.clip" :id="`${uid}-clip`">
        <rect v-for="(r, i) in cfg.clip" :key="i" :x="r.x" :y="r.y" :width="r.w" :height="r.h" :rx="i ? 12 : 0" />
      </clipPath>
      <pattern :id="`${uid}-chk`" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill="#1f2937" />
        <rect x="12" y="12" width="12" height="12" fill="#1f2937" />
      </pattern>
    </defs>

    <ellipse :cx="cfg.shadow.cx" cy="266" :rx="cfg.shadow.rx" ry="9" fill="#000" opacity=".2" />

    <g :stroke="shade" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <!-- ===== Задний план: то, что за спинами зверей ===== -->
      <template v-if="kind === 'police'">
        <rect x="54" y="116" width="190" height="48" rx="14" :fill="shade" stroke="none" opacity=".9" />
        <!-- стойки и крыша с мигалками -->
        <path d="M62 66 V156 M270 66 V160" fill="none" :stroke="shade" stroke-width="7" />
        <rect x="50" y="52" width="236" height="16" rx="8" :fill="color" />
        <path d="M144 52 V46 H204 V52 Z" fill="#64748b" stroke-width="3.5" />
        <path d="M148 46 Q148 30 163 30 Q178 30 178 46 Z" fill="#ef4444" stroke-width="3.5" />
        <path d="M178 46 Q178 30 193 30 Q208 30 208 46 Z" fill="#38bdf8" stroke-width="3.5" />
      </template>
      <template v-else-if="kind === 'hatch' || kind === 'taxi'">
        <!-- спинка сиденья -->
        <rect x="54" y="116" width="190" height="48" rx="14" :fill="shade" stroke="none" opacity=".9" />
      </template>
      <template v-else-if="kind === 'convertible'">
        <rect x="52" y="100" width="194" height="64" rx="20" :fill="shade" stroke="none" />
        <!-- сложенный тент сзади -->
        <path d="M44 150 Q40 108 72 104 L86 128 Z" fill="#475569" stroke="#1f2937" stroke-width="4" />
      </template>
      <template v-else-if="kind === 'jeep'">
        <circle cx="40" cy="172" r="26" fill="#2b3340" stroke="#111827" />
        <circle cx="40" cy="172" r="11" fill="#94a3b8" stroke="#111827" stroke-width="3" />
        <!-- каркас безопасности -->
        <path d="M66 140 V22 H246 V140" fill="none" stroke="#64748b" stroke-width="9" />
        <path d="M66 140 V22 H246 V140" fill="none" stroke="#e2e8f0" stroke-width="3.5" />
        <rect x="62" y="104" width="190" height="52" rx="10" :fill="shade" stroke="none" opacity=".9" />
      </template>
      <template v-else-if="kind === 'ambulance'">
        <rect x="42" y="86" width="210" height="58" rx="14" :fill="tint" stroke-width="4" />
      </template>
      <template v-else-if="kind === 'firetruck'">
      </template>
      <template v-else-if="kind === 'tractor'">
        <!-- борт тележки сзади -->
        <rect x="24" y="86" width="186" height="100" rx="10" :fill="tint" stroke-width="4" />
        <!-- кабина: стойки, крыша, стекло -->
        <rect x="244" y="86" width="64" height="62" rx="8" :fill="glassColor" stroke-width="4" />
        <rect x="236" y="74" width="80" height="12" rx="6" :fill="shade" />
        <rect x="324" y="96" width="10" height="46" rx="3" fill="#475569" stroke="#1f2937" stroke-width="3" />
        <rect x="319" y="90" width="20" height="9" rx="4" fill="#334155" stroke="#1f2937" stroke-width="3" />
      </template>
      <template v-else-if="kind === 'pickup'">
        <rect x="42" y="20" width="194" height="150" rx="14" :fill="tint" stroke-width="4.5" />
      </template>
      <template v-else>
        <!-- верхний этаж без крыши: задняя стенка -->
        <rect x="26" y="38" width="348" height="90" rx="14" :fill="tint" stroke-width="4.5" />
      </template>

      <!-- ===== Пассажиры ===== -->
      <g :clip-path="cfg.clip ? `url(#${uid}-clip)` : undefined" stroke="none">
        <Passengers
          v-if="passengers > 0"
          :rects="cfg.pass"
          :count="count"
          :n="passengers"
          :animal="animal"
          :cols="cfg.pass2 ? 5 : cfg.cols"
          :spread="!!cfg.pass2"
          :right="!!cfg.driver"
        />
        <!-- Водитель (открытые машины): сидит у руля, борт закроет его снизу -->
        <template v-if="cfg.driver && !cfg.cab && count > 0">
          <g :transform="`translate(${cfg.driver.x} ${cfg.driver.bottom - driverH})`">
            <AnimalFigure :kind="animal" x="0" y="0" :width="cfg.driver.size * 1.25" :height="driverH" seated />
          </g>
          <g :transform="`translate(${cfg.wheel!.x} ${cfg.wheel!.y})`">
            <path d="M-3 12 L-16 34" fill="none" stroke="#1f2937" stroke-width="5" />
            <ellipse rx="6" ry="14" fill="none" stroke="#334155" stroke-width="5.5" />
            <ellipse rx="1.8" ry="3" fill="#94a3b8" stroke="none" />
          </g>
        </template>
      </g>

      <!-- ===== Передний план: борт и детали поверх зверей ===== -->

      <!-- Малолитражка -->
      <template v-if="kind === 'hatch'">
        <path :d="SEDAN" :fill="color" />
        <path d="M240 154 L262 112 L276 112 L268 164 Z" :fill="glassColor" stroke-width="4" opacity=".9" />
        <path d="M58 168 Q150 160 224 168" fill="none" stroke="#fff" opacity=".3" stroke-width="5" />
        <path d="M144 158 V228" fill="none" opacity=".35" stroke-width="3" />
        <rect x="178" y="176" width="18" height="6" rx="3" fill="#fff" stroke-width="3" />
        <ellipse cx="344" cy="190" rx="9" ry="12" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="52" cy="196" rx="7" ry="11" fill="#fca5a5" stroke-width="3.5" />
      </template>

      <!-- Кабриолет -->
      <template v-else-if="kind === 'convertible'">
        <path :d="SEDAN" :fill="color" />
        <path d="M240 154 L266 106 L280 106 L270 164 Z" :fill="glassColor" stroke-width="4" opacity=".9" />
        <path d="M58 170 Q150 160 226 170" fill="none" stroke="#fff" opacity=".3" stroke-width="5" />
        <path d="M60 188 H232" fill="none" :stroke="shade" stroke-width="3" opacity=".5" />
        <ellipse cx="346" cy="190" rx="9" ry="12" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="52" cy="196" rx="7" ry="11" fill="#fca5a5" stroke-width="3.5" />
      </template>

      <!-- Такси -->
      <template v-else-if="kind === 'taxi'">
        <path :d="SEDAN" :fill="color" />
        <rect x="46" y="180" width="310" height="14" :fill="`url(#${uid}-chk)`" stroke="none" />
        <path d="M240 154 L262 112 L276 112 L268 164 Z" :fill="glassColor" stroke-width="4" opacity=".9" />
        <rect x="236" y="84" width="58" height="26" rx="7" fill="#fff" stroke-width="4" />
        <text x="265" y="98" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="900" :fill="shade" stroke="none" font-family="Nunito, 'Trebuchet MS', sans-serif">ТАКСИ</text>
        <ellipse cx="346" cy="190" rx="8" ry="11" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="52" cy="190" rx="7" ry="11" fill="#fca5a5" stroke-width="3.5" />
      </template>

      <!-- Джип -->
      <template v-else-if="kind === 'jeep'">
        <path d="M44 232 V158 Q44 142 62 142 H252 L264 128 H326 Q352 130 356 158 V232 Z" :fill="color" />
        <path d="M256 142 L268 112 L282 112 L276 142 Z" :fill="glassColor" stroke-width="4" opacity=".9" />
        <path d="M150 146 V228" fill="none" opacity=".35" stroke-width="3" />
        <rect x="334" y="204" width="34" height="16" rx="7" fill="#94a3b8" stroke="#475569" stroke-width="3.5" />
        <ellipse cx="344" cy="164" rx="9" ry="11" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="52" cy="190" rx="6" ry="10" fill="#fca5a5" stroke-width="3.5" />
      </template>

      <!-- Полиция -->
      <template v-else-if="kind === 'police'">
        <path :d="SEDAN" :fill="color" />
        <path d="M44 194 H358 V232 H44 Z" fill="#fff" stroke="none" />
        <!-- лобовое стекло до самой крыши -->
        <path d="M244 156 L266 66 L276 66 L268 164 Z" :fill="glassColor" stroke-width="4" opacity=".9" />
        <ellipse cx="346" cy="186" rx="8" ry="11" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="52" cy="186" rx="7" ry="11" fill="#fca5a5" stroke-width="3.5" />
      </template>

      <!-- Скорая -->
      <template v-else-if="kind === 'ambulance'">
        <path d="M40 232 V150 Q40 140 52 140 H250 V122 H300 Q316 122 326 136 L352 168 Q360 180 360 196 V232 Z" fill="#f8fafc" />
        <rect x="42" y="200" width="316" height="13" :fill="color" stroke="none" />
        <path d="M258 130 H298 Q306 130 312 138 L330 164 H258 Z" :fill="glassColor" stroke-width="4" />
        <path d="M270 122 Q270 107 284 107 Q298 107 298 122 Z" fill="#ef4444" stroke-width="3.5" />
        <g fill="#ef4444" stroke="none"><rect x="106" y="162" width="36" height="12" rx="2" /><rect x="118" y="150" width="12" height="36" rx="2" /></g>
        <ellipse cx="352" cy="180" rx="7" ry="10" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="46" cy="176" rx="6" ry="10" fill="#fca5a5" stroke-width="3.5" />
      </template>

      <!-- Пожарная -->
      <template v-else-if="kind === 'firetruck'">
        <path d="M40 232 V146 Q40 138 50 138 H250 V122 H310 Q324 122 332 134 L356 168 Q360 176 360 188 V232 Z" :fill="color" />
        <path d="M258 132 H306 Q314 132 320 140 L336 164 H258 Z" :fill="glassColor" stroke-width="4" />
        <!-- лестница на борту -->
        <path d="M60 156 H238 M60 176 H238" fill="none" stroke="#e2e8f0" stroke-width="6" />
        <path d="M80 156 V176 M108 156 V176 M136 156 V176 M164 156 V176 M192 156 V176 M220 156 V176" fill="none" stroke="#fecaca" stroke-width="4" />
        <rect x="44" y="196" width="206" height="8" fill="#e2e8f0" stroke="none" />
        <rect x="272" y="108" width="40" height="12" rx="4" fill="#ef4444" stroke-width="3.5" />
                <ellipse cx="354" cy="178" rx="7" ry="10" fill="#fde68a" stroke-width="3.5" />
        <rect x="346" y="212" width="24" height="12" rx="5" fill="#94a3b8" stroke="#475569" stroke-width="3" />
      </template>

      <!-- Трактор с тележкой -->
      <template v-else-if="kind === 'tractor'">
        <rect x="26" y="132" width="180" height="76" rx="10" fill="#d4965a" />
        <path d="M28 158 H204 M28 184 H204" fill="none" opacity=".35" stroke-width="3" />
        <rect x="204" y="176" width="36" height="9" rx="3" fill="#475569" stroke="#1f2937" stroke-width="3" />
        <rect x="238" y="148" width="116" height="62" rx="18" :fill="color" />
        <rect x="318" y="156" width="26" height="6" rx="3" fill="#fff" stroke="none" opacity=".6" />
        <ellipse cx="346" cy="178" rx="8" ry="11" fill="#fde68a" stroke-width="3.5" />
      </template>

      <!-- Пикап -->
      <template v-else-if="kind === 'pickup'">
        <path d="M40 168 H234 V232 H62 Q40 232 40 210 Z" :fill="color" />
        <rect x="36" y="160" width="202" height="12" rx="6" :fill="shade" stroke="none" />
        <path d="M236 232 V152 Q236 142 246 136 L268 98 Q274 90 286 90 H322 Q334 90 340 100 L360 150 Q364 160 364 174 V232 Z" :fill="color" />
        <path d="M270 108 H322 L342 146 H252 Z" :fill="glassColor" stroke-width="4" />
        <ellipse cx="356" cy="178" rx="8" ry="11" fill="#fde68a" stroke-width="3.5" />
        <rect x="350" y="208" width="22" height="14" rx="6" fill="#94a3b8" stroke="#475569" stroke-width="3" />
      </template>

      <!-- Двухэтажный автобус -->
      <template v-else>
        <!-- ограждение верхнего этажа -->
        <path d="M52 92 V126 M92 92 V126 M132 92 V126 M172 92 V126 M212 92 V126 M252 92 V126 M292 92 V126 M332 92 V126" fill="none" :stroke="shade" stroke-width="4" opacity=".7" />
        <rect x="22" y="118" width="356" height="116" rx="22" :fill="color" />
        <rect x="40" y="136" width="320" height="68" rx="14" :fill="glassColor" stroke-width="4" />
        <g :clip-path="`url(#${uid}-low)`" stroke="none">
          <Passengers v-if="Math.floor(count / 2) > 0" :rects="cfg.pass2!" :count="count" :n="Math.floor(count / 2)" :animal="animal" :cols="5" spread right />
        </g>
        <!-- водитель — крайний справа внизу -->
        <g v-if="count > 1" :transform="`translate(${cfg.wheel!.x} ${cfg.wheel!.y})`">
          <path d="M-3 12 L-10 28" fill="none" stroke="#1f2937" stroke-width="5" />
          <ellipse rx="5" ry="13" fill="none" stroke="#334155" stroke-width="5" />
        </g>
        <path d="M60 136 L96 136 L72 204 L40 204 Z" fill="#fff" opacity=".22" stroke="none" />
        <rect x="22" y="112" width="356" height="12" rx="6" :fill="shade" stroke="none" />
        <rect x="42" y="204" width="316" height="5" :fill="shade" opacity=".4" stroke="none" />
        <ellipse cx="372" cy="216" rx="7" ry="10" fill="#fde68a" stroke-width="3.5" />
        <ellipse cx="28" cy="216" rx="6" ry="10" fill="#fca5a5" stroke-width="3.5" />
      </template>

      <!-- Водитель в кабине (скорая, пожарная, пикап): виден в окне -->
      <template v-if="cfg.driver && cfg.cab && count > 0">
        <g :clip-path="`url(#${uid}-cab)`" stroke="none">
          <g :transform="`translate(${cfg.driver.x} ${cfg.driver.bottom - driverH})`">
            <AnimalFigure :kind="animal" x="0" y="0" :width="cfg.driver.size * 1.25" :height="driverH" seated />
          </g>
          <path :d="cfg.cab" fill="#fff" opacity=".18" />
        </g>
        <path :d="cfg.cab" fill="none" stroke-width="4" />
        <g :transform="`translate(${cfg.wheel!.x} ${cfg.wheel!.y})`">
          <path d="M-3 10 L-12 22" fill="none" stroke="#1f2937" stroke-width="4" />
          <ellipse rx="4.5" ry="11" fill="none" stroke="#334155" stroke-width="4.5" />
        </g>
      </template>

      <!-- ===== Колёса ===== -->
      <template v-for="(w, i) in cfg.wheels" :key="`w${i}`">
        <path
          v-if="kind !== 'tractor'"
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
