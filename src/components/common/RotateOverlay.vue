<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Crocodile from '@/components/art/Crocodile.vue'

/**
 * Игры рассчитаны на горизонтальный экран. Если телефон держат вертикально, поверх игры показывается
 * крупная подсказка «поверни телефон» (на Android кнопка ещё и сама пробует развернуть экран).
 * «Играть так» прячет подсказку до конца сессии: вертикальная раскладка тоже работает, просто сцены мельче.
 * В APK экран закреплён горизонтально, подсказка там не появляется.
 */
const route = useRoute()
const portrait = ref(false)
const dismissed = ref(false)
let mq: MediaQueryList | null = null
const onChange = (): void => {
  portrait.value = !!mq?.matches
}

onMounted(() => {
  mq = window.matchMedia('(orientation: portrait) and (max-width: 700px)')
  onChange()
  mq.addEventListener('change', onChange)
})
onBeforeUnmount(() => mq?.removeEventListener('change', onChange))

const inGame = computed(() => route.name === 'learn-level' || route.name === 'find-level')
const show = computed(() => portrait.value && inGame.value && !dismissed.value)

async function rotate(): Promise<void> {
  try {
    await document.documentElement.requestFullscreen?.()
    await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape')
  } catch {
    /* не поддерживается: достаточно повернуть телефон руками */
  }
}
</script>

<template>
  <Transition name="page">
    <div v-if="show" class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-sky-300 to-sky-100 px-6 text-center">
      <Crocodile class="w-48" mood="happy" :mouth="0.3" :look="1" />
      <button type="button" class="btn-round !h-32 !w-32" aria-label="Повернуть экран" @click="rotate">
        <svg viewBox="0 0 48 48" class="h-24 w-24" aria-hidden="true">
          <g class="rotate-hint">
            <rect x="15" y="8" width="18" height="32" rx="4" fill="#38bdf8" stroke="#0369a1" stroke-width="3" />
            <rect x="19" y="13" width="10" height="20" rx="1.5" fill="#e0f2fe" />
          </g>
          <path d="M6 14 q-2 10 6 14 M12 28 l-1 -7 M12 28 l7 -1" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <p class="text-2xl font-black text-sky-900">Поверни телефон</p>
      <button type="button" class="rounded-full bg-white/70 px-6 py-3 text-lg font-bold text-sky-900 shadow" @click="dismissed = true">Играть так</button>
    </div>
  </Transition>
</template>
