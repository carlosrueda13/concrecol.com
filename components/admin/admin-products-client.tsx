'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/components/admin/delete-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteProduct } from '@/app/actions/product'
import { formatCurrency } from '@/lib/utils'

interface AdminProductsClientProps {
  products: Array<{
    id: string
    name: string
    price_per_unit: number
    stock_quantity: number
    is_active: boolean
    sqlCategory: {
      name: string
    }
  }>
}

export function AdminProductsClient({ products }: AdminProductsClientProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.sqlCategory.name}</TableCell>
              <TableCell>
                {formatCurrency(product.price_per_unit)}
              </TableCell>
              <TableCell>{product.stock_quantity}</TableCell>
              <TableCell>
                {product.is_active ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactivo
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/productos/${product.id}/editar`}>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </Link>
                  <DeleteDialog
                    onDelete={async () => {
                      await deleteProduct(product.id)
                      // We'll use router.refresh() in the client component
                      window.location.reload()
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
