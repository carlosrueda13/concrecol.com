import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import styles from './boton-cotizar.module.css'

type BotonCotizarVariante = 'primaria' | 'secundaria' | 'contorno'

export interface BotonCotizarProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: BotonCotizarVariante
}

// Recorte diagonal de 10px en la esquina superior izquierda y en la inferior derecha.
const CLIP_PATH =
  'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'

const variantes: Record<BotonCotizarVariante, string> = {
  // El anillo de foco interior (contorno cerrado en :focus-visible) lo dibuja
  // el CSS Module mediante la clase `.primaria`.
  primaria: `bg-lima text-grisCon hover:bg-lima/90 ${styles.primaria}`,
  // Fondo grisCon con texto blanco; el anillo de foco interior (trazo blanco)
  // lo dibuja el CSS Module mediante la clase `.secundaria`.
  secundaria: `bg-grisCon text-blanco hover:bg-grisCon/90 ${styles.secundaria}`,
  // Contorno completo (incluidas las diagonales) y foco interior, ambos del
  // CSS Module; aquí solo se fija el color del texto sobre el interior
  // transparente.
  contorno: `text-grisCon ${styles.contorno}`,
}

const BotonCotizar = React.forwardRef<HTMLButtonElement, BotonCotizarProps>(
  ({ className, variant = 'primaria', asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    // Las tres variantes recortan su forma real y su área interactiva con el
    // mismo clip-path de 10px. El CSS Module dibuja el contorno de la variante
    // contorno (permanente) y los anillos de foco de las variantes primaria y
    // secundaria, todos por segmentos dentro del área recortada.
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap uppercase font-texto font-semibold rounded-none h-10 px-4 transition-colors',
          variantes[variant],
          className,
        )}
        style={{ ...style, clipPath: CLIP_PATH }}
        {...props}
      />
    )
  },
)
BotonCotizar.displayName = 'BotonCotizar'

export { BotonCotizar }
