<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import { useAudio } from '@/composables/useAudio'

type Task = 'colour' | 'trace' | 'feed' | 'seeds' | 'teeth'
const router = useRouter()
const { sayNumber, sayPraise, sayRetry, stopVoice } = useAudio()
const tasks: { id: Task; title: string; emoji: string; hint: string }[] = [
  { id: 'colour', title: 'Раскрась 8', emoji: '🎨', hint: 'Выбери цвет и нажми на восьмёрку.' },
  { id: 'trace', title: 'Напиши 8', emoji: '✍️', hint: 'Веди пальчиком по пунктирной дорожке.' },
  { id: 'feed', title: 'Накорми крокодила', emoji: '🍓', hint: 'Дай крокодилу восемь ягод — по одной!' },
  { id: 'seeds', title: 'Арбуз без косточек', emoji: '🍉', hint: 'Убери восемь косточек в мусорку.' },
  { id: 'teeth', title: 'Почисти зубки', emoji: '🪥', hint: 'Помоги птичке почистить восемь зубов крокодила.' },
]
const active = ref<Task>('colour')
const completed = ref<Task[]>([])
const palette = ['#fb7185', '#f97316', '#facc15', '#4ade80', '#38bdf8', '#a78bfa']
const chosenColour = ref(palette[0]!)
const coloured = ref(false)
const tracePoints = ref<{ x: number; y: number }[]>([])
const traceGuide = ref<SVGPathElement | null>(null)
const tracing = ref(false)
const traceDone = ref(false)
const eaten = ref<number[]>([])
const removedSeeds = ref<number[]>([])
const cleanedTeeth = ref<number[]>([])
const activeIndex = computed(() => tasks.findIndex((task) => task.id === active.value))
const allDone = computed(() => completed.value.length === tasks.length)

function markDone(id: Task) {
  if (!completed.value.includes(id)) completed.value = [...completed.value, id]
}
function chooseTask(id: Task) { active.value = id }
function colourDigit() {
  coloured.value = true
  markDone('colour')
  void sayPraise()
}
function startTrace(event: PointerEvent) {
  const svg = event.currentTarget as SVGSVGElement
  const rect = svg.getBoundingClientRect()
  tracing.value = true
  tracePoints.value = [{ x: ((event.clientX - rect.left) / rect.width) * 320, y: ((event.clientY - rect.top) / rect.height) * 380 }]
  svg.setPointerCapture(event.pointerId)
}
function moveTrace(event: PointerEvent) {
  if (!tracing.value) return
  const svg = event.currentTarget as SVGSVGElement
  const rect = svg.getBoundingClientRect()
  const point = { x: ((event.clientX - rect.left) / rect.width) * 320, y: ((event.clientY - rect.top) / rect.height) * 380 }
  const last = tracePoints.value[tracePoints.value.length - 1]
  if (!last || Math.hypot(point.x - last.x, point.y - last.y) > 3) tracePoints.value.push(point)
}
async function finishTrace() {
  if (!tracing.value) return
  tracing.value = false
  const guide = traceGuide.value
  let coveredSamples = 0
  if (guide && tracePoints.value.length >= 12) {
    const length = guide.getTotalLength()
    const sampleCount = 64
    for (let i = 0; i < sampleCount; i++) {
      const target = guide.getPointAtLength((i / (sampleCount - 1)) * length)
      const nearTrace = tracePoints.value.some((point) => Math.hypot(point.x - target.x, point.y - target.y) <= 38)
      if (nearTrace) coveredSamples++
    }
  }
  if (tracePoints.value.length >= 12 && coveredSamples >= 18) {
    traceDone.value = true
    markDone('trace')
    await sayPraise()
  } else await sayRetry()
}
async function feedBerry(i: number) {
  if (eaten.value.includes(i)) return
  eaten.value = [...eaten.value, i]
  await sayNumber(eaten.value.length)
  if (eaten.value.length === 8) { markDone('feed'); await sayPraise() }
}
async function cleanTooth(i: number) {
  if (cleanedTeeth.value.includes(i)) return
  cleanedTeeth.value = [...cleanedTeeth.value, i]
  await sayNumber(cleanedTeeth.value.length)
  if (cleanedTeeth.value.length === 8) { markDone('teeth'); await sayPraise() }
}
async function removeSeed(i: number) {
  if (removedSeeds.value.includes(i)) return
  removedSeeds.value = [...removedSeeds.value, i]
  await sayNumber(removedSeeds.value.length)
  if (removedSeeds.value.length === 8) { markDone('seeds'); await sayPraise() }
}
function resetCurrent() {
  completed.value = completed.value.filter((id) => id !== active.value)
  if (active.value === 'colour') coloured.value = false
  if (active.value === 'trace') { tracePoints.value = []; tracing.value = false; traceDone.value = false }
  if (active.value === 'feed') eaten.value = []
  if (active.value === 'seeds') removedSeeds.value = []
  if (active.value === 'teeth') cleanedTeeth.value = []
}
function back() { router.push({ name: 'learn-level', params: { level: 8 } }) }
onBeforeUnmount(stopVoice)
</script>

<template>
  <main class="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-4 px-4 pb-8 pt-4 sm:gap-6 sm:px-8">
    <header class="flex items-center justify-between gap-3">
      <button type="button" class="btn-round !h-14 !w-14 !text-2xl sm:!h-20 sm:!w-20" aria-label="Назад к восьмёрке" @click="back"><Icon name="back" /></button>
      <div class="text-center">
        <h1 class="text-3xl font-black text-white drop-shadow-[0_4px_0_rgba(2,132,199,0.55)] sm:text-5xl">Приключения восьмёрки</h1>
        <p class="mt-1 text-lg font-black text-sky-900 sm:text-xl">Помоги крокодилу! 🐊</p>
      </div>
      <div class="flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-xl shadow sm:px-5 sm:text-2xl"><Icon name="star" /> {{ completed.length }}/5</div>
    </header>

    <nav class="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3" aria-label="Задания">
      <button v-for="task in tasks" :key="task.id" type="button"
        class="relative flex min-h-20 items-center gap-2 rounded-2xl border-4 px-3 py-2 text-left shadow-md transition-transform active:scale-95 sm:min-h-24 sm:flex-col sm:justify-center sm:text-center"
        :class="active === task.id ? 'border-white bg-amber-300 text-slate-900 ring-4 ring-amber-100/70' : 'border-white/60 bg-white/80 text-slate-700'"
        @click="chooseTask(task.id)">
        <span class="text-3xl sm:text-4xl">{{ task.emoji }}</span><span class="text-sm font-black leading-tight sm:text-base">{{ task.title }}</span>
        <span v-if="completed.includes(task.id)" class="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-lg text-white shadow">✓</span>
      </button>
    </nav>

    <section class="flex flex-1 flex-col items-center justify-center gap-4 rounded-[2rem] border-4 border-white/80 bg-white/35 p-4 shadow-xl sm:gap-5 sm:p-6">
      <h2 class="text-center text-2xl font-black text-sky-950 sm:text-3xl">{{ tasks[activeIndex]?.title }}</h2>
      <p class="text-center text-lg font-bold text-sky-950 sm:text-xl">{{ tasks[activeIndex]?.hint }}</p>

      <template v-if="active === 'colour'">
        <div class="flex flex-wrap justify-center gap-3" aria-label="Выбери цвет">
          <button v-for="colour in palette" :key="colour" type="button"
            class="h-11 w-11 rounded-full border-4 shadow-md transition-transform active:scale-90 sm:h-14 sm:w-14"
            :style="{ backgroundColor: colour, borderColor: chosenColour === colour ? '#ffffff' : 'rgba(15,23,42,.15)' }"
            :aria-label="'Выбрать цвет ' + colour" :aria-pressed="chosenColour === colour" @click="chosenColour = colour" />
        </div>
        <button type="button" class="rounded-3xl bg-white/80 p-2 shadow-lg transition-transform active:scale-95" aria-label="Раскрасить цифру 8" @click="colourDigit">
          <svg viewBox="0 0 240 270" class="h-56 w-56 sm:h-72 sm:w-72" role="img" aria-label="Большая цифра восемь">
            <text x="120" y="225" text-anchor="middle" font-size="245" font-weight="900" font-family="system-ui, sans-serif" :fill="coloured ? chosenColour : '#ffffff'" stroke="#334155" stroke-width="5" paint-order="stroke">8</text>
          </svg>
        </button>
        <p class="rounded-full bg-white px-5 py-2 text-lg font-black text-slate-700 shadow">{{ coloured ? 'Красота! Восьмёрка раскрашена!' : 'Нажми на цифру, чтобы раскрасить её' }}</p>
      </template>

      <template v-else-if="active === 'trace'">
        <div class="w-full max-w-xs rounded-3xl bg-white/90 p-2 shadow-lg sm:max-w-sm">
          <svg viewBox="0 0 320 380" class="w-full touch-none" role="img" aria-label="Обведи цифру восемь пальцем"
            @pointerdown="startTrace" @pointermove="moveTrace" @pointerup="finishTrace" @pointercancel="finishTrace">
            <path d="M160 180 C65 180 65 65 160 65 C255 65 255 180 160 180 C65 180 65 315 160 315 C255 315 255 180 160 180" fill="none" stroke="#bae6fd" stroke-width="66" stroke-linecap="round" stroke-linejoin="round" />
            <path ref="traceGuide" d="M160 180 C65 180 65 65 160 65 C255 65 255 180 160 180 C65 180 65 315 160 315 C255 315 255 180 160 180" fill="none" stroke="#0284c7" stroke-width="5" stroke-dasharray="5 13" stroke-linecap="round" />
            <polyline v-if="tracePoints.length > 1" :points="tracePoints.map((p) => p.x + ',' + p.y).join(' ')" fill="none" stroke="#f97316" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="rounded-full bg-white px-5 py-2 text-lg font-black text-slate-700 shadow">{{ traceDone ? 'У тебя получилось написать 8! ✨' : 'Веди по пунктиру. Не получилось? Попробуй ещё раз!' }}</p>
      </template>

      <template v-else-if="active === 'feed'">
        <div class="flex items-center justify-center gap-3 text-6xl sm:gap-5 sm:text-7xl"><span class="animate-bounce">🐊</span><span class="text-4xl">😋</span></div>
        <p class="rounded-full bg-white px-5 py-2 text-xl font-black text-slate-700 shadow">Съедено: {{ eaten.length }} из 8</p>
        <div class="grid grid-cols-4 gap-3 sm:gap-5">
          <button v-for="i in 8" :key="i" type="button"
            class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow-md transition-all active:scale-75 sm:h-20 sm:w-20 sm:text-5xl"
            :class="eaten.includes(i) ? 'scale-75 opacity-25' : 'animate-pop'"
            :aria-label="eaten.includes(i) ? 'Ягодка съедена' : 'Отдать крокодилу ягодку'" :disabled="eaten.includes(i)" @click="feedBerry(i)">🍓</button>
        </div>
        <p v-if="eaten.length === 8" class="rounded-full bg-green-500 px-5 py-2 text-xl font-black text-white shadow">Ура! Восемь ягодок — животик доволен!</p>
      </template>

      <template v-else>
        <div class="flex items-center justify-center gap-4 text-6xl sm:text-7xl"><span>🐊</span><span>🍉</span><span>🗑️</span></div>
        <p class="rounded-full bg-white px-5 py-2 text-xl font-black text-slate-700 shadow">Косточек в мусорке: {{ removedSeeds.length }} из 8</p>
        <div class="grid grid-cols-4 gap-3 sm:gap-5">
          <button v-for="i in 8" :key="i" type="button"
            class="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-300 text-3xl shadow-md transition-all active:scale-75 sm:h-20 sm:w-20 sm:text-4xl"
            :class="removedSeeds.includes(i) ? 'scale-50 opacity-20' : 'animate-pop'"
            :aria-label="removedSeeds.includes(i) ? 'Косточка убрана' : 'Убрать косточку'" :disabled="removedSeeds.includes(i)" @click="removeSeed(i)">{{ removedSeeds.includes(i) ? '✓' : '🌱' }}</button>
        </div>
        <p v-if="removedSeeds.length === 8" class="rounded-full bg-green-500 px-5 py-2 text-xl font-black text-white shadow">Арбуз без косточек! Ты всё посчитал!</p>
      </template>

      <template v-else-if="active === 'teeth'">
        <div class="flex items-center justify-center gap-4 text-6xl sm:text-7xl"><span>🐊</span><span>🐦</span><span>🪥</span></div>
        <p class="rounded-full bg-white px-5 py-2 text-xl font-black text-slate-700 shadow">Зубов почищено: {{ cleanedTeeth.length }} из 8</p>
        <div class="grid grid-cols-4 gap-3 sm:gap-5">
          <button v-for="i in 8" :key="i" type="button"
            class="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-md transition-all active:scale-75 sm:h-20 sm:w-20 sm:text-5xl"
            :class="cleanedTeeth.includes(i) ? 'bg-green-200 opacity-70' : 'bg-white animate-pop'"
            :aria-label="cleanedTeeth.includes(i) ? 'Зуб почищен' : 'Почистить зуб ' + i"
            :disabled="cleanedTeeth.includes(i)" @click="cleanTooth(i)">{{ cleanedTeeth.includes(i) ? '✨' : '🦷' }}</button>
        </div>
        <p v-if="cleanedTeeth.length === 8" class="rounded-full bg-green-500 px-5 py-2 text-xl font-black text-white shadow">Все восемь зубов сияют! 🦷</p>
      </template>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <button type="button" class="btn-kid !rounded-2xl !px-5 !py-3 !text-lg sm:!text-xl" style="background:#0ea5e9;box-shadow:0 6px 0 #0369a1" @click="resetCurrent"><Icon name="again" /> Ещё раз</button>
        <button v-if="activeIndex < tasks.length - 1" type="button" class="btn-kid !rounded-2xl !px-5 !py-3 !text-lg sm:!text-xl" style="background:#22c55e;box-shadow:0 6px 0 #15803d" @click="chooseTask(tasks[activeIndex + 1]!.id)">Дальше <Icon name="right" /></button>
        <button v-else type="button" class="btn-kid !rounded-2xl !px-5 !py-3 !text-lg sm:!text-xl" style="background:#22c55e;box-shadow:0 6px 0 #15803d" @click="back"><Icon name="home" /> Готово</button>
      </div>
    </section>
    <p v-if="allDone" class="animate-pop rounded-2xl bg-yellow-300 px-4 py-3 text-center text-2xl font-black text-yellow-950 shadow-lg">🏆 Все четыре задания пройдены! Крокодил тобой гордится!</p>
  </main>
</template>
