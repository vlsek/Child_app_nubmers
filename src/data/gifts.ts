import type { CrocOutfit } from '@/components/art/Crocodile.vue'

/**
 * Звёзды ведут к подаркам: каждые `STARS_PER_GIFT` звёзд крокодил получает новый наряд
 * и носит его на главном экране и в альбоме. Нарядов четыре, они надеваются по порядку.
 */
export const STARS_PER_GIFT = 8

export const GIFT_OUTFITS: readonly CrocOutfit[] = ['party', 'bow', 'glasses', 'backpack']
