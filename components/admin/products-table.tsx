'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { type Product } from '@prisma/client'

interface ProductsTableProps {
  products: Product[]
  onUpdateStatus: (productId: string, isActive: boolean) => Promise<void>
  onDelete: (productId: string) => Promise<void>
}

export function ProductsTable({ products, onUpdateStatus, onDelete }: ProductsTableProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleStatusChange = async (productId: string, isActive: boolean) => {
    setIsUpdating(productId)
    try {
      await onUpdateStatus(productId, isActive)
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{formatCurrency(product.price_per_unit)} / {product.unit_measure.toLowerCase()}</TableCell>
              <TableCell>{product.stock_quantity}</TableCell>
              <TableCell>
                <Switch
                  checked={product.is_active}
                  disabled={isUpdating === product.id}
                  onCheckedChange={(checked) => handleStatusChange(product.id, checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/productos/${product.id}`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No hay productos
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
