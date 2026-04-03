'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  end: number
  duration?: number
}

export default function CountUp({ end, duration = 2000 }: CountUpProps) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // Use IntersectionObserver manually for better compatibility
  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Start after a short delay to allow parent animations to complete
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !started) {
            setStarted(true)
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(el)

      // Fallback: if still not started after 2s, force start
      const fallback = setTimeout(() => {
        if (!started) setStarted(true)
      }, 2000)

      return () => {
        observer.disconnect()
        clearTimeout(fallback)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [started])

  useEffect(() => {
    if (!started) return

    let startTime: number | null = null
    let raf: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        raf = requestAnimationFrame(step)
      } else {
        setCount(end) // ensure exact final value
      }
    }
    raf = requestAnimationFrame(step)

    return () => cancelAnimationFrame(raf)
  }, [started, end, duration])

  return <span ref={ref}>{count}</span>
}
