'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface PDFViewerProps {
  pdfUrl?: string
  open: boolean
  onClose: () => void
}

export function PDFViewer({ pdfUrl, open, onClose }: PDFViewerProps) {
  const [loading, setLoading] = useState(true)
  const fullUrl = pdfUrl ? `${window.location.origin}${pdfUrl}` : ''
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Vista previa de cotización</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onClose()}>
                Cerrar
              </Button>
              <Button size="sm" asChild>
                <a href={fullUrl} target="_blank" rel="noopener noreferrer" download>
                  Descargar PDF
                </a>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 w-full h-full min-h-[60vh]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {pdfUrl && (
            <iframe 
              src={`${fullUrl}#view=FitH`}
              className="w-full h-full"
              onLoad={() => setLoading(false)}
              title="PDF Viewer"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
