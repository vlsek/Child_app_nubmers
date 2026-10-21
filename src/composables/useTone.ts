import { SCALE, thump, tone as playTone } from './synth'

export { SCALE }

/** Короткий доступ к синтезу нот для заданий-инструментов (барабан, ксилофон). */
export function useTone() {
  return { tone: playTone, thump }
}
