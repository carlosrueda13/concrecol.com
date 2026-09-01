import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { BotonCotizar } from '@/components/boton-cotizar'
import { Aparece } from '@/components/animations/aparece'

interface ProductsPageProps {
  searchParams?: {
    categoria?: string
    q?: string
  }
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const where = {
    is_active: true,
    ...(searchParams?.categoria
      ? {
          sqlCategory: {
            slug: searchParams.categoria,
          },
        }
      : {}),
    ...(searchParams?.q
      ? {
          OR: [
            { name: { contains: searchParams.q } },
            { sqlCategory: { name: { contains: searchParams.q } } },
          ],
        }
      : {}),
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      sqlCategory: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="w-full bg-blanco">
      {/* Encabezado */}
      <section className="w-full py-16 sm:py-20">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0">
          <Aparece direccion="arriba" distancia={40} duracion={0.6}>
            <h1 className="font-titulo text-[40px] leading-[1.1] text-grisCon">
              Catálogo de Productos
            </h1>
          </Aparece>
          <Aparece direccion="arriba" distancia={40} duracion={0.6}>
            <p className="mt-4 font-texto text-[18px] leading-[1.6] text-grisCon">
              Explora nuestra selección de productos para construcción
            </p>
          </Aparece>
        </div>
      </section>

      {/* Listado vertical */}
      <section className="w-full pb-24">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 sm:px-6 xl:px-0">
          {products.map((product, index) => {
            const imageRight = index % 2 === 0
            const name = product.name || '[Nombre pendiente]'
            const description =
              product.description && product.description.trim().length > 0
                ? product.description
                : '[Descripción pendiente]'

            const claseBloque = `flex w-full flex-col xl:h-[260px] xl:flex-row xl:items-stretch xl:gap-6 ${
              imageRight ? 'xl:flex-row-reverse' : ''
            }`
            const direccion = imageRight ? 'derecha' : 'izquierda'

            const contenido = (
              <>
                <div className="relative h-[220px] w-full flex-none xl:h-[260px] xl:w-[600px]">
                  <Image
                    src="/placeholder-producto.jpg"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1279px) 100vw, 600px"
                    alt={name}
                  />
                </div>
                <div className="flex w-full flex-col justify-center px-1 py-6 xl:w-[576px] xl:px-2">
                  <h2 className="font-titulo text-[28px] leading-[1.1] text-grisCon">
                    {name}
                  </h2>
                  <p className="mt-3 line-clamp-3 font-texto text-[16px] leading-[1.6] text-grisCon">
                    {description}
                  </p>
                  <BotonCotizar
                    asChild
                    variant="primaria"
                    className="mt-6 h-[44px] w-[160px]"
                  >
                    <Link href={`/productos/${product.slug}`}>Ver ficha</Link>
                  </BotonCotizar>
                </div>
              </>
            )

            return (
              <Aparece
                key={product.id}
                direccion={direccion}
                distancia={40}
                duracion={0.6}
              >
                <div className={claseBloque}>{contenido}</div>
              </Aparece>
            )
          })}

          {products.length === 0 && (
            <p className="py-12 text-center font-texto text-[16px] text-grisCon">
              [Sin productos disponibles]
            </p>
          )}
        </div>
      </section>

      {/* Cierre */}
      <section className="w-full py-8">
        <div className="mx-auto flex h-[120px] w-full max-w-[1280px] flex-wrap items-center justify-center gap-6 bg-lima px-4 sm:px-6">
          <h2 className="font-titulo text-[24px] leading-[1.1] text-grisCon">
            [Título de cierre]
          </h2>
          <BotonCotizar
            asChild
            variant="secundaria"
            className="h-[52px] w-[200px]"
          >
            <Link href="/cotizacion">Cotizar</Link>
          </BotonCotizar>
        </div>
      </section>
    </div>
  )
}
