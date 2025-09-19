// lib/basePath.js

/**
 * Obtiene el prefijo de ruta base para entornos de GitHub Pages
 */
export function getBasePath() {
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}

/**
 * Añade el prefijo de ruta base a una URL
 * @param {string} url La URL a la que añadir el prefijo
 * @returns {string} URL con prefijo
 */
export function withBasePath(url) {
  const basePath = getBasePath();
  
  // Si la URL ya comienza con el prefijo o es una URL externa, devuélvela como está
  if (url.startsWith('http') || url.startsWith(basePath)) {
    return url;
  }
  
  // Asegúrate de que no haya dobles slashes
  const basePathWithoutTrailingSlash = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const urlWithoutLeadingSlash = url.startsWith('/') ? url.slice(1) : url;
  
  return `${basePathWithoutTrailingSlash}/${urlWithoutLeadingSlash}`;
}