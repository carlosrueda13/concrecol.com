'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'
import { deleteCategory } from '@/app/actions/category'
import { useToast } from '@/components/ui/use-toast'

interface DeleteCategoryButtonProps {
  categoryId: string
  categoryName: string
  productCount: number
}

export function DeleteCategoryButton({ categoryId, categoryName, productCount }: DeleteCategoryButtonProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteCategory(categoryId)
      
      if (result.success) {
        toast({
          title: 'Categoría eliminada',
          description: 'La categoría y sus productos asociados han sido eliminados correctamente.',
        })
        setOpen(false)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al eliminar la categoría',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription className="pt-4">
              ¿Estás seguro de que deseas eliminar la categoría <strong>{categoryName}</strong>?
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-destructive/10 border border-destructive rounded-md p-4 mt-2">
            <h4 className="font-semibold text-destructive mb-2">¡Advertencia!</h4>
            <p className="text-sm">
              Esta acción eliminará también <strong>{productCount} producto{productCount !== 1 ? 's' : ''}</strong> asociado{productCount !== 1 ? 's' : ''} a esta categoría.
            </p>
            <p className="text-sm mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar categoría'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}