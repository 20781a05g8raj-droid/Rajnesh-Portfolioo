'use client'

import { useEffect, useRef, useState } from 'react'

interface ScrollImageSequenceProps {
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function ScrollImageSequence({ containerRef }: ScrollImageSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [partHalfImages, setPartHalfImages] = useState<HTMLImageElement[]>([])
  const [nextPartImages, setNextPartImages] = useState<HTMLImageElement[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const scrollProgress = useRef(0)
  const targetProgress = useRef(0)
  const currentImageRef = useRef<HTMLImageElement | null>(null)
  const activeSectionRef = useRef('')
  const pulseStrength = useRef(0)

  // Preload all images from both sequences
  useEffect(() => {
    let isMounted = true
    const loadedPartHalf: HTMLImageElement[] = []
    const loadedNextPart: HTMLImageElement[] = []
    let loadedCount = 0
    const totalFramesPerSeq = 50
    const totalFrames = totalFramesPerSeq * 2

    const preload = async () => {
      const promisesPartHalf = Array.from({ length: totalFramesPerSeq }, (_, i) => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image()
          const frameNum = String(i + 1).padStart(3, '0')
          img.src = `/images/part-half/ezgif-frame-${frameNum}.jpg`
          img.onload = () => {
            loadedPartHalf[i] = img
            loadedCount++
            if (isMounted) {
              setLoadingProgress(Math.round((loadedCount / totalFrames) * 100))
            }
            resolve(img)
          }
          img.onerror = () => {
            resolve(img)
          }
        })
      })

      const promisesNextPart = Array.from({ length: totalFramesPerSeq }, (_, i) => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image()
          const frameNum = String(i + 1).padStart(3, '0')
          img.src = `/images/next-part/ezgif-frame-${frameNum}.jpg`
          img.onload = () => {
            loadedNextPart[i] = img
            loadedCount++
            if (isMounted) {
              setLoadingProgress(Math.round((loadedCount / totalFrames) * 100))
            }
            resolve(img)
          }
          img.onerror = () => {
            resolve(img)
          }
        })
      })

      await Promise.all([...promisesPartHalf, ...promisesNextPart])
      if (isMounted) {
        setPartHalfImages(loadedPartHalf)
        setNextPartImages(loadedNextPart)
        setIsLoaded(true)
      }
    }

    preload()

    return () => {
      isMounted = false
    }
  }, [])

  // Handle resizing and drawing
  useEffect(() => {
    if (!isLoaded || partHalfImages.length === 0 || nextPartImages.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      if (currentImageRef.current) {
        drawFrame(currentImageRef.current, ctx, canvas, scrollProgress.current)
      }
    }

    const drawFrame = (img: HTMLImageElement, context: CanvasRenderingContext2D, cvs: HTMLCanvasElement, progress = 0) => {
      const cvsW = cvs.width
      const cvsH = cvs.height
      const imgW = img.width
      const imgH = img.height

      // Cover aspect ratio calculation with custom slow drift/zoom effect
      const zoom = 1.05 + progress * 0.08 // starts at 1.05 and zooms up to 1.13 for smooth drift
      const scale = Math.max(cvsW / imgW, cvsH / imgH) * zoom
      
      // Add a slight scroll-driven translation drift
      const x = (cvsW - imgW * scale) / 2
      const y = ((cvsH - imgH * scale) / 2) + (progress * 15) // subtle downward drift
      const width = imgW * scale
      const height = imgH * scale

      context.clearRect(0, 0, cvsW, cvsH)
      context.drawImage(img, x, y, width, height)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Animation Loop with smooth lerp
    let animationFrameId: number

    const update = () => {
      if (!containerRef.current) {
        animationFrameId = requestAnimationFrame(update)
        return
      }

      const container = containerRef.current
      const containerHeight = container.scrollHeight

      // Calculate scroll progress from the top of the container to its bottom (Hero to Footer)
      const scrolled = window.scrollY
      const totalScrollable = containerHeight - window.innerHeight

      if (totalScrollable > 0) {
        targetProgress.current = Math.min(1.0, Math.max(0.0, scrolled / totalScrollable))
      }

      // Smooth progress lerp
      scrollProgress.current += (targetProgress.current - scrollProgress.current) * 0.15

      // Section Transition Detector
      const sectionIds = ['level-hero', 'level-about', 'level-services', 'level-work', 'level-process', 'level-testimonials', 'level-contact']
      let currentActiveId = ''
      const midPoint = window.innerHeight / 2
      
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= midPoint && rect.bottom >= midPoint) {
            currentActiveId = id
            break
          }
        }
      }

      if (currentActiveId && currentActiveId !== activeSectionRef.current) {
        if (activeSectionRef.current !== '') {
          // Trigger digital flash transition pulse!
          pulseStrength.current = 1.0
        }
        activeSectionRef.current = currentActiveId
      }

      // Decay visual pulse strength
      if (pulseStrength.current > 0.01) {
        pulseStrength.current *= 0.88 // fades out over ~15 frames
      } else {
        pulseStrength.current = 0
      }

      // Update Canvas styling directly for performance (keep fully visible across all sections with digital flash transition)
      if (canvas) {
        canvas.style.opacity = '1.0'
        canvas.style.display = 'block'
        
        if (pulseStrength.current > 0.01) {
          const flashBrightness = 1.0 + (pulseStrength.current * 0.4) // Flash up to 1.4
          const flashContrast = 1.0 + (pulseStrength.current * 0.2)   // Contrast pop up to 1.2
          const flashBlur = pulseStrength.current * 6                  // Motion blur up to 6px
          canvas.style.filter = `brightness(${flashBrightness}) contrast(${flashContrast}) blur(${flashBlur}px)`
        } else {
          canvas.style.filter = 'none'
        }
      }

      // Determine correct sequence and frame
      let img: HTMLImageElement | undefined
      const threshold = 0.5

      if (scrollProgress.current < threshold) {
        const relativeProgress = scrollProgress.current / threshold
        const frameIndex = Math.max(0, Math.min(partHalfImages.length - 1, Math.round(relativeProgress * (partHalfImages.length - 1))))
        img = partHalfImages[frameIndex]
      } else {
        const relativeProgress = (scrollProgress.current - threshold) / (1.0 - threshold)
        const frameIndex = Math.max(0, Math.min(nextPartImages.length - 1, Math.round(relativeProgress * (nextPartImages.length - 1))))
        img = nextPartImages[frameIndex]
      }

      if (img) {
        currentImageRef.current = img
        // Draw every frame to capture the smooth progress-based zoom/drift
        drawFrame(img, ctx, canvas, scrollProgress.current)
      }

      animationFrameId = requestAnimationFrame(update)
    }

    animationFrameId = requestAnimationFrame(update)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isLoaded, partHalfImages, nextPartImages, containerRef])

  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden pointer-events-none bg-[#0d0a1b]">
      {/* Loading state indicator - subtle overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0a1b] text-white/50 z-50">
          <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-cyan-400 transition-all duration-300 ease-out" 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <span className="text-xs uppercase tracking-widest font-mono">Loading Neural Memory ({loadingProgress}%)</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover transition-opacity duration-300"
        style={{
          opacity: 0,
          willChange: 'opacity, transform',
        }}
      />
    </div>
  )
}
