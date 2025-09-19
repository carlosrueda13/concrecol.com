'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Copy, Link, Share2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface GeneratePaymentLinkButtonProps {
  orderId: string
}

export function GeneratePaymentLinkButton({ orderId }: GeneratePaymentLinkButtonProps) {
  const [loading, setLoading] = useState(false)
  const [paymentLink, setPaymentLink] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleGeneratePaymentLink = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/payment-link`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Error generating payment link')

      const data = await response.json()
      setPaymentLink(data.paymentLink)
      setIsDialogOpen(true)
      
      toast.success('Link de pago generado correctamente')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al generar el link de pago')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink)
      toast.success('Link copiado al portapapeles')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Error al copiar el link')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Link de Pago - Concrecol',
          text: 'Link para pago de orden en Concrecol',
          url: paymentLink,
        })
        toast.success('Link compartido correctamente')
      } catch (error) {
        console.error('Error compartiendo:', error)
      }
    } else {
      handleCopyToClipboard()
    }
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleGeneratePaymentLink}
        disabled={loading}
      >
        {loading ? 'Generando...' : 'Generar Link de Pago'}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link de Pago Generado</DialogTitle>
            <DialogDescription>
              Comparte este link con el cliente para que pueda realizar el pago de su orden.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-2">
            <div className="grid flex-1 gap-2">
              <Input
                value={paymentLink}
                readOnly
                className="font-mono text-xs"
              />
            </div>
            <Button 
              type="button" 
              size="sm" 
              className="px-3" 
              onClick={handleCopyToClipboard}
            >
              <span className="sr-only">Copiar</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter className="sm:justify-center gap-2 mt-2">
            <Button 
              variant="secondary" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cerrar
            </Button>
            <Button 
              variant="default" 
              onClick={handleShare}
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
              Compartir Link
            </Button>
            <Button 
              variant="outline" 
              asChild
            >
              <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                <Link className="h-4 w-4 mr-1" />
                Abrir Link
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
