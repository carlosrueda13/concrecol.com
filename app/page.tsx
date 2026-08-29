import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Factory, Truck, Award } from 'lucide-react'
import { safeQuery } from '@/lib/db-wrapper'
import { CategoryWithImage } from '@/types'
import { Reveal } from '@/components/animations/reveal'
import { BotonCotizar } from '@/components/boton-cotizar'
// Removed withBasePath import - using direct paths for Vercel

// ✅ Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

// Mapa de imágenes por slug de categoría (mosaico)
const categoryImageMap: Record<string, string> = {
  agregados: '/categorias/agregados.jpg',
  cemento: '/categorias/cemento.jpg',
  concreto: '/categorias/concreto.jpg',
  pinturas: '/categorias/pinturas.jpg',
  preparados: '/categorias/preparados.jpg',
}

function getCategoryImage(slug: string): string {
  return categoryImageMap[slug] ?? '/placeholder.jpg'
}

// Función para obtener las categorías activas con una imagen por defecto
async function getActiveCategories(): Promise<CategoryWithImage[]> {
  try {
    const categories = await safeQuery(async (prisma) => {
      return await prisma.sqlCategory.findMany({
        where: {
          is_active: true
        },
        orderBy: {
          name: 'asc'
        },
        take: 6 // Limitamos a 6 categorías
      });
    });

    // Asignamos imágenes predeterminadas o personalizadas según el slug
    return categories.map(category => {
      // Usamos una imagen placeholder para todas las categorías
      const imageUrl = '/placeholder.jpg';
      
      // Como fallback usamos la misma imagen placeholder
      const fallbackImage = '/placeholder.jpg';
      
      // Descripción genérica basada en el nombre
      const description = `Explora nuestra selección de productos de ${category.name.toLowerCase()} de alta calidad.`;
      
      return {
        ...category,
        imageUrl,
        description
      };
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    
    // Retornar categorías por defecto en caso de error
    return [
      {
        id: '1',
        name: 'Concreto Premezclado',
        slug: 'concreto-premezclado',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: '/placeholder.jpg',
        description: 'Concreto de alta calidad para todo tipo de construcciones'
      },
      {
        id: '2',
        name: 'Materiales de Construcción', 
        slug: 'materiales-construccion',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: '/placeholder.jpg',
        description: 'Amplio catálogo de materiales para construcción'
      },
      {
        id: '3',
        name: 'Servicios Especializados',
        slug: 'servicios-especializados',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: '/placeholder.jpg',
        description: 'Servicios profesionales de construcción'
      }
    ];
  }
}

export default async function HomePage() {
  const categories = await getActiveCategories()
  return (
    <div className="relative">
      {/* Hero Section: imagen de fondo estática, sin video */}
      <section
        id="hero-section"
        className="relative h-[600px] w-full bg-grisCon bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-image.jpg')" }}
      >
        {/* Overlay para legibilidad del texto */}
        <div className="absolute inset-0 bg-grisCon/60" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1200px] items-center px-4 sm:px-6 xl:px-0">
          <div className="flex flex-col items-start gap-6">
            <h1 className="font-titulo text-[32px] leading-[1.1] uppercase text-blanco sm:text-titulo">
              Construimos confianza, entregamos concreto.
            </h1>
            <p className="font-texto text-subtitulo text-blanco">
              [Bajada — texto pendiente]
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <BotonCotizar asChild variant="primaria" className="h-[56px] w-[220px]">
                <Link href="/cotizacion">Cotizar</Link>
              </BotonCotizar>
              <BotonCotizar asChild variant="secundaria" className="h-[56px] w-[220px]">
                <Link href="/productos">Ver productos</Link>
              </BotonCotizar>
            </div>
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section id="ubicacion" className="relative scroll-mt-14 bg-blanco py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0">
          <h2 className="font-titulo text-subtitulo text-grisCon">Ubicación</h2>
          <div className="mt-8 flex flex-col gap-6 xl:flex-row">
            {/* Mapa: contenedor vacío con borde visible, sin imagen ni servicio de mapas */}
            <div
              role="img"
              aria-label="Mapa de ubicación de Concrecol"
              className="h-[420px] w-full border-2 border-grisCon bg-grisClaro xl:w-[750px]"
            />
            {/* Panel de ubicación */}
            <div className="flex w-full flex-col justify-center gap-6 xl:h-[420px] xl:w-[426px]">
              <address className="font-texto text-texto not-italic text-grisCon">
                KM 8 Via San gil - Socorro, Santander, Colombia
              </address>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="ubicacion-campo"
                  className="font-texto text-texto text-grisCon"
                >
                  [Etiqueta del campo]
                </label>
                <input
                  id="ubicacion-campo"
                  type="text"
                  placeholder="[Placeholder]"
                  className="h-[48px] w-full max-w-[380px] border border-grisCon bg-blanco px-3 font-texto text-texto text-grisCon placeholder:text-grisCon/60"
                />
              </div>
              <BotonCotizar type="button" variant="contorno" className="h-[48px] w-fit px-6">
                [Texto del botón]
              </BotonCotizar>
            </div>
          </div>
        </div>
      </section>

      {/* Datos */}
      <section id="datos" className="relative bg-grisClaro py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0">
          <h2 className="font-titulo text-subtitulo text-grisCon">Datos</h2>
          <div className="mt-8 flex flex-col gap-8">
            <div className="flex h-[110px] w-full items-center gap-[21px]">
              <Factory className="h-10 w-10 flex-none text-lima" aria-hidden="true" />
              <p className="font-texto text-tarjeta text-grisCon">
                <span>[Etiqueta 1]</span>{' '}
                <span className="font-titulo">[Dato 1]</span>
              </p>
            </div>
            <div className="flex h-[110px] w-full items-center gap-[21px]">
              <Truck className="h-10 w-10 flex-none text-lima" aria-hidden="true" />
              <p className="font-texto text-tarjeta text-grisCon">
                <span>[Etiqueta 2]</span>{' '}
                <span className="font-titulo">[Dato 2]</span>
              </p>
            </div>
            <div className="flex h-[110px] w-full items-center gap-[21px]">
              <Award className="h-10 w-10 flex-none text-lima" aria-hidden="true" />
              <p className="font-texto text-tarjeta text-grisCon">
                <span>[Etiqueta 3]</span>{' '}
                <span className="font-titulo">[Dato 3]</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Preview Section */}
      <div className="relative bg-white py-24 sm:py-32 z-10" id="about-section">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div>
                <Reveal direction="up">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Sobre Concrecol
                  </h2>
                  <p className="mt-6 text-lg leading-8 text-gray-600">
                    Concrecol es una concretera con más de 17 años de experiencia en ingeniería civil. Seguimos siendo constructores, ahora con planta de concreto y agregados, ofreciendo soluciones completas, calidad garantizada y confianza en cada obra que transformamos juntos.
                  </p>
                </Reveal>
                
                <div className="mt-8 space-y-4">
                  <Reveal direction="left" delay={0.1}>
                    <div className="flex items-center gap-x-3">
                      <CheckCircle className="h-5 w-5 flex-none text-[#C4D600]" />
                      <p className="text-gray-600">Productos certificados bajo estrictos estándares de calidad</p>
                    </div>
                  </Reveal>
                  <Reveal direction="left" delay={0.2}>
                    <div className="flex items-center gap-x-3">
                      <CheckCircle className="h-5 w-5 flex-none text-[#C4D600]" />
                      <p className="text-gray-600">Equipo profesional con amplia experiencia en el sector</p>
                    </div>
                  </Reveal>
                  <Reveal direction="left" delay={0.3}>
                    <div className="flex items-center gap-x-3">
                      <CheckCircle className="h-5 w-5 flex-none text-[#C4D600]" />
                      <p className="text-gray-600">Soluciones a medida para cada proyecto de construcción</p>
                    </div>
                  </Reveal>
                </div>
                
                <Reveal direction="up" delay={0.4}>
                  <div className="mt-10">
                    <Link href="/sobre-nosotros">
                      <Button variant="outline">Conoce nuestra historia</Button>
                    </Link>
                  </div>
                </Reveal>
              </div>
              
              <Reveal direction="right">
                <div className="relative">
                  <img
                    src="/about-image.JPG"
                    alt="Equipo de Concrecol"
                    className="rounded-2xl shadow-xl"
                    width={800}
                    height={600}
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="relative bg-gray-50 py-24 sm:py-32 z-10" id="featured-categories">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal direction="up" className="w-full">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Nuestras Categorías
              </h2>
              <p className="mt-2 text-lg leading-8 text-gray-600">
                Explora nuestra amplia gama de productos para construcción
              </p>
            </div>
          </Reveal>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {categories.map((category, index) => {
              const isLast = index === categories.length - 1
              const isWide = isLast && categories.length === 5
              const spanClass = isWide ? 'lg:col-span-2' : ''
              const aspectClass = isWide ? 'aspect-[4/3] lg:aspect-auto lg:h-full' : 'aspect-[4/3]'
              return (
                <Reveal
                  key={category.id}
                  direction="up"
                  delay={0.1 * index}
                  className={`w-full ${spanClass}${isWide ? ' lg:[&>*]:h-full' : ''}`}
                >
                  <Link
                    href={`/productos?categoria=${category.slug}`}
                    className={`group relative block overflow-hidden rounded-2xl transition-transform duration-300 ease-in-out hover:scale-[1.03] ${aspectClass}`}
                  >
                    <img
                      src={getCategoryImage(category.slug)}
                      alt={category.name}
                      className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-black/50 transition-colors duration-300 group-hover:bg-black/30" />
                    <h3 className="absolute bottom-4 left-4 text-lg font-semibold leading-6 text-white">
                      {category.name}
                    </h3>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      <div className="relative bg-white py-24 sm:py-32 z-10" id="featured-projects">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <Reveal direction="left">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Proyectos Destacados
                </h2>
                <p className="mt-2 text-lg leading-8 text-gray-600">
                  Conoce algunos de nuestros proyectos más importantes
                </p>
              </div>
            </Reveal>
            
            <Reveal direction="right">
              <Link href="/proyectos" className="mt-4 md:mt-0">
                <Button variant="outline" className="flex items-center gap-2">
                  Ver todos los proyectos <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Reveal>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <Reveal key={project.name} direction="up" delay={0.1 * index}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                  <img 
                    src={project.imageUrl} 
                    alt={project.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">{project.name}</h3>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <p className="text-sm text-gray-500">Ubicación: {project.location}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-[#4D4D4D] z-10" id="cta-section">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <Reveal direction="up" className="w-full">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                ¿Listo para comenzar tu proyecto?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                Contáctanos hoy mismo para obtener una cotización personalizada y asesoría profesional para tu proyecto.
              </p>
              
              <Reveal direction="up" delay={0.2} className="w-full">
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link href="/contacto">
                    <Button size="lg" className="bg-[#C4D600] text-[#4D4D4D] hover:bg-[#C4D600]/90">
                      Solicitar Cotización
                    </Button>
                  </Link>
                  <Link
                    href="/productos"
                    className="text-sm font-semibold leading-6 text-white"
                  >
                    Ver Catálogo <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </Reveal>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

// Las categorías ahora se obtienen de la base de datos en tiempo real

const featuredProjects = [
  {
    name: 'Tanque de almacenamiento de agua',
    description: 'Proyecto de construcción de un tanque de almacenamiento de agua de 500 m³ en el Socorro.',
    location: 'Socorro, Santander',
    imageUrl: '/projects/water-tank.JPG',
  },
  {
    name: 'Placa huella veredal',
    description: 'Construcción de placa huella veredal de 250 metros de longitud con estructura de concreto.',
    location: 'Valle de San José, Santander',
    imageUrl: '/projects/placa-huella.JPG',
  },
  {
    name: 'Casa residencial de tres pisos',
    description: 'Construcción de una casa residencial de tres pisos con concreto acelerado.',
    location: 'San Gil, Santander',
    imageUrl: '/projects/house.JPG',
  },
]
