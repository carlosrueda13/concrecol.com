'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { SafeImage } from '@/components/ui/safe-image'
import { Loader2, UploadCloud, X } from 'lucide-react'

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({ 
  value = [], 
  onChange, 
  maxImages = 5,
  disabled = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return
    
    // Check if we would exceed max images
    if (value.length + acceptedFiles.length > maxImages) {
      toast({
        title: "Límite excedido",
        description: `Solo puedes subir un máximo de ${maxImages} imágenes.`,
        variant: "destructive"
      })
      return
    }
    
    setIsUploading(true)
    
    try {
      // Process each file in parallel
      const uploadPromises = acceptedFiles.map(async (file) => {
        // In a real implementation, we would:
        // 1. Create a FormData object
        // 2. Append the file
        // 3. Send to a server endpoint
        
        // For demonstration, we'll create object URLs for now
        // Later this would be replaced with actual API calls
        
        // Simulating an API call
        const objectUrl = URL.createObjectURL(file)
        
        // In a production app, we'd do this instead:
        // const formData = new FormData()
        // formData.append('file', file)
        // const response = await fetch('/api/images/upload', {
        //   method: 'POST',
        //   body: formData
        // })
        // const data = await response.json()
        // return data.url
        
        // Just to simulate a real upload process
        await new Promise(resolve => setTimeout(resolve, 500))
        
        try {
          // Send the URL to our backend (normally we'd upload the file directly)
          const response = await fetch('/api/images/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl: objectUrl })
          })
          
          if (!response.ok) {
            throw new Error('Failed to process image')
          }
          
          // This would be the permanent URL in a real implementation
          return objectUrl
        } catch (error) {
          console.error("API error:", error)
          return objectUrl // Fallback to local object URL for demo
        }
      })
      
      // Wait for all uploads to complete
      const newImageUrls = await Promise.all(uploadPromises)
      
      // Update state with new URLs
      onChange([...value, ...newImageUrls])
      
      toast({
        title: "Imágenes subidas",
        description: `Se han subido ${acceptedFiles.length} imágenes correctamente.`
      })
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        title: "Error al subir",
        description: "Ha ocurrido un error al subir las imágenes.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }, [value, onChange, maxImages, disabled])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    disabled: isUploading || disabled || value.length >= maxImages
  })
  
  const removeImage = (index: number) => {
    if (disabled) return
    const newUrls = [...value]
    newUrls.splice(index, 1)
    onChange(newUrls)
  }
  
  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-md p-6
          transition-colors duration-200 ease-in-out
          flex flex-col items-center justify-center gap-2
          cursor-pointer h-32
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${value.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <UploadCloud className="h-6 w-6 text-gray-400" />
        )}
        <p className="text-sm text-center text-gray-500">
          {isDragActive 
            ? "Suelta los archivos aquí" 
            : value.length >= maxImages
              ? `Límite de ${maxImages} imágenes alcanzado`
              : "Arrastra y suelta imágenes o haz clic para seleccionar"}
        </p>
        <p className="text-xs text-gray-400">
          PNG, JPG, JPEG, WebP (max {maxImages})
        </p>
      </div>
      
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <SafeImage
                src={url}
                alt={`Imagen ${index + 1}`}
                fill
                className="object-cover rounded-md"
                fallbackSrc="/placeholder.jpg"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition h-6 w-6"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
