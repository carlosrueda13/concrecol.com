import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductDetailClient } from '@/components/product-detail-client'
import { ThumbnailGallery } from '@/components/thumbnail-gallery'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      sqlCategory: true,
    },
  })

  if (!product) {
    notFound()
  }

  const applications = product.applications
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  const hasAdvantages = Boolean(
    product.advantages && product.advantages.trim().length > 0
  )
  const hasSpecifications = Boolean(
    product.specifications && product.specifications.trim().length > 0
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Miga de pan" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/"
              className="transition-colors hover:text-foreground hover:underline"
            >
              Inicio
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted-foreground/60">
            ›
          </li>
          <li>
            <Link
              href="/productos"
              className="transition-colors hover:text-foreground hover:underline"
            >
              Productos
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted-foreground/60">
            ›
          </li>
          <li>
            <Link
              href={`/productos?categoria=${product.sqlCategory.slug}`}
              className="transition-colors hover:text-foreground hover:underline"
            >
              {product.sqlCategory.name}
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted-foreground/60">
            ›
          </li>
          <li aria-current="page" className="font-medium text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Images */}
        <ThumbnailGallery images={product.images} productName={product.name} />

        {/* Product Info */}
        <ProductDetailClient product={product} />
      </div>

      {/* Detailed sections */}
      <div className="mt-10 space-y-10">
        {applications.length > 0 && (
          <section aria-labelledby="aplicaciones">
            <h2
              id="aplicaciones"
              className="mb-3 text-xl font-semibold tracking-tight"
            >
              Aplicaciones
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              {applications.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {hasAdvantages && (
          <section aria-labelledby="ventajas">
            <h2
              id="ventajas"
              className="mb-3 text-xl font-semibold tracking-tight"
            >
              Ventajas
            </h2>
            <p className="whitespace-pre-line text-muted-foreground">
              {product.advantages}
            </p>
          </section>
        )}

        {hasSpecifications && (
          <section aria-labelledby="especificaciones">
            <h2
              id="especificaciones"
              className="mb-3 text-xl font-semibold tracking-tight"
            >
              Especificaciones
            </h2>
            <p className="whitespace-pre-line text-muted-foreground">
              {product.specifications}
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
