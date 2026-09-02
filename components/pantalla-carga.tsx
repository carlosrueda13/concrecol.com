'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const DURACION_MINIMA_MS = 1800

export default function PantallaCarga() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const [duracionVisual, setDuracionVisual] = useState(0)
  const [progresoVisual, setProgresoVisual] = useState(0)
  const progressRef = useRef(0)
  const progresoVisualRef = useRef(0)
  const animacionRef = useRef<number | null>(null)
  const instanteDeMontajeRef = useRef(0)

  useEffect(() => {
    const instanteDeMontaje = Date.now()
    instanteDeMontajeRef.current = instanteDeMontaje

    let seen = false
    let reducedMotion = false
    try {
      seen = sessionStorage.getItem('carga-vista') !== null
    } catch {
      seen = false
    }
    try {
      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      reducedMotion = false
    }

    if (seen || reducedMotion) {
      return
    }

    setVisible(true)

    const advance = (value: number) => {
      const next = Math.max(progressRef.current, value)
      if (next > progressRef.current) {
        progressRef.current = next
        setProgress(next)
        setDuracionVisual(Math.max(0, DURACION_MINIMA_MS - (Date.now() - instanteDeMontaje)))
      }
    }

    const onReadyStateChange = () => {
      const state = document.readyState
      if (state === 'interactive' || state === 'complete') {
        advance(60)
      }
    }

    const onLoad = () => {
      advance(100)
    }

    const rafId = requestAnimationFrame(() => {
      advance(25)
      const state = document.readyState
      if (state === 'interactive' || state === 'complete') {
        advance(60)
      } else {
        document.addEventListener('readystatechange', onReadyStateChange)
      }
    })

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => advance(85))
    }

    if (document.readyState === 'complete') {
      advance(100)
    } else {
      window.addEventListener('load', onLoad)
    }

    const forceTimer = window.setTimeout(() => advance(100), 4000)

    return () => {
      cancelAnimationFrame(rafId)
      window.clearTimeout(forceTimer)
      document.removeEventListener('readystatechange', onReadyStateChange)
      window.removeEventListener('load', onLoad)
    }
  }, [])

  useEffect(() => {
    if (!visible) {
      return
    }

    const desde = progresoVisualRef.current
    const hasta = progress

    if (hasta === desde) {
      return
    }

    const duracion = duracionVisual > 0 ? duracionVisual : 300
    const inicio = performance.now()

    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracion)
      const valor = desde + (hasta - desde) * t
      progresoVisualRef.current = valor
      setProgresoVisual(valor)
      if (t < 1) {
        animacionRef.current = requestAnimationFrame(paso)
      } else {
        progresoVisualRef.current = hasta
        setProgresoVisual(hasta)
      }
    }

    animacionRef.current = requestAnimationFrame(paso)

    return () => {
      if (animacionRef.current !== null) {
        cancelAnimationFrame(animacionRef.current)
      }
    }
  }, [progress, visible, duracionVisual])

  useEffect(() => {
    if (progress !== 100 || !visible) {
      return
    }

    const transcurrido = Date.now() - instanteDeMontajeRef.current
    const esperaMinima = Math.max(0, DURACION_MINIMA_MS - transcurrido)

    const fadeTimer = window.setTimeout(() => setFading(true), esperaMinima + 300)
    const removeTimer = window.setTimeout(() => {
      setVisible(false)
      try {
        sessionStorage.setItem('carga-vista', '1')
      } catch {
        // storage may be unavailable; overlay is removed anyway
      }
    }, esperaMinima + 800)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(removeTimer)
    }
  }, [progress, visible])

  if (!visible) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-grisCon ${fading ? 'carga-fade-out' : ''}`}
      style={{ pointerEvents: progress >= 100 ? 'none' : 'auto' }}
    >
      <Image
        src="/logo-hero.png"
        alt="Concrecol"
        width={626}
        height={132}
        priority
        style={{ width: 280, height: 'auto' }}
      />
      <div className="mt-10 w-[320px] h-2 overflow-hidden bg-blanco/25">
        <div className="h-full bg-lima" style={{ width: `${progresoVisual}%` }} />
      </div>
      <p className="mt-4 text-center font-titulo text-[20px] text-lima">
        {Math.round(progresoVisual)}%
      </p>
      <p className="mt-2 text-center font-texto text-[14px] text-blanco/60 uppercase tracking-[0.15em]">
        Cargando
      </p>
    </div>
  )
}
