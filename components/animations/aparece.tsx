'use client'

import React, { useEffect, useRef, useState } from 'react'

type Direccion = 'arriba' | 'izquierda' | 'derecha'

interface ApareceProps {
  children: React.ReactNode
  direccion?: Direccion
  distancia?: number
  duracion?: number
  retraso?: number
}

export function Aparece({
  children,
  direccion = 'arriba',
  distancia = 40,
  duracion = 0.6,
  retraso = 0,
}: ApareceProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [reducido, setReducido] = useState(false)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) {
      setReducido(true)
      setVisible(true)
      return
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { threshold: 0.15 },
    )

    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  const desplazamiento =
    direccion === 'arriba'
      ? `translateY(${distancia}px)`
      : direccion === 'izquierda'
        ? `translateX(-${distancia}px)`
        : `translateX(${distancia}px)`

  let style: React.CSSProperties

  if (reducido) {
    style = { opacity: 1, transform: 'none' }
  } else if (visible) {
    style = {
      opacity: 1,
      transform: 'none',
      transition: `opacity ${duracion}s ease-out ${retraso}s, transform ${duracion}s ease-out ${retraso}s`,
    }
  } else {
    style = { opacity: 0, transform: desplazamiento }
  }

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  )
}
