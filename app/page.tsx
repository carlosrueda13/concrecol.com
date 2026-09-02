import Image from 'next/image'
import Link from 'next/link'
import { Factory, Truck, Award, ArrowDown } from 'lucide-react'
import { safeQuery } from '@/lib/db-wrapper'
import { CategoryWithImage } from '@/types'
import { Aparece } from '@/components/animations/aparece'
import { BotonCotizar } from '@/components/boton-cotizar'
// Removed withBasePath import - using direct paths for Vercel

// Forzar renderizado dinamico
export const dynamic = 'force-dynamic'

// Funcion para obtener las categorias activas con una imagen por defecto
async function getActiveCategories(): Promise<CategoryWithImage[]> {
  try {
    const categories = await safeQuery(async (prisma) => {
      return await prisma.sqlCategory.findMany({
        where: {
          is_active: true
        },
        orderBy: {
          name: 'asc'
        },
        take: 6 // Limitamos a 6 categorias
      });
    });

    // Asignamos imagenes predeterminadas o personalizadas segun el slug
    return categories.map(category => {
      // Usamos una imagen placeholder para todas las categorias
      const imageUrl = '/placeholder.jpg';
      
      // Como fallback usamos la misma imagen placeholder
      const fallbackImage = '/placeholder.jpg';
      
      // Descripcion generica basada en el nombre
      const description = `Explora nuestra selección de productos de ${category.name.toLowerCase()} de alta calidad.`;
      
      return {
        ...category,
        imageUrl,
        description
      };
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    
    // Retornar categorias por defecto en caso de error
    return [
      {
        id: '1',
        name: 'Concreto Premezclado',
        slug: 'concreto-premezclado',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: '/placeholder.jpg',
        description: 'Concreto de alta calidad para todo tipo de construcciones'
      },
      {
        id: '2',
        name: 'Materiales de Construcción', 
        slug: 'materiales-construccion',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: '/placeholder.jpg',
        description: 'Amplio catálogo de materiales para construcción'
      },
      {
        id: '3',
        name: 'Servicios Especializados',
        slug: 'servicios-especializados',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: '/placeholder.jpg',
        description: 'Servicios profesionales de construcción'
      }
    ];
  }
}

export default async function HomePage() {
  const categories = await getActiveCategories()
  // Cinco slots para el catalogo: las primeras 5 categorias y relleno nulo hasta cinco.
  const catalogSlots: (CategoryWithImage | null)[] = categories.slice(0, 5)
  while (catalogSlots.length < 5) {
    catalogSlots.push(null)
  }
  return (
    <div className="relative">
      {/* Hero Section: imagen de fondo con zoom, sin video */}
      <section
        id="hero-section"
        className="relative h-[calc(100vh-112px)] min-h-[600px] w-full overflow-hidden bg-grisCon"
      >
        {/* Capa de imagen de fondo con zoom */}
        <div
          className="absolute inset-0 bg-cover bg-center hero-zoom"
          style={{ backgroundImage: "url('/hero-image.jpg')" }}
          aria-hidden="true"
        />
        {/* Overlay para legibilidad del texto */}
        <div className="absolute inset-0 bg-grisCon/60" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1200px] items-center px-4 sm:px-6 xl:px-0">
          <div className="flex flex-col items-start gap-6">
            <h1 className="font-titulo text-[32px] leading-[1.1] uppercase text-blanco sm:text-titulo">
              Construimos confianza, entregamos concreto.
            </h1>
            <p className="font-texto text-subtitulo text-blanco">
              [Bajada — texto pendiente]
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <BotonCotizar asChild variant="primaria" className="h-[56px] w-[220px]">
                <Link href="/cotizacion">Cotizar</Link>
              </BotonCotizar>
              <BotonCotizar asChild variant="secundaria" className="h-[56px] w-[220px]">
                <Link href="/productos">Ver productos</Link>
              </BotonCotizar>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <Link
          href="#ubicacion"
          aria-label="Desplazarse a la sección de ubicación"
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-blanco"
        >
          <ArrowDown className="scroll-indicator h-8 w-8" aria-hidden="true" />
        </Link>
      </section>

      {/* Ubicacion */}
      <section id="ubicacion" className="relative w-full scroll-mt-14 bg-blanco py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0">
          <Aparece direccion="izquierda" distancia={40} duracion={0.6}>
            <h2 className="font-titulo text-subtitulo text-grisCon">Ubicación</h2>
            <div aria-hidden="true" className="w-20 h-1 bg-lima mt-4" />
          </Aparece>
          <div className="mt-8 flex flex-col gap-6 xl:flex-row">
            {/* Mapa: contenedor vacio con borde visible, sin imagen ni servicio de mapas */}
            <div
              role="img"
              aria-label="Mapa de ubicación de Concrecol"
              className="h-[520px] w-full border-2 border-grisCon bg-grisClaro xl:w-[750px]"
            />
            {/* Panel de ubicacion */}
            <div className="flex w-full flex-col justify-center gap-6 xl:h-[520px] xl:w-[426px]">
              <address className="font-texto text-texto not-italic text-grisCon">
                KM 8 Via San gil - Socorro, Santander, Colombia
              </address>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="ubicacion-campo"
                  className="font-texto text-texto text-grisCon"
                >
                  [Etiqueta del campo]
                </label>
                <input
                  id="ubicacion-campo"
                  type="text"
                  placeholder="[Placeholder]"
                  className="h-[48px] w-full max-w-[380px] border border-grisCon bg-blanco px-3 font-texto text-texto text-grisCon placeholder:text-grisCon/60"
                />
              </div>
              <BotonCotizar type="button" variant="contorno" className="h-[48px] w-fit px-6">
                [Texto del botón]
              </BotonCotizar>
            </div>
          </div>
        </div>
      </section>

      {/* Datos */}
      <section id="datos" className="relative w-full bg-grisClaro py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0">
          <Aparece direccion="derecha" distancia={40} duracion={0.6}>
            <h2 className="font-titulo text-subtitulo text-grisCon">Datos</h2>
            <div aria-hidden="true" className="w-20 h-1 bg-lima mt-4" />
          </Aparece>
          <div className="mt-8 flex flex-col gap-8">
            <div className="flex h-[110px] w-full items-center gap-[21px]">
              <Factory className="h-10 w-10 flex-none text-lima" aria-hidden="true" />
              <p className="font-texto text-tarjeta text-grisCon">
                <span>[Etiqueta 1]</span>{' '}
                <span className="font-titulo">[Dato 1]</span>
              </p>
            </div>
            <div className="flex h-[110px] w-full items-center gap-[21px]">
              <Truck className="h-10 w-10 flex-none text-lima" aria-hidden="true" />
              <p className="font-texto text-tarjeta text-grisCon">
                <span>[Etiqueta 2]</span>{' '}
                <span className="font-titulo">[Dato 2]</span>
              </p>
            </div>
            <div className="flex h-[110px] w-full items-center gap-[21px]">
              <Award className="h-10 w-10 flex-none text-lima" aria-hidden="true" />
              <p className="font-texto text-tarjeta text-grisCon">
                <span>[Etiqueta 3]</span>{' '}
                <span className="font-titulo">[Dato 3]</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalogo */}
      <section id="catalogo" className="relative w-full bg-blanco py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Aparece direccion="arriba" distancia={40} duracion={0.6}>
              <div className="flex flex-col">
                <h2 className="font-titulo text-[32px] text-grisCon">Catálogo</h2>
                <div aria-hidden="true" className="w-20 h-1 bg-lima mt-4" />
              </div>
            </Aparece>
            <Link
              href="/productos"
              className="font-texto text-texto text-grisCon underline"
            >
              Ver todo el catálogo
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {catalogSlots.map((category, index) => {
              if (category) {
                return (
                  <div
                    key={category.id}
                    className={index === 4 ? 'xl:col-span-2' : ''}
                  >
                    <Aparece
                      direccion="arriba"
                      distancia={40}
                      duracion={0.6}
                      retraso={index * 0.15}
                    >
                      <Link
                        href={`/productos?categoria=${category.slug}`}
                        className="relative block h-[260px] overflow-hidden border-2 border-grisCon bg-grisClaro"
                      >
                        <Image
                          src="/placeholder-producto.jpg"
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          alt={category.name}
                        />
                        <span className="absolute bottom-4 left-4 z-10 font-titulo text-[18px] text-grisCon">
                          {category.name}
                        </span>
                      </Link>
                    </Aparece>
                  </div>
                )
              }
              return (
                <div
                  key={`slot-${index}`}
                  className={index === 4 ? 'xl:col-span-2' : ''}
                >
                  <Aparece
                    direccion="arriba"
                    distancia={40}
                    duracion={0.6}
                    retraso={index * 0.15}
                  >
                    <div className="relative flex h-[260px] items-center justify-center overflow-hidden border-2 border-dashed border-grisCon bg-grisClaro">
                      <Image
                        src="/placeholder-producto.jpg"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        alt="Categoría pendiente"
                      />
                      <span className="relative z-10 font-texto text-texto text-grisCon">
                        [Categoría pendiente]
                      </span>
                    </div>
                  </Aparece>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Franja marquesina */}
      <div className="flex h-[72px] w-full items-center overflow-hidden whitespace-nowrap bg-grisCon">
        <div className="marquesina-track">
          <span className="font-titulo text-[28px] text-lima uppercase tracking-[0.05em]">CONCRETO PREMEZCLADO · AGREGADOS · CEMENTO · MORTEROS · PLANTA PROPIA EN SAN GIL · </span>
          <span className="font-titulo text-[28px] text-lima uppercase tracking-[0.05em]" aria-hidden="true">CONCRETO PREMEZCLADO · AGREGADOS · CEMENTO · MORTEROS · PLANTA PROPIA EN SAN GIL · </span>
        </div>
      </div>

      {/* Lineas de negocio */}
      <section id="lineas-de-negocio" className="relative w-full bg-grisCon py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0">
          <Aparece direccion="izquierda" distancia={40} duracion={0.6}>
            <h2 className="font-titulo text-[32px] text-blanco">Líneas de negocio</h2>
            <div aria-hidden="true" className="w-20 h-1 bg-lima mt-4" />
          </Aparece>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-col gap-6 xl:h-[360px]">
                <div className="h-[260px] w-full border-2 border-blanco bg-blanco" />
                <p className="font-texto text-[20px] text-blanco">[LÍNEA DE NEGOCIO {n}]</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Argumentos */}
      <section id="argumentos" className="relative w-full bg-grisClaro py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0">
          <Aparece direccion="derecha" distancia={40} duracion={0.6}>
            <h2 className="font-titulo text-[32px] text-grisCon">Argumentos</h2>
            <div aria-hidden="true" className="w-20 h-1 bg-lima mt-4" />
          </Aparece>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-col gap-6 xl:h-[340px]">
                <div className="h-[230px] w-full border-2 border-grisCon bg-grisClaro" />
                <p className="font-titulo text-[18px] text-grisCon">[ARGUMENTO {n}]</p>
                <Link
                  href="/sobre-nosotros"
                  className="font-texto text-[15px] text-grisCon underline"
                >
                  [ENLACE PENDIENTE]
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section id="cierre" className="relative flex h-[120px] w-full items-center bg-lima">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-center gap-3 px-4 sm:gap-6 sm:px-6 xl:px-0">
          <Aparece direccion="arriba" distancia={40} duracion={0.6}>
            <div className="flex flex-col items-center">
              <h2 className="font-titulo text-[24px] text-grisCon">[Título de cierre]</h2>
              <div aria-hidden="true" className="w-20 h-1 bg-lima mt-4 ring-1 ring-inset ring-grisCon" />
            </div>
          </Aparece>
          <BotonCotizar asChild variant="secundaria" className="h-[52px] w-[200px]">
            <Link href="/cotizacion">Cotizar</Link>
          </BotonCotizar>
        </div>
      </section>
    </div>
  )
}
