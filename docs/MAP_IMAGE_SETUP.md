# Imagen del Mapa de Ubicación

Para que el mapa estático funcione correctamente, debes agregar una imagen llamada `location-map.jpg` en la carpeta `/public/images/`.

## Especificaciones de la imagen:
- Nombre: `location-map.jpg`
- Ruta: `/public/images/location-map.jpg`
- Dimensiones recomendadas: 800x500 píxeles
- La imagen debe ser una captura de pantalla de Google Maps mostrando la ubicación de Concrecol
- Coordenadas: 6.457055421341731, -73.13670084024134

## Cómo crear la imagen:
1. Visita Google Maps en tu navegador
2. Busca las coordenadas 6.457055421341731, -73.13670084024134 (o "Carrera 10 #9-40, San Gil, Santander")
3. Ajusta el zoom para que se vea bien la ubicación
4. Toma una captura de pantalla
5. Recorta la imagen a 800x500 píxeles aproximadamente
6. Guárdala como JPEG con el nombre "location-map.jpg"
7. Colócala en la carpeta `/public/images/`

## Ejemplo de código para generar la imagen (no usar directamente):
```
https://maps.googleapis.com/maps/api/staticmap?center=6.457055421341731,-73.13670084024134&zoom=15&size=800x500&markers=color:red|6.457055421341731,-73.13670084024134&key=YOUR_API_KEY
```

Si necesitas actualizar la ubicación en el futuro, simplemente reemplaza la imagen en la misma ruta.