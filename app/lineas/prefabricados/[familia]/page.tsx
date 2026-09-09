import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Aparece } from '@/components/animations/aparece'
import { Ubicacion } from '@/components/ubicacion'

interface FamiliaPageProps {
  params: {
    familia: string
  }
}

export default async function FamiliaPage({ params }: FamiliaPageProps) {
  const categoria = await prisma.sqlCategory.findUnique({
    where: { slug: params.familia },
  })

  if (!categoria || !categoria.is_active) {
    notFound()
  }

  const products = await prisma.product.findMany({
    where: {
      sqlCategoryId: categoria.id,
      lineaNegocio: 'PREFABRICADOS',
      is_active: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="relative">
      {/* Encabezado de la familia */}
      <section className="relative w-full bg-blanco py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0">
          <Aparece direccion="arriba" distancia={40} duracion={0.6}>
            <h1 className="font-titulo text-[40px] leading-[1.1] text-grisCon">
              {categoria.name}
            </h1>
            <div aria-hidden="true" className="mt-4 h-1 w-20 bg-lima" />
          </Aparece>
          <Link
            href="/lineas/prefabricados"
            className="mt-6 inline-block font-texto text-[16px] text-grisCon underline"
          >
            Volver a Prefabricados
          </Link>
        </div>
      </section>

      {/* Ubicacion */}
      <Ubicacion />

      {/* Productos de la familia */}
      <section id="productos" className="relative w-full bg-blanco py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1800px] px-10 sm:px-6 xl:px-0">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product, index) => (
                <Aparece
                  key={product.id}
                  direccion="arriba"
                  distancia={40}
                  duracion={0.6}
                  retraso={index * 0.1}
                >
                  <div className="group relative flex flex-col border-2 border-grisCon bg-blanco">
                    <div className="relative h-[180px] sm:h-[380px] w-full">
                      <Image
                        src={product.images[0] || '/placeholder-producto.jpg'}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 384px"
                        alt={product.name}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-center bg-grisCon/0 p-4 opacity-0 transition-all duration-300 group-hover:bg-grisCon/95 group-hover:opacity-100">
                        <p className="font-texto text-[17px] leading-[1.6] text-blanco line-clamp-6">
                          {product.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 p-4">
                      <h3 className="font-titulo text-[20px] leading-[1.3] text-grisCon">
                        {product.name}
                      </h3>
                    </div>
                  </div>
                </Aparece>
              ))}
            </div>
          ) : (
            <p className="font-texto text-[16px] text-grisCon">
              {'[Proximamente productos en esta linea]'}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
