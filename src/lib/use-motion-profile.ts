'use client'

import { useSyncExternalStore } from 'react'

type DeviceTier = 'high' | 'low'

interface MotionProfile {
  prefersReducedMotion: boolean
  deviceTier: DeviceTier
  /** True only when WebGL is OK to use (high tier + no reduced motion) */
  useWebGL: boolean
  /** True on coarse pointers (touch) */
  isTouch: boolean
}

const SERVER_PROFILE: MotionProfile = {
  prefersReducedMotion: false,
  deviceTier: 'high',
  useWebGL: true,
  isTouch: false,
}

let cachedProfile: MotionProfile | null = null

function subscribe() {
  // No subscription needed — profile is computed once per page load
  return () => {}
}

function getSnapshot(): MotionProfile {
  if (cachedProfile) return cachedProfile
  if (typeof window === 'undefined') return SERVER_PROFILE

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  const isTouch = window.matchMedia('(pointer: coarse)').matches

  const cores = (navigator.hardwareConcurrency ?? 4) as number
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4
  const isSmallScreen = window.innerWidth < 768

  const deviceTier: DeviceTier =
    cores <= 4 || memory <= 4 || (isSmallScreen && isTouch) ? 'low' : 'high'

  let webglOk = true
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    webglOk = !!gl
  } catch {
    webglOk = false
  }

  const useWebGL = !prefersReducedMotion && deviceTier === 'high' && webglOk

  cachedProfile = { prefersReducedMotion, deviceTier, useWebGL, isTouch }
  return cachedProfile
}

function getServerSnapshot(): MotionProfile {
  return SERVER_PROFILE
}

export function useMotionProfile(): MotionProfile {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
