import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LineaNegocio } from '@prisma/client'
import {
  ArrowRight,
  Building2,
  CheckCircle,
  Factory,
  Layers,
  LayoutGrid,
  Mountain,
  Package,
  Palette,
  SlidersHorizontal,
  Truck,
  type LucideIcon,
} from 'lucide-react'
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
  puntosDestacados: Array<{ icono: LucideIcon; titulo: string; texto: string }>
}

// Configuracion por linea de negocio: parametro de ruta -> enum de Prisma.
const LINEAS: Record<string, ConfigLinea> = {
  concreto: {
    linea: LineaNegocio.CONCRETO,
    nombre: 'Concreto',
    titulo: 'Concreto premezclado listo para tu obra',
    boton: { texto: 'Cotizar', href: '/cotizacion?linea=CONCRETO' },
    imagenHero: '/lineas/concreto.avif',
    puntosDestacados: [
      { icono: Factory, titulo: 'Planta propia en San Gil', texto: 'Control de calidad de principio a fin.' },
      { icono: Truck, titulo: 'Flota propia', texto: 'Entrega directa a tu obra.' },
      { icono: CheckCircle, titulo: 'Resistencia certificada', texto: 'Cada mezcla cumple lo especificado.' },
    ],
  },
  agregados: {
    linea: LineaNegocio.AGREGADOS,
    nombre: 'Agregados',
    titulo: 'Agregados de cantera para cada etapa de la obra',
    boton: { texto: 'Cotizar', href: '/cotizacion?linea=AGREGADOS' },
    imagenHero: '/lineas/agregados.jpg',
    puntosDestacados: [
      { icono: Mountain, titulo: 'Cantera propia', texto: 'Trazabilidad garantizada.' },
      { icono: SlidersHorizontal, titulo: 'Granulometría controlada', texto: 'Mezclas más consistentes.' },
      { icono: Package, titulo: 'Grandes volúmenes', texto: 'Disponibilidad para cualquier proyecto.' },
    ],
  },
  constructora: {
    linea: LineaNegocio.CONSTRUCTORA,
    nombre: 'Constructora',
    titulo: 'Proyectos propios, la misma calidad que ofrecemos',
    boton: {
      texto: 'Contactar',
      href: 'https://wa.me/573214525798?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20sus%20proyectos%20de%20construcci%C3%B3n',
    },
    imagenHero: '/lineas/constructora.webp',
    puntosDestacados: [
      { icono: Building2, titulo: 'Experiencia comprobada', texto: 'Proyectos públicos y privados.' },
      { icono: Layers, titulo: 'Materiales propios', texto: 'Mismo estándar en cada obra.' },
      { icono: CheckCircle, titulo: 'Cumplimiento', texto: 'Entregas en el tiempo pactado.' },
    ],
  },
  prefabricados: {
    linea: LineaNegocio.PREFABRICADOS,
    nombre: 'Prefabricados',
    titulo: 'Prefabricados de concreto para obra y acabados',
    boton: { texto: 'Cotizar', href: '/cotizacion?linea=PREFABRICADOS' },
    imagenHero: '/lineas/prefabricados.jpg',
    puntosDestacados: [
      { icono: LayoutGrid, titulo: 'Ocho familias de producto', texto: 'Soluciones para cada necesidad.' },
      { icono: Palette, titulo: 'Fabricación bajo pedido', texto: 'Color y acabado a solicitud.' },
      { icono: CheckCircle, titulo: 'Calidad certificada', texto: 'Mismo estándar que nuestro concreto.' },
    ],
  },
}

// Imagen por categoria de Prefabricados: slug -> ruta de la imagen.
const CATEGORIA_IMAGEN_PREFABRICADOS: Record<string, string> = {
  adoquines: '/categorias-prefabricados/adoquines.jpg',
  bloques: '/categorias-prefabricados/bloques.jpg',
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
                className="h-[44px] w-full sm:h-[56px] sm:w-[220px]"
              >
                <Link
                  href={config.boton.href}
                  target={
                    config.boton.href.startsWith('https://wa.me')
                      ? '_blank'
                      : undefined
                  }
                  rel={
                    config.boton.href.startsWith('https://wa.me')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                >
                  {config.boton.texto}
                </Link>
              </BotonCotizar>
            </div>
          </Aparece>
        </div>
      </section>

      {/* Ubicacion */}
      <Ubicacion />

      <section className="w-full bg-grisClaro py-16 sm:py-20">
        <div className="mx-auto w-full max-w-[1800px] px-8 sm:px-6 xl:px-8">
          <div className="grid grid-cols-1 gap-4 sm:gap-8 sm:grid-cols-3">
            {config.puntosDestacados.map((punto, index) => {
              const Icono = punto.icono
              const esOscuro = index % 2 === 0
              return (
                <div
                  key={punto.titulo}
                  className={`flex flex-col items-center gap-2 sm:gap-4 border-[4px] sm:border-[6px] px-4 py-6 sm:px-6 sm:py-12 text-center shadow-[6px_6px_0_0_rgba(0,0,0,0.95)] sm:shadow-[10px_10px_0_0_rgba(0,0,0,0.95)] ${
                    esOscuro
                      ? 'border-blanco bg-grisCon text-blanco'
                      : 'border-grisCon bg-lima text-grisCon'
                  }`}
                >
                  <Icono className="h-8 w-8 sm:h-14 sm:w-14" aria-hidden="true" />
                  <h3 className="font-titulo text-[18px] sm:text-[24px]">{punto.titulo}</h3>
                  <p className="font-texto text-[13px] sm:text-[16px]">{punto.texto}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Productos de la linea */}
      <section
        id="productos"
        className="relative mt-0 sm:-mt-[64px] w-full bg-grisCon py-24 sm:py-32 sm:[clip-path:polygon(0_64px,100%_0,100%_100%,0_100%)]"
      >
        <div className="mx-auto w-full max-w-[1800px] px-10 sm:px-6 xl:px-8">
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
                  className="flex w-[85%] mx-auto sm:w-full flex-col border-[4px] sm:border-[6px] border-lima bg-blanco"
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
                      className="group flex w-[85%] mx-auto sm:w-full flex-col border-[4px] sm:border-[6px] border-lima bg-blanco"
                    >
                      <div className="relative h-[150px] sm:h-[300px] w-full">
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
                      <div className="flex min-h-[90px] sm:min-h-[140px] flex-col gap-1 p-3 sm:p-4 justify-center">
                        <h3 className="font-titulo text-[16px] sm:text-[20px] leading-[1.3] text-grisCon">
                          {category.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-1 font-texto text-[13px] sm:text-[18px] font-semibold uppercase tracking-[0.05em] text-grisCon">
                          <span>Ver más</span>
                          <ArrowRight className="h-3.5 w-3.5 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </div>
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
                  <div className="group relative flex w-[85%] mx-auto sm:w-full flex-col border-[4px] sm:border-[6px] border-lima bg-blanco shadow-[6px_6px_0_0_rgba(0,0,0,0.95)] sm:shadow-[10px_10px_0_0_rgba(0,0,0,0.95)]">
                    <div className="relative h-[110px] sm:h-[380px] w-full overflow-hidden">
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
                    <div className="flex min-h-[70px] sm:min-h-[88px] flex-col gap-1 p-3 sm:p-4 justify-center">
                      <h3 className="font-titulo text-[16px] sm:text-[20px] leading-[1.3] text-grisCon">
                        {product.name}
                      </h3>
                    </div>
                  </div>
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