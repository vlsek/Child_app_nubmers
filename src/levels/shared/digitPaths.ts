/**
 * Контуры цифр для «Напиши цифру» и «Раскрась цифру»: линии, которыми цифру пишут.
 * Холст: высота 140, ширина `width`. Каждая строка в `strokes` — отдельная линия
 * (порядок и направление — как пишут рукой).
 */
export interface DigitGlyph {
  width: number
  strokes: string[]
}

export const DIGIT_GLYPHS: Record<number, DigitGlyph> = {
  1: { width: 100, strokes: ['M30 44 L58 18 L58 124'] },
  2: { width: 100, strokes: ['M22 46 C22 8 80 8 78 44 C77 68 44 94 22 124 L82 124'] },
  3: { width: 100, strokes: ['M24 30 C34 8 76 10 76 38 C76 58 54 66 42 66 C62 66 82 76 82 96 C82 128 32 132 20 106'] },
  4: { width: 100, strokes: ['M62 16 L18 92 L86 92', 'M62 50 L62 126'] },
  5: { width: 100, strokes: ['M78 18 L32 18 L26 64 C60 50 84 70 82 94 C80 126 38 132 20 108'] },
  6: { width: 100, strokes: ['M72 18 C40 34 20 70 22 98 C24 128 78 128 78 98 C78 70 34 70 22 98'] },
  7: { width: 100, strokes: ['M20 20 L82 20 L44 126'] },
  8: { width: 100, strokes: ['M50 68 C20 62 22 14 50 14 C78 14 80 62 50 68 C16 74 18 128 50 128 C82 128 84 74 50 68'] },
  9: { width: 100, strokes: ['M78 46 C78 14 24 12 24 44 C24 74 78 76 78 46 C78 96 62 124 28 128'] },
  10: { width: 160, strokes: ['M20 44 L44 20 L44 124', 'M112 14 C72 14 72 126 112 126 C152 126 152 14 112 14'] },
}

/** Все цифры 1–10 есть; запасной вариант на случай, если число вне диапазона. */
export function glyphFor(value: number): DigitGlyph {
  return DIGIT_GLYPHS[value] ?? DIGIT_GLYPHS[1]!
}
