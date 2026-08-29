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

// Color sólido de la capa de sombra independiente, por variante. Para
// `secundaria` se usa un gris más oscuro que #4D4D4D para que la silueta sea
// claramente visible sobre el relleno grisCon del propio botón.
const sombra: Record<BotonCotizarVariante, string> = {
  primaria: '#4D4D4D',
  secundaria: '#333333',
  contorno: '#4D4D4D',
}

// Utilidades de `display` cuyo efecto debe recaer sobre el wrapper: es el nodo
// que participa en el layout del consumidor (flex/grid/gap), no el hijo
// interactivo. `hidden` y `md:inline-flex` entran aquí.
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

// Utilidades de flex-item (shrink/grow/basis). `shrink-0` debe aplicar al
// wrapper, que es el flex item real del contenedor del consumidor.
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

// Clasifica cada token del `className` del consumidor:
// - 'layout': solo al wrapper (display, shrink/grow, márgenes).
// - 'ambos': al wrapper y al elemento interactivo (anchuras/alturas), para que
//   el control llene exactamente la caja del wrapper y la sombra coincida con
//   el borde del control.
// - 'visual': solo al elemento interactivo (padding, colores, bordes, …).
function clasificar(token: string): Categoria {
  // Separa la variante responsive (md:, hover:, max-[600px]:, …) de la base.
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

    // Identificador único por instancia para el filtro de sombra. `useId`
    // devuelve tokens con `:` que no son seguros dentro de `url(#…)`, por lo
    // que se sanitiza conservando la unicidad.
    const reactId = React.useId()
    const filtroId = `sombra-cotizar-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`

    const { wrapper: clasesWrapper, interactivo: clasesInteractivo } =
      partirClases(className)

    // La sombra es un filtro SVG aplicado a una capa sólida hermana del frente
    // (`.sombra`, recortada con el MISMO polígono de 10px y rellena de color
    // opaco). Su `SourceAlpha` es, por tanto, el polígono sólido idéntico para
    // las tres variantes, independiente del fondo. `feOffset` lo desplaza 4px;
    // `feComposite operator="out"` resta el polígono frontal, dejando solo la
    // silueta de 4px visible abajo/derecha (nunca se transparenta a través del
    // interior de `contorno`); `feFlood` la rellena con el color de la variante
    // y el último `feComposite` compone ese color dentro de la silueta. El
    // elemento se pinta SOLO con esa silueta (el relleno sólido se descarta en
    // el filtro). Sin blur. La región se amplía para no recortar los 4px.
    return (
      <span className={cn('relative inline-flex', styles.wrapper, clasesWrapper)}>
        <svg
          aria-hidden="true"
          focusable={false}
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        >
          <defs>
            <filter id={filtroId} x="-20%" y="-20%" width="140%" height="140%">
              <feOffset in="SourceAlpha" dx="4" dy="4" result="desplazada" />
              <feComposite in="desplazada" in2="SourceAlpha" operator="out" result="silueta" />
              <feFlood floodColor={sombra[variant]} result="relleno" />
              <feComposite in="relleno" in2="silueta" operator="in" />
            </filter>
          </defs>
        </svg>
        <span
          aria-hidden="true"
          className={styles.sombra}
          style={{
            clipPath: CLIP_PATH,
            backgroundColor: sombra[variant],
            filter: `url(#${filtroId})`,
          }}
        />
        <Comp
          ref={ref}
          className={cn(
            'relative inline-flex items-center justify-center whitespace-nowrap uppercase font-texto font-semibold rounded-none h-10 px-4 tracking-[0.05em] underline underline-offset-4',
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
