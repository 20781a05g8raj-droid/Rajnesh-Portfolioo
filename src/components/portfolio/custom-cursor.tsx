'use client'

import { useEffect, useRef, useState } from 'react'
import { useSyncExternalStore } from 'react'

/** Subscribe to "is fine pointer + no reduced motion" so the cursor only shows when appropriate. */
function subscribeCursor(cb: () => void) {
  const mq1 = window.matchMedia('(pointer: fine)')
  const mq2 = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq1.addEventListener('change', cb)
  mq2.addEventListener('change', cb)
  return () => {
    mq1.removeEventListener('change', cb)
    mq2.removeEventListener('change', cb)
  }
}
function getCursorEnabled() {
  return (
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
function getCursorEnabledServer() {
  return false
}

/**
 * Custom cursor: a small dot that follows the pointer with a soft trailing ring.
 * Auto-grows + label appears when hovering interactive elements (a, button, [data-cursor]).
 * Only renders on fine pointers (desktop). Hidden on touch / reduced-motion.
 */
export function CustomCursor() {
  const enabled = useSyncExternalStore(subscribeCursor, getCursorEnabled, getCursorEnabledServer)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const [label, setLabel] = useState<string>('')

  useEffect(() => {
    if (!enabled) return
    document.body.classList.add('has-custom-cursor')

    const dot = dotRef.current!
    const ring = ringRef.current!
    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let rx = mx
    let ry = my
    let raf = 0

    function onMove(e: MouseEvent) {
      mx = e.clientX
      my = e.clientY
      dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`
      const t = e.target as HTMLElement
      const interactive = t.closest('a, button, [data-cursor]')
      if (interactive) {
        const lbl = interactive.getAttribute('data-cursor')
        setLabel(lbl ?? '')
        ring.classList.add('cursor-grow')
      } else {
        setLabel('')
        ring.classList.remove('cursor-grow')
      }
    }
    function onDown() {
      ring.classList.add('cursor-down')
    }
    function onUp() {
      ring.classList.remove('cursor-down')
    }
    function loop() {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      ring.style.transform = `translate3d(${rx - 16}px, ${ry - 16}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.body.classList.remove('has-custom-cursor')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full"
        style={{ background: 'var(--cyan)', mixBlendMode: 'screen' }}
        aria-hidden
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] flex h-8 w-8 items-center justify-center rounded-full border border-white/30 transition-[width,height,background] duration-200"
        style={{ mixBlendMode: 'screen' }}
        aria-hidden
      >
        {label ? (
          <span className="text-[9px] font-medium uppercase tracking-widest text-white/80">
            {label}
          </span>
        ) : null}
      </div>
      <style jsx>{`
        .cursor-grow {
          width: 64px;
          height: 64px;
          margin: -16px;
          background: oklch(0.62 0.24 290 / 15%);
          border-color: oklch(0.78 0.18 200 / 60%);
        }
        .cursor-down {
          width: 24px !important;
          height: 24px !important;
          margin: 0 !important;
          background: oklch(0.78 0.18 200 / 30%);
        }
      `}</style>
    </>
  )
}
