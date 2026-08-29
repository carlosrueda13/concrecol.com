import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import styles from './boton-cotizar.module.css'

type BotonCotizarVariante = 'principal' | 'secundario'

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
  // el CSS Module mediante la clase `.principal`.
  principal: `bg-lima text-grisCon hover:bg-lima/90 ${styles.principal}`,
  // El contorno cerrado (incluidas las diagonales) lo dibuja el CSS Module;
  // aquí solo se fija el color del texto sobre el interior transparente.
  secundario: `text-grisCon ${styles.secundario}`,
}

const BotonCotizar = React.forwardRef<HTMLButtonElement, BotonCotizarProps>(
  ({ className, variant = 'principal', asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    // Ambas variantes recortan su forma real y su área interactiva con el
    // mismo clip-path de 10px. El CSS Module dibuja el contorno de la variante
    // secundaria (permanente) y el anillo de foco de la variante principal,
    // ambos por segmentos dentro del área recortada.
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
