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

// Diagonal notch: 10px at the top-left corner and 20px at the bottom-right
// corner. All other corners stay square.
const CLIP_PATH =
  'polygon(10px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 10px)'

const variantes: Record<BotonCotizarVariante, string> = {
  // Lime fill with dark gray text. The inner focus ring is drawn by the CSS
  // module (`.primaria:focus-visible`).
  primaria: `bg-lima text-grisCon ${styles.primaria}`,
  // Dark gray fill with white text. The inner focus ring is drawn by the CSS
  // module (`.secundaria:focus-visible`).
  secundaria: `bg-grisCon text-blanco ${styles.secundaria}`,
  // White fill with dark gray text. The full 2px outline (diagonals included)
  // and the inner focus ring are drawn by the CSS module.
  contorno: `bg-blanco text-grisCon ${styles.contorno}`,
}

// Solid color of the independent shadow layer, per variant.
const sombra: Record<BotonCotizarVariante, string> = {
  primaria: '#000000',
  secundaria: '#000000',
  contorno: '#C4D600',
}

// Utilities whose display effect must land on the wrapper: it is the node that
// participates in the consumer layout (flex/grid/gap), not the interactive
// child. `hidden` and `md:inline-flex` belong here.
const CLASES_DISPLAY = new Set([
  'block',
  'inline-block',
  'inline',
  'flex',
  'inline-flex',
  'grid',
  'inline-grid',
  'contents',
  'flow-root',
  'table',
  'table-row',
  'table-cell',
  'list-item',
  'hidden',
])

// Flex-item utilities (shrink/grow/basis). `shrink-0` must apply to the
// wrapper, which is the real flex item of the consumer container.
const CLASES_FLEX = new Set([
  'shrink',
  'shrink-0',
  'grow',
  'grow-0',
  'flex-1',
  'flex-auto',
  'flex-initial',
  'flex-none',
])

type Categoria = 'layout' | 'ambos' | 'visual'

// Classifies each token of the consumer `className`:
// - 'layout': wrapper only (display, shrink/grow, margins).
// - 'ambos': wrapper and interactive element (widths/heights), so the control
//   fills the wrapper box exactly and the shadow matches the control edge.
// - 'visual': interactive element only (padding, colors, borders, ...).
function clasificar(token: string): Categoria {
  // Splits the responsive variant (md:, hover:, max-[600px]:, ...) from the
  // base utility.
  const idx = token.lastIndexOf(':')
  const base = idx >= 0 ? token.slice(idx + 1) : token

  if (CLASES_DISPLAY.has(base) || CLASES_FLEX.has(base)) return 'layout'
  if (/^basis-/.test(base)) return 'layout'
  if (/^(m|mx|my|mt|mr|mb|ml|ms|me)-/.test(base)) return 'layout'
  if (/^(w|h|min-w|min-h|max-w|max-h|size)-/.test(base)) return 'ambos'

  return 'visual'
}

function partirClases(
  className?: string,
): { wrapper: string; interactivo: string } {
  const wrapper: string[] = []
  const interactivo: string[] = []
  if (!className) return { wrapper: '', interactivo: '' }
  for (const token of className.split(/\s+/)) {
    if (!token) continue
    const categoria = clasificar(token)
    if (categoria === 'layout' || categoria === 'ambos') wrapper.push(token)
    if (categoria === 'ambos' || categoria === 'visual') interactivo.push(token)
  }
  return { wrapper: wrapper.join(' '), interactivo: interactivo.join(' ') }
}

const BotonCotizar = React.forwardRef<HTMLButtonElement, BotonCotizarProps>(
  ({ className, variant = 'primaria', asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    const { wrapper: clasesWrapper, interactivo: clasesInteractivo } =
      partirClases(className)

    return (
      <span className={cn('relative inline-flex', styles.wrapper, clasesWrapper)}>
        {/* Sibling shadow layer: solid fill, same clip-path as the control,
            offset exactly 8px down and 8px right, no blur. */}
        <span
          aria-hidden="true"
          className={styles.sombra}
          style={{
            clipPath: CLIP_PATH,
            backgroundColor: sombra[variant],
          }}
        />
        <Comp
          ref={ref}
          className={cn(
            'relative z-10 inline-flex items-center justify-center whitespace-nowrap uppercase font-texto font-semibold rounded-none h-10 px-4 tracking-[0.05em] underline underline-offset-4',
            variantes[variant],
            clasesInteractivo,
          )}
          style={{ ...style, clipPath: CLIP_PATH }}
          {...props}
        />
      </span>
    )
  },
)
BotonCotizar.displayName = 'BotonCotizar'

export { BotonCotizar }
