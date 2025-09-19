import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductDetailClient } from '@/components/product-detail-client'
import { ThumbnailGallery } from '@/components/thumbnail-gallery'
import { ProductImage } from '@/components/product-image'

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Images */}
        <ThumbnailGallery 
          images={product.images} 
          productName={product.name} 
        />

        {/* Product Info - using client component for interactive parts */}
        <ProductDetailClient product={product} />
      </div>
    </div>
  )
}
