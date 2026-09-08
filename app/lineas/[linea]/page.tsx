import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LineaNegocio } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Aparece } from '@/components/animations/aparece'
import { BotonCotizar } from '@/components/boton-cotizar'
import { Carousel } from '@/components/carousel'
import { Ubicacion } from '@/components/ubicacion'

interface ConfigLinea {
  linea: LineaNegocio
  nombre: string
  titulo: string
  boton: { texto: string; href: string }
  imagenHero: string
}

// Configuracion por linea de negocio: parametro de ruta -> enum de Prisma.
const LINEAS: Record<string, ConfigLinea> = {
  concreto: {
    linea: LineaNegocio.CONCRETO,
    nombre: 'Concreto',
    titulo: 'Concreto premezclado listo para tu obra',
    boton: { texto: 'Cotizar', href: '/cotizacion?linea=CONCRETO' },
    imagenHero: '/lineas/concreto.jpg',
  },
  agregados: {
    linea: LineaNegocio.AGREGADOS,
    nombre: 'Agregados',
    titulo: 'Agregados de cantera para cada etapa de la obra',
    boton: { texto: 'Cotizar', href: '/cotizacion?linea=AGREGADOS' },
    imagenHero: '/lineas/agregados.jpg',
  },
  constructora: {
    linea: LineaNegocio.CONSTRUCTORA,
    nombre: 'Constructora',
    titulo: 'Proyectos propios, la misma calidad que ofrecemos',
    boton: { texto: 'Contactar', href: '/contacto' },
    imagenHero: '/lineas/constructora.jpg',
  },
  prefabricados: {
    linea: LineaNegocio.PREFABRICADOS,
    nombre: 'Prefabricados',
    titulo: 'Prefabricados de concreto para obra y acabados',
    boton: { texto: 'Cotizar', href: '/cotizacion?linea=PREFABRICADOS' },
    imagenHero: '/lineas/prefabricados.jpg',
  },
}

// Imagen por categoria de Prefabricados: slug -> ruta de la imagen.
const CATEGORIA_IMAGEN_PREFABRICADOS: Record<string, string> = {
  adoquines: '/categorias-prefabricados/adoquines.jpg',
  'bloques-divisorios': '/categorias-prefabricados/bloques-divisorios.jpg',
  'bloques-estructurales': '/categorias-prefabricados/bloques-estructurales.jpg',
  calados: '/categorias-prefabricados/calados.jpg',
  decks: '/categorias-prefabricados/decks.jpg',
  'espacio-publico': '/categorias-prefabricados/espacio-publico.jpg',
  gramoquin: '/categorias-prefabricados/gramoquin.jpg',
  losetas: '/categorias-prefabricados/losetas.jpg',
}

// Proyectos propios de la Constructora: nombre y galeria de imagenes.
const PROYECTOS_CONSTRUCTORA = [
  {
    nombre: 'Parque Barichara',
    images: [
      '/projects/parque-barichara-1.jpeg',
      '/projects/parque-barichara-2.jpeg',
      '/projects/parque-barichara-3.jpeg',
    ],
  },
  {
    nombre: 'Mantenimiento Casa de la Cultura Galán',
    images: [
      '/projects/casa-cultura-galan-1.jpeg',
      '/projects/casa-cultura-galan-2.jpeg',
      '/projects/casa-cultura-galan-3.jpeg',
    ],
  },
  {
    nombre: 'Mobiliario Alcaldía de Galán',
    images: [
      '/projects/mobiliario-alcaldia-galan-1.jpeg',
      '/projects/mobiliario-alcaldia-galan-2.jpeg',
      '/projects/mobiliario-alcaldia-galan-3.jpeg',
    ],
  },
  {
    nombre: 'Mantenimiento vial',
    images: [
      '/projects/mantenimiento-vial-1.jpeg',
      '/projects/mantenimiento-vial-2.jpeg',
      '/projects/mantenimiento-vial-3.jpeg',
    ],
  },
  {
    nombre: 'Zona de juegos infantil',
    images: [
      '/projects/zona-juegos-infantil-1.jpeg',
      '/projects/zona-juegos-infantil-2.jpeg',
      '/projects/zona-juegos-infantil-3.jpeg',
    ],
  },
]

interface LineaPageProps {
  params: {
    linea: string
  }
}

export default async function LineaPage({ params }: LineaPageProps) {
  const config = LINEAS[params.linea]

  if (!config) {
    notFound()
  }

  const isPrefabricados = params.linea === 'prefabricados'
  const isConstructora = params.linea === 'constructora'

  const categories = isPrefabricados
    ? await prisma.sqlCategory.findMany({
        where: {
          is_active: true,
          products: {
            some: {
              lineaNegocio: 'PREFABRICADOS',
              is_active: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      })
    : null

  const products =
    isPrefabricados || isConstructora
      ? null
      : await prisma.product.findMany({
          where: {
            lineaNegocio: config.linea,
            is_active: true,
          },
          orderBy: {
            name: 'asc',
          },
        })

  return (
    <div className="relative">
      {/* Hero: imagen de fondo a sangre, titulo y boton por linea */}
      <section
        id="hero-section"
        className="relative h-[calc(100vh-112px)] min-h-[600px] w-full bg-grisCon bg-cover bg-center"
        style={{ backgroundImage: `url('${config.imagenHero}')` }}
      >
        {/* Overlay para legibilidad del texto */}
        <div className="absolute inset-0 bg-grisCon/60" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1200px] items-center px-4 sm:px-6 xl:px-0">
          <Aparece direccion="izquierda" distancia={40} duracion={0.6}>
            <div className="flex flex-col items-start gap-4">
              <h1 className="font-titulo text-[32px] leading-[1.1] uppercase text-blanco sm:text-titulo">
                {config.titulo}
              </h1>
              <BotonCotizar
                asChild
                variant="primaria"
                className="h-[56px] w-[220px]"
              >
                <Link href={config.boton.href}>{config.boton.texto}</Link>
              </BotonCotizar>
            </div>
          </Aparece>
        </div>
      </section>

      {/* Ubicacion */}
      <Ubicacion />

      {/* Productos de la linea */}
      <section
        id="productos"
        className="relative mt-0 sm:-mt-[64px] w-full bg-grisCon py-24 sm:py-32 sm:[clip-path:polygon(0_64px,100%_0,100%_100%,0_100%)]"
      >
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 xl:px-0">
          <Aparece direccion="arriba" distancia={40} duracion={0.6}>
            <h2 className="font-titulo text-[40px] leading-[1.1] text-blanco">
              {isConstructora ? 'Nuestros proyectos' : `Nuestros productos en ${config.nombre}`}
            </h2>
            <div aria-hidden="true" className="mt-4 h-1 w-20 bg-lima" />
          </Aparece>
          {isConstructora ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {PROYECTOS_CONSTRUCTORA.map((proyecto) => (
                <div
                  key={proyecto.nombre}
                  className="flex flex-col border-2 border-grisCon bg-blanco"
                >
                  <Carousel images={proyecto.images} productName={proyecto.nombre} />
                  <div className="flex flex-col gap-1 p-4">
                    <h3 className="font-titulo text-[20px] leading-[1.3] text-grisCon">
                      {proyecto.nombre}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : isPrefabricados ? (
            categories && categories.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {categories.map((category, index) => (
                  <Aparece
                    key={category.id}
                    direccion="arriba"
                    distancia={40}
                    duracion={0.6}
                    retraso={index * 0.1}
                  >
                    <Link
                      href={`/lineas/prefabricados/${category.slug}`}
                      className="flex flex-col border-2 border-grisCon bg-blanco"
                    >
                      <div className="relative h-[300px] w-full">
                        <Image
                          src={
                            CATEGORIA_IMAGEN_PREFABRICADOS[category.slug] ||
                            '/placeholder-producto.jpg'
                          }
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 384px"
                          alt={category.name}
                        />
                      </div>
                      <div className="flex min-h-[140px] flex-col gap-1 p-4 justify-center">
                        <h3 className="font-titulo text-[20px] leading-[1.3] text-grisCon">
                          {category.name}
                        </h3>
                      </div>
                    </Link>
                  </Aparece>
                ))}
              </div>
            ) : (
              <p className="mt-8 font-texto text-[16px] text-blanco">
                {'[Proximamente productos en esta linea]'}
              </p>
            )
          ) : products && products.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product, index) => (
                <Aparece
                  key={product.id}
                  direccion="arriba"
                  distancia={40}
                  duracion={0.6}
                  retraso={index * 0.1}
                >
                  <Link
                    href={`/productos/${product.slug}`}
                    className="group relative flex flex-col border-2 border-grisCon bg-blanco"
                  >
                    <div className="relative h-[380px] w-full overflow-hidden">
                      <Image
                        src={product.images[0] || '/placeholder-producto.jpg'}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 384px"
                        alt={product.name}
                      />
                      {product.description ? (
                        <div className="absolute inset-0 flex items-center justify-center text-center bg-grisCon/80 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <p className="line-clamp-6 text-center font-texto text-[17px] leading-[1.6] text-blanco">
                            {product.description}
                          </p>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1 p-4">
                      <h3 className="font-titulo text-[20px] leading-[1.3] text-grisCon">
                        {product.name}
                      </h3>
                    </div>
                  </Link>
                </Aparece>
              ))}
            </div>
          ) : (
            <p className="mt-8 font-texto text-[16px] text-blanco">
              {'[Proximamente productos en esta linea]'}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
