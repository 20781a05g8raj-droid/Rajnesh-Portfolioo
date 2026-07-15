'use client'

import { useEffect, useRef, type RefObject } from 'react'

interface MagneticOptions {
  /** How strongly the element follows the cursor (0..1). Default 0.35 */
  strength?: number
  /** Radius in px within which the magnet engages. Default 120 */
  radius?: number
  /** Optional inner element ref (e.g. text inside button) that moves a bit more */
  innerRef?: RefObject<HTMLElement | null>
  innerStrength?: number
}

/**
 * Magnetic hover effect — element drifts toward the cursor when within `radius`.
 * Returns a ref to attach to the target element.
 */
export function useMagnetic<T extends HTMLElement>({
  strength = 0.35,
  radius = 120,
  innerRef,
  innerStrength = 0.6,
}: MagneticOptions = {}) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const inner = innerRef?.current ?? null

    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      if (dist > radius) {
        el!.style.transform = 'translate3d(0px, 0px, 0)'
        if (inner) inner.style.transform = 'translate3d(0px, 0px, 0)'
        return
      }
      const tx = dx * strength
      const ty = dy * strength
      el!.style.transform = `translate3d(${tx}px, ${ty}px, 0)`
      if (inner) {
        inner.style.transform = `translate3d(${dx * innerStrength}px, ${dy * innerStrength}px, 0)`
      }
    }
    function onLeave() {
      el!.style.transform = 'translate3d(0px, 0px, 0)'
      el!.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      if (inner) {
        inner.style.transform = 'translate3d(0px, 0px, 0)'
        inner.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
    function onEnter() {
      el!.style.transition = 'transform 0.08s ease-out'
      if (inner) inner.style.transition = 'transform 0.08s ease-out'
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength, radius, innerRef, innerStrength])

  return ref
}
