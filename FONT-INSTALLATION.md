# Instrucciones para instalar la fuente Sukhumvit Set

Para que la fuente Sukhumvit Set funcione correctamente en el proyecto, necesitas descargar los archivos de la fuente y colocarlos en la carpeta correcta.

## Pasos para instalar la fuente

1. Descarga los archivos de la fuente Sukhumvit Set en formato TTF:
   - SukhumvitSet-Text.ttf (peso 400/normal)
   - SukhumvitSet-Medium.ttf (peso 500/medio)
   - SukhumvitSet-Bold.ttf (peso 700/negrita)

2. Coloca estos archivos en la carpeta: `/public/fonts/`

4. Una vez que hayas colocado los archivos en la carpeta correcta, reinicia el servidor de desarrollo.

## Fuentes alternativas

Si no puedes obtener la fuente Sukhumvit Set, puedes usar una fuente similar de Google Fonts modificando el archivo `app/fonts.ts`:

```typescript
import { Inter } from 'next/font/google'

export const sukhumvitSet = Inter({ 
  subsets: ['latin'],
  variable: '--font-sukhumvit-set',
  display: 'swap',
})
```

## Notas adicionales

- La fuente Sukhumvit Set es una fuente tailandesa que también tiene buen soporte para caracteres latinos.
- Si tienes problemas con la visualización de la fuente, asegúrate de que los archivos WOFF2 estén correctamente formateados y contengan todos los caracteres necesarios.