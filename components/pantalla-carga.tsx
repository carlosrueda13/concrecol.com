'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const DURACION_MINIMA_MS = 1800
const DURACION_TRANSICION_MS = 1500

function esAdmin(pathname: string | null): boolean {
  if (!pathname) {
    return false
  }
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

function obtenerPathname(href: string): string {
  const queryIndex = href.indexOf('?')
  const hashIndex = href.indexOf('#')
  let fin = href.length
  if (queryIndex !== -1 && queryIndex < fin) {
    fin = queryIndex
  }
  if (hashIndex !== -1 && hashIndex < fin) {
    fin = hashIndex
  }
  return href.slice(0, fin)
}

export default function PantallaCarga() {
  const pathname = usePathname()

  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const [duracionVisual, setDuracionVisual] = useState(0)
  const [progresoVisual, setProgresoVisual] = useState(0)

  const [transicionando, setTransicionando] = useState(false)
  const [progresoTransicion, setProgresoTransicion] = useState(0)
  const [fadingTransicion, setFadingTransicion] = useState(false)
  const [transicionNavego, setTransicionNavego] = useState(false)

  const progressRef = useRef(0)
  const progresoVisualRef = useRef(0)
  const animacionRef = useRef<number | null>(null)
  const instanteDeMontajeRef = useRef(0)

  const pathnameRef = useRef(pathname)
  const pathnamePrevioRef = useRef(pathname)
  const transicionandoRef = useRef(false)
  const animacionTransicionRef = useRef<number | null>(null)
  const inicialVisibleRef = useRef(false)
  const reducedMotionRef = useRef(false)

  // Keep the current pathname available to the global click listener and
  // detect when a client-side navigation finishes during a transition.
  useEffect(() => {
    const anterior = pathnamePrevioRef.current
    pathnamePrevioRef.current = pathname
    pathnameRef.current = pathname

    if (transicionandoRef.current && pathname !== anterior) {
      setTransicionNavego(true)
    }
  }, [pathname])

  // Respect the same reduced-motion preference honored by the initial flow.
  useEffect(() => {
    try {
      reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      reducedMotionRef.current = false
    }
  }, [])

  // Mirror the initial overlay visibility so transitions only start after
  // the first load has finished (visible remains true during its fade-out).
  useEffect(() => {
    inicialVisibleRef.current = visible
  }, [visible])

  useEffect(() => {
    const instanteDeMontaje = Date.now()
    instanteDeMontajeRef.current = instanteDeMontaje

    // Admin routes skip the initial overlay; this effect runs once, so a
    // pending initial state never reappears when navigating away from admin.
    if (esAdmin(pathnameRef.current)) {
      return
    }

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

  // Start a transition overlay when an internal public link is clicked.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (transicionandoRef.current) {
        return
      }

      if (event.button !== 0) {
        return
      }

      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return
      }

      if (inicialVisibleRef.current) {
        return
      }

      if (reducedMotionRef.current) {
        return
      }

      const target = event.target
      const anchor = target instanceof Element ? target.closest('a') : null
      if (!anchor) {
        return
      }

      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('/') || href.startsWith('//')) {
        return
      }

      if (anchor.hasAttribute('download')) {
        return
      }

      if (anchor.getAttribute('target') === '_blank') {
        return
      }

      const destino = obtenerPathname(href)
      if (esAdmin(destino)) {
        return
      }

      const actual = pathnameRef.current
      if (esAdmin(actual)) {
        return
      }

      if (destino === actual) {
        return
      }

      transicionandoRef.current = true
      setFadingTransicion(false)
      setTransicionNavego(false)
      setProgresoTransicion(0)
      setTransicionando(true)
    }

    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
    }
  }, [])

  // Animate the transition progress from 0 to 100 over DURACION_TRANSICION_MS.
  useEffect(() => {
    if (!transicionando) {
      return
    }

    const inicio = performance.now()

    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / DURACION_TRANSICION_MS)
      const valor = t * 100
      setProgresoTransicion(valor)
      if (t < 1) {
        animacionTransicionRef.current = requestAnimationFrame(paso)
      }
    }

    animacionTransicionRef.current = requestAnimationFrame(paso)

    return () => {
      if (animacionTransicionRef.current !== null) {
        cancelAnimationFrame(animacionTransicionRef.current)
      }
    }
  }, [transicionando])

  // Close the transition once the progress is complete and navigation done.
  useEffect(() => {
    if (!transicionando || progresoTransicion < 100 || !transicionNavego) {
      return
    }

    const fadeTimer = window.setTimeout(() => setFadingTransicion(true), 300)
    const removeTimer = window.setTimeout(() => {
      setTransicionando(false)
      setProgresoTransicion(0)
      setFadingTransicion(false)
      setTransicionNavego(false)
      transicionandoRef.current = false
    }, 800)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(removeTimer)
    }
  }, [progresoTransicion, transicionando, transicionNavego])

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

  const overlayVisible = visible || transicionando
  if (!overlayVisible) {
    return null
  }

  const progresoActivo = transicionando ? progresoTransicion : progresoVisual
  const fadingActivo = transicionando ? fadingTransicion : fading
  const completado = transicionando ? progresoTransicion >= 100 : progress >= 100

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-grisCon ${fadingActivo ? 'carga-fade-out' : ''}`}
      style={{ pointerEvents: completado ? 'none' : 'auto' }}
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
        <div className="h-full bg-lima" style={{ width: `${progresoActivo}%` }} />
      </div>
      <p className="mt-4 text-center font-titulo text-[20px] text-lima">
        {Math.round(progresoActivo)}%
      </p>
      <p className="mt-2 text-center font-texto text-[14px] text-blanco/60 uppercase tracking-[0.15em]">
        Cargando
      </p>
    </div>
  )
}
