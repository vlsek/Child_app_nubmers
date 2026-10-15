<script setup lang="ts">
/** Галерея рисунков для разработки: открывается по адресу /art, только в режиме dev. */
import Crocodile from '@/components/art/Crocodile.vue'
import AnimalHead from '@/components/art/AnimalHead.vue'
import VehicleArt from '@/components/art/VehicleArt.vue'
import type { AnimalKind, VehicleKind } from '@/types/art'

const animals: AnimalKind[] = ['bear', 'bunny', 'cat', 'dog', 'panda', 'frog', 'monkey', 'pig', 'tiger', 'chick']

const vehicles: { kind: VehicleKind; color: string; shade: string }[] = [
  { kind: 'hatch', color: '#f43f5e', shade: '#9f1239' },
  { kind: 'convertible', color: '#f97316', shade: '#9a3412' },
  { kind: 'taxi', color: '#facc15', shade: '#854d0e' },
  { kind: 'jeep', color: '#22c55e', shade: '#166534' },
  { kind: 'police', color: '#3b82f6', shade: '#1e3a8a' },
  { kind: 'ambulance', color: '#0ea5e9', shade: '#075985' },
  { kind: 'firetruck', color: '#dc2626', shade: '#7f1d1d' },
  { kind: 'tractor', color: '#a855f7', shade: '#581c87' },
  { kind: 'pickup', color: '#ec4899', shade: '#9d174d' },
  { kind: 'bus', color: '#14b8a6', shade: '#115e59' },
]
</script>

<template>
  <main class="mx-auto max-w-5xl p-6">
    <div class="mb-6 grid grid-cols-4 gap-3">
      <Crocodile class="w-full rounded-2xl bg-white/70" />
      <Crocodile class="w-full rounded-2xl bg-white/70" :mouth="1" />
      <Crocodile class="w-full rounded-2xl bg-white/70" mood="happy" :mouth="0.35" />
      <Crocodile class="w-full rounded-2xl bg-white/70" mood="sleep" />
    </div>
    <div class="mb-6 grid grid-cols-5 gap-3 sm:grid-cols-10">
      <svg v-for="a in animals" :key="a" viewBox="0 0 100 100" class="h-auto w-full rounded-2xl bg-white/70">
        <AnimalHead :kind="a" />
      </svg>
    </div>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <VehicleArt
        v-for="(v, i) in vehicles"
        :key="v.kind"
        :kind="v.kind"
        :color="v.color"
        :shade="v.shade"
        :animal="animals[i]!"
        :count="i + 1"
        :digit="i + 1"
        class="w-full"
      />
    </div>
  </main>
</template>
