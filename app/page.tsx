import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, BuildingIcon, Users, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { CategoryWithImage } from '@/types'
import { Reveal } from '@/components/animations/reveal'
import { withBasePath } from '@/lib/basePath'

// Función para obtener las categorías activas con una imagen por defecto
async function getActiveCategories(): Promise<CategoryWithImage[]> {
  const categories = await prisma.sqlCategory.findMany({
    where: {
      is_active: true
    },
    orderBy: {
      name: 'asc'
    },
    take: 6 // Limitamos a 6 categorías
  });
  
  // Asignamos imágenes predeterminadas o personalizadas según el slug
  return categories.map(category => {
    // Intentamos encontrar una imagen personalizada basada en el slug
    const imageUrl = `/categories/${category.slug}.jpg`;
    
    // Como fallback usamos una imagen genérica
    const fallbackImage = '/categories/default-category.jpg';
    
    // Descripción genérica basada en el nombre
    const description = `Explora nuestra selección de productos de ${category.name.toLowerCase()} de alta calidad.`;
    
    return {
      ...category,
      imageUrl,
      description
    };
  });
}

export default async function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section con video de fondo y efecto parallax */}
      <div className="fixed inset-0 w-full h-screen z-[-1] bg-black">
        <a 
          href="https://youtu.be/M194g0_SACE" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute inset-0 w-full h-full cursor-pointer"
          aria-label="Ver video completo en YouTube"
        >
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            src={withBasePath('/hero-video.mp4')}
            autoPlay
            loop
            muted
            playsInline
          />
        </a>
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      {/* Hero Content Section */}
      <div className="relative isolate h-screen flex items-center justify-center z-10" id="hero-section">
        <div className="flex flex-col items-center justify-center w-full h-full">
          <img
            src={withBasePath('/logo-hero.png')}
            alt="Logo Concrecol"
            className="w-96 h-96 md:w-[32rem] md:h-[32rem] mb-2 drop-shadow-xl"
            style={{ objectFit: 'contain' }}
          />
          <h1 className="text-white text-3xl sm:text-5xl font-extrabold text-center px-4 leading-tight uppercase tracking-wider"
              style={{
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 8px rgba(0, 0, 0, 0.2)',
                WebkitTextStroke: '1px rgba(255, 255, 255, 0.15)',
                letterSpacing: '0.05em'
              }}>
            CONSTRUIMOS CONFIANZA, ENTREGAMOS <span className="text-[#C4D600]">CONCRETO</span>.
          </h1>
        </div>
      </div>

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
                    Con más de 15 años de experiencia en la industria, nos hemos consolidado como líderes en la producción y distribución de concreto y materiales para la construcción, comprometidos con la calidad y la excelencia.
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
                    src={withBasePath('/about-image.jpg')}
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
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {(await getActiveCategories()).map((category, index) => (
              <Reveal key={category.id} direction="up" delay={0.1 * index} className="w-full">
                <Link
                  href={`/productos?categoria=${category.slug}`}
                  className="flex flex-col items-start justify-between group"
                >
                  <div className="relative w-full">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2] group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                  <div className="max-w-xl mt-4">
                    <div className="relative">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900 group-hover:text-[#C4D600]">
                        {category.name}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
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
                    src={withBasePath(project.imageUrl)} 
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
    imageUrl: '/projects/water-tank.jpg',
  },
  {
    name: 'Placa huella veredal',
    description: 'Construcción de placa huella veredal de 250 metros de longitud con estructura de concreto.',
    location: 'Valle de San José, Santander',
    imageUrl: '/projects/placa-huella.jpg',
  },
  {
    name: 'Casa residencial de tres pisos',
    description: 'Construcción de una casa residencial de tres pisos con concreto acelerado.',
    location: 'San Gil, Santander',
    imageUrl: '/projects/house.jpg',
  },
]
