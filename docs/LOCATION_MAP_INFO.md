# Mapa de Ubicación Estático

El componente `StaticLocation` muestra un mapa estático de la ubicación de Concrecol usando una imagen predefinida, sin necesidad de API keys de Google Maps. La implementación actual:

1. **Muestra una imagen estática del mapa** con la ubicación de la empresa
2. **Incluye un botón** para abrir la ubicación en Google Maps 
3. **Es completamente responsivo** y se adapta a diferentes tamaños de pantalla

## Imagen del Mapa

El mapa utiliza una imagen estática almacenada en:
- `/public/images/location-map.jpg`

**⚠️ IMPORTANTE:** Esta imagen debe ser creada manualmente y colocada en la ubicación especificada. Ver el archivo `MAP_IMAGE_SETUP.md` para instrucciones detalladas sobre cómo crear esta imagen.

## Modificar la Ubicación

Si necesitas cambiar la ubicación mostrada:

1. **Actualiza las coordenadas** en el componente `StaticLocation` en la página de contacto:
   ```tsx
   <StaticLocation 
     address="Concrecol, Pinchote, Santander" 
     latitude = {6.5254028}
     longitude = {-73.2020077}
   />
   ```

2. **Reemplaza la imagen del mapa** `/public/images/location-map.jpg` con una nueva captura de la ubicación correcta.

## Ventajas de Este Enfoque

- **Sin dependencias externas**: No requiere API keys ni facturación
- **Confiabilidad**: No depende de servicios externos que pueden fallar o cambiar
- **Rendimiento**: Carga más rápido que los mapas interactivos
- **Simplicidad**: Fácil de implementar y mantener

## Opciones Alternativas para el Futuro

Si necesitas una solución más interactiva en el futuro:

1. **Google Maps JavaScript API**: Requiere API key y configurar facturación
2. **Leaflet + OpenStreetMap**: Solución de código abierto sin API key
3. **MapBox**: Ofrece una capa gratuita generosa