import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LineaNegocio } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Aparece } from '@/components/animations/aparece'
import { BotonCotizar } from '@/components/boton-cotizar'
import { Ubicacion } from '@/components/ubicacion'

interface ConfigLinea {
  linea: LineaNegocio
  nombre: string
  titulo: string
  textos: [string, string, string]
  boton: { texto: string; href: string }
}

// Configuracion por linea de negocio: parametro de ruta -> enum de Prisma.
const LINEAS: Record<string, ConfigLinea> = {
  concreto: {
    linea: LineaNegocio.CONCRETO,
    nombre: 'Concreto',
    titulo: '[Titulo de la linea de concreto]',
    textos: [
      '[Linea 1 de texto de concreto]',
      '[Linea 2 de texto de concreto]',
      '[Linea 3 de texto de concreto]',
    ],
    boton: { texto: 'Cotizar', href: '/cotizacion?linea=CONCRETO' },
  },
  agregados: {
    linea: LineaNegocio.AGREGADOS,
    nombre: 'Agregados',
    titulo: '[Titulo de la linea de agregados]',
    textos: [
      '[Linea 1 de texto de agregados]',
      '[Linea 2 de texto de agregados]',
      '[Linea 3 de texto de agregados]',
    ],
    boton: { texto: 'Cotizar', href: '/cotizacion?linea=AGREGADOS' },
  },
  constructora: {
    linea: LineaNegocio.CONSTRUCTORA,
    nombre: 'Constructora',
    titulo: '[Titulo de la constructora]',
    textos: [
      '[Linea 1 de texto de la constructora]',
      '[Linea 2 de texto de la constructora]',
      '[Linea 3 de texto de la constructora]',
    ],
    boton: { texto: 'Contactar', href: '/contacto' },
  },
  prefabricados: {
    linea: LineaNegocio.PREFABRICADOS,
    nombre: 'Prefabricados',
    titulo: '[Titulo de la linea de prefabricados]',
    textos: [
      '[Linea 1 de texto de prefabricados]',
      '[Linea 2 de texto de prefabricados]',
      '[Linea 3 de texto de prefabricados]',
    ],
    boton: { texto: 'Cotizar', href: '/cotizacion?linea=PREFABRICADOS' },
  },
}

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

  const products = await prisma.product.findMany({
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
        className="relative h-[520px] w-full bg-grisCon bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-image.jpg')" }}
      >
        {/* Overlay para legibilidad del texto */}
        <div className="absolute inset-0 bg-grisCon/60" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1200px] items-center px-4 sm:px-6 xl:px-0">
          <Aparece direccion="izquierda" distancia={40} duracion={0.6}>
            <div className="flex flex-col items-start gap-4">
              <h1 className="font-titulo text-[32px] leading-[1.1] uppercase text-blanco sm:text-titulo">
                {config.titulo}
              </h1>
              <div className="flex flex-col gap-1">
                <p className="font-texto text-[18px] leading-[1.6] text-blanco">
                  {config.textos[0]}
                </p>
                <p className="font-texto text-[18px] leading-[1.6] text-blanco">
                  {config.textos[1]}
                </p>
                <p className="font-texto text-[18px] leading-[1.6] text-blanco">
                  {config.textos[2]}
                </p>
              </div>
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
      <section id="productos" className="relative w-full bg-blanco py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0">
          <Aparece direccion="arriba" distancia={40} duracion={0.6}>
            <h2 className="font-titulo text-[40px] leading-[1.1] text-grisCon">
              Nuestros productos en {config.nombre}
            </h2>
            <div aria-hidden="true" className="mt-4 h-1 w-20 bg-lima" />
          </Aparece>
          {products.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                    className="flex flex-col border-2 border-grisCon bg-blanco"
                  >
                    <div className="relative h-[216px] w-full">
                      <Image
                        src={product.images[0] || '/placeholder-producto.jpg'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 384px"
                        alt={product.name}
                      />
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
            <p className="mt-8 font-texto text-[16px] text-grisCon">
              {'[Proximamente productos en esta linea]'}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
