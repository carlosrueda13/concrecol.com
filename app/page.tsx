import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { Aparece } from '@/components/animations/aparece'
import { BotonCotizar } from '@/components/boton-cotizar'
import { Ubicacion } from '@/components/ubicacion'
// Removed withBasePath import - using direct paths for Vercel

// Forzar renderizado dinamico
export const dynamic = 'force-dynamic'

// Lineas de negocio estaticas (marcador, sin base de datos)
const lineasNegocio = [
  { nombre: 'Concreto', href: '/lineas/concreto', imagen: '/lineas/concreto.jpg' },
  { nombre: 'Agregados', href: '/lineas/agregados', imagen: '/lineas/agregados.jpg' },
  { nombre: 'Constructora', href: '/lineas/constructora', imagen: '/lineas/constructora.jpg' },
  { nombre: 'Prefabricados', href: '/lineas/prefabricados', imagen: '/lineas/prefabricados.jpg' },
]

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section: imagen de fondo con zoom, sin video */}
      <section
        id="hero-section"
        className="relative h-[calc(100vh-112px)] min-h-[600px] w-full overflow-hidden bg-grisCon"
      >
        {/* Capa de imagen de fondo con zoom */}
        <div
          className="absolute inset-0 bg-cover bg-center hero-zoom"
          style={{ backgroundImage: "url('/home-hero.jpg')" }}
          aria-hidden="true"
        />
        {/* Overlay para legibilidad del texto */}
        <div className="absolute inset-0 bg-grisCon/60" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1200px] items-center px-4 sm:px-6 xl:px-0">
          <div className="flex flex-col items-start gap-6">
            <h1 className="font-titulo text-[24px] leading-[1.1] uppercase text-blanco sm:text-titulo">
              Construimos confianza, entregamos concreto.
            </h1>
            <div className="flex flex-col items-start">
            <div className="flex flex-wrap items-center gap-6">
              <BotonCotizar asChild variant="primaria" className="h-[48px] w-full sm:h-[56px] sm:w-[220px]">
                <Link href="/cotizacion">Cotizar</Link>
              </BotonCotizar>
              <BotonCotizar asChild variant="secundaria" className="h-[48px] w-full sm:h-[56px] sm:w-[220px]">
                <Link href="#lineas-de-negocio">Ver Líneas</Link>
              </BotonCotizar>
            </div>
              {/* Scroll indicator */}
              <Link
                href="#ubicacion"
                aria-label="Desplazarse a la sección de ubicación"
                className="mt-10 inline-flex text-blanco"
              >
                <ArrowDown className="scroll-indicator h-12 w-12" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Franja marquesina */}
      <div className="flex h-[72px] w-full items-center overflow-hidden whitespace-nowrap bg-lima">
        <div className="marquesina-track">
          <span className="font-titulo text-[28px] text-grisCon uppercase tracking-[0.05em]">CONCRETO · PREFABRICADOS · CONSTRUCTORA · AGREGADOS · PLANTA SANTANDER · </span>
          <span className="font-titulo text-[28px] text-grisCon uppercase tracking-[0.05em]" aria-hidden="true">CONCRETO · PREFABRICADOS · CONSTRUCTORA · AGREGADOS · PLANTA SANTANDER · </span>
        </div>
      </div>

      <Ubicacion />

      {/* Lineas de negocio */}
      <section
        id="lineas-de-negocio"
        className="relative w-full bg-grisCon py-24 sm:py-32 mt-0 sm:-mt-[64px] sm:[clip-path:polygon(0_64px,100%_0,100%_100%,0_100%)]"
      >
        <div className="mx-auto w-full max-w-[1840px] px-8 sm:px-6 xl:px-8">
          <Aparece direccion="izquierda" distancia={40} duracion={0.6}>
            <h2 className="font-titulo text-[46px] text-blanco">Líneas de negocio</h2>
            <div aria-hidden="true" className="w-20 h-1 bg-lima mt-4" />
          </Aparece>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 xl:mx-auto xl:max-w-[1840px] xl:grid-cols-4">
            {lineasNegocio.map((linea, index) => (
              <Aparece
                key={linea.nombre}
                direccion="arriba"
                distancia={40}
                duracion={0.6}
                retraso={index * 0.15}
              >
                <Link
                  href={linea.href}
                  className="group flex h-[220px] sm:h-[520px] w-full flex-col"
                >
                  <div className="relative h-[325px] w-full overflow-hidden">
                    <Image
                      src={linea.imagen}
                      alt={linea.nombre}
                      width={300}
                      height={325}
                      className="h-[140px] sm:h-[325px] w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center bg-lima">
                    <h3 className="px-5 pb-5 font-titulo text-[28px] text-grisCon">
                      {linea.nombre}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 px-5 font-texto text-[16px] uppercase tracking-[0.05em] text-grisCon/70">
                      <span>Ver más</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              </Aparece>
            ))}
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section id="cierre" className="relative flex w-full items-center bg-blanco py-8">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-center gap-3 px-4 sm:gap-6 sm:px-6 xl:px-0">
          <Aparece direccion="arriba" distancia={40} duracion={0.6}>
            <div className="flex flex-col items-center">
              <h2 className="font-titulo text-[24px] text-grisCon">Construyamos juntos tu próximo proyecto</h2>
              <div aria-hidden="true" className="w-20 h-1 bg-lima mt-4 ring-1 ring-inset ring-grisCon" />
            </div>
          </Aparece>
          <BotonCotizar asChild variant="secundaria" className="h-[52px] w-[200px]">
            <Link href="/cotizacion">Cotizar</Link>
          </BotonCotizar>
        </div>
      </section>
    </div>
  )
}
