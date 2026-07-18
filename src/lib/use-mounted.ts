'use client'

import { useSyncExternalStore } from 'react'

/**
 * SSR-safe "is this mounted on the client?" flag.
 * Uses useSyncExternalStore so it doesn't trigger the
 * "setState synchronously within an effect" lint rule.
 */
const emptySubscribe = () => () => {}

export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot — always true once hydrated
    () => false // server snapshot — false during SSR
  )
}

/**
 * SSR-safe prefers-reduced-motion check.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  )
}
