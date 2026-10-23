import { onBeforeUnmount, ref, type Ref } from 'vue'

export interface Pt {
  x: number
  y: number
}

export interface DragOptions<T extends string | number> {
  /**
   * Предмет отпустили в точке `p` (координаты viewBox). Верните true, если принято
   * (предмет «прижился» и дальше им управляет задание); false: он вернётся на место.
   */
  onDrop: (id: T, p: Pt) => boolean | void
  /**
   * Помощь, если малыш никак не может перетащить. Предметы НАДО перетаскивать: одиночный тап лишь
   * подбрасывает предмет («тащи меня»), а после `tapAssist` тапов подряд (по умолчанию 3) вызывается onTap,
   * и предмет сам «долетает» до цели. Если не задан, тап считается броском в текущую точку (onDrop).
   */
  onTap?: (id: T) => void
  /** Сколько тапов подряд без перетаскивания нужно, чтобы сработала помощь onTap (по умолчанию 3). */
  tapAssist?: number
  /** Сколько единиц viewBox пальцу надо пройти, чтобы это стало перетаскиванием (по умолчанию 8). */
  threshold?: number
  /** Можно ли сейчас брать предмет (например, он уже принят). */
  canGrab?: (id: T) => boolean
}

/**
 * Перетаскивание для заданий-SVG. Использование:
 *
 *   const svg = ref<SVGSVGElement | null>(null)
 *   const drag = useDrag(svg, { onDrop(id, p) { return near(p, TARGET, 70) && accept(id) }, onTap: accept })
 *   <svg ref="svg"> ... <g :style="drag.style(i, home)" @pointerdown="drag.start($event, i, home)"> ...
 *
 * - `drag.pos(id, home)` — где рисовать предмет сейчас (под пальцем или дома);
 * - `drag.style(id, home)` — готовый style с transform и плавным возвратом;
 * - `drag.active.value?.id` — какой предмет сейчас несут (для «приподнятого» вида).
 * Предмет всегда рисуйте с центром в (0,0), `home` — его центр.
 */
export function useDrag<T extends string | number>(svg: Ref<SVGSVGElement | null>, opts: DragOptions<T>) {
  const active = ref<{ id: T; x: number; y: number } | null>(null)
  /** Предмет, который только что отпустили мимо цели: возвращается плавно. */
  const returning = ref<T | null>(null)
  /** Предмет, по которому просто тапнули: подпрыгивает («тащи меня»). */
  const nudge = ref<T | null>(null)
  let taps = 0
  let offset: Pt = { x: 0, y: 0 }
  let startPt: Pt = { x: 0, y: 0 }
  let moved = false
  let cleanup: (() => void) | null = null

  function toSvg(e: PointerEvent): Pt {
    const el = svg.value
    const ctm = el?.getScreenCTM()
    if (!el || !ctm) return { x: e.clientX, y: e.clientY }
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  function start(e: PointerEvent, id: T, home: Pt): void {
    if (active.value || (opts.canGrab && !opts.canGrab(id))) return
    e.preventDefault()
    const p = toSvg(e)
    startPt = p
    offset = { x: home.x - p.x, y: home.y - p.y }
    moved = false
    returning.value = null
    active.value = { id, x: home.x, y: home.y }

    const onMove = (ev: PointerEvent): void => {
      const q = toSvg(ev)
      if (!moved && Math.hypot(q.x - startPt.x, q.y - startPt.y) > (opts.threshold ?? 8)) moved = true
      if (moved && active.value) active.value = { id, x: q.x + offset.x, y: q.y + offset.y }
    }
    const onUp = (): void => {
      const a = active.value
      stop()
      if (!a) return
      if (!moved) {
        if (opts.onTap) {
          // Предмет нужно перетащить: тап лишь подсказывает. Если малыш никак не справляется (3 тапа подряд), помогаем.
          taps++
          if (taps >= (opts.tapAssist ?? 3)) {
            taps = 0
            opts.onTap(id)
          } else {
            nudge.value = id
            setTimeout(() => (nudge.value = null), 380)
          }
        } else if (opts.onDrop(id, home) === false) returning.value = id
        return
      }
      const ok = opts.onDrop(id, { x: a.x, y: a.y })
      if (ok === false) returning.value = id
      else taps = 0
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    cleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }

  function stop(): void {
    cleanup?.()
    cleanup = null
    active.value = null
  }

  function pos(id: T, home: Pt): Pt {
    const a = active.value
    return a && a.id === id ? { x: a.x, y: a.y } : home
  }

  function style(id: T, home: Pt, extra = ''): Record<string, string> {
    const p = pos(id, home)
    const lifted = active.value?.id === id
    const hop = nudge.value === id ? ' translateY(-16px) scale(1.08)' : ''
    return {
      transform: `translate(${p.x}px, ${p.y}px)${extra}${lifted ? ' scale(1.12)' : ''}${hop}`,
      transition: lifted ? 'none' : 'transform .35s cubic-bezier(.3,1.4,.5,1)',
      cursor: lifted ? 'grabbing' : 'grab',
      touchAction: 'none',
    }
  }

  onBeforeUnmount(stop)
  return { active, returning, nudge, start, pos, style }
}

/** Точка p в круге радиуса r вокруг c. */
export const near = (p: Pt, c: Pt, r: number): boolean => Math.hypot(p.x - c.x, p.y - c.y) <= r
/** Точка p в прямоугольнике. */
export const inRect = (p: Pt, r: { x: number; y: number; w: number; h: number }): boolean =>
  p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h
