import Image from 'next/image'
import Link from 'next/link'
import { Aparece } from '@/components/animations/aparece'
import { BotonCotizar } from '@/components/boton-cotizar'

// Datos estaticos de los proyectos de la constructora (marcador, sin base de datos)
const proyectos = [
  {
    id: 1,
    nombre: '[Proyecto 1]',
    linea1: '[Linea descriptiva pendiente]',
    linea2: '[Linea descriptiva pendiente]',
  },
  {
    id: 2,
    nombre: '[Proyecto 2]',
    linea1: '[Linea descriptiva pendiente]',
    linea2: '[Linea descriptiva pendiente]',
  },
  {
    id: 3,
    nombre: '[Proyecto 3]',
    linea1: '[Linea descriptiva pendiente]',
    linea2: '[Linea descriptiva pendiente]',
  },
  {
    id: 4,
    nombre: '[Proyecto 4]',
    linea1: '[Linea descriptiva pendiente]',
    linea2: '[Linea descriptiva pendiente]',
  },
  {
    id: 5,
    nombre: '[Proyecto 5]',
    linea1: '[Linea descriptiva pendiente]',
    linea2: '[Linea descriptiva pendiente]',
  },
  {
    id: 6,
    nombre: '[Proyecto 6]',
    linea1: '[Linea descriptiva pendiente]',
    linea2: '[Linea descriptiva pendiente]',
  },
]

export default function ConstructoraPage() {
  return (
    <div className="relative">
      {/* Hero: imagen de fondo a sangre, titulo y boton de contacto */}
      <section
        id="hero-section"
        className="relative h-[520px] w-full bg-grisCon bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-image.jpg')" }}
      >
        {/* Overlay para legibilidad del texto */}
        <div className="absolute inset-0 bg-grisCon/60" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1200px] items-center px-4 sm:px-6 xl:px-0">
          <Aparece direccion="izquierda" distancia={40} duracion={0.6}>
            <div className="flex flex-col items-start gap-4">
              <h1 className="font-titulo text-[32px] leading-[1.1] uppercase text-blanco sm:text-titulo">
                [Titulo de la constructora]
              </h1>
              <div className="flex flex-col gap-1">
                <p className="font-texto text-[18px] leading-[1.6] text-blanco">
                  [Linea 1 de texto]
                </p>
                <p className="font-texto text-[18px] leading-[1.6] text-blanco">
                  [Linea 2 de texto]
                </p>
                <p className="font-texto text-[18px] leading-[1.6] text-blanco">
                  [Linea 3 de texto]
                </p>
              </div>
              <BotonCotizar asChild variant="primaria" className="h-[56px] w-[220px]">
                <Link href="/contacto">Contactar</Link>
              </BotonCotizar>
            </div>
          </Aparece>
        </div>
      </section>

      {/* Proyectos */}
      <section id="proyectos" className="relative w-full bg-blanco py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0">
          <Aparece direccion="arriba" distancia={40} duracion={0.6}>
            <h2 className="font-titulo text-[40px] leading-[1.1] text-grisCon">
              Proyectos
            </h2>
            <div aria-hidden="true" className="mt-4 h-1 w-20 bg-lima" />
          </Aparece>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {proyectos.map((proyecto, index) => (
              <Aparece
                key={proyecto.id}
                direccion="arriba"
                distancia={40}
                duracion={0.6}
                retraso={index * 0.1}
              >
                <div
                  className={`flex flex-col border-2 border-grisCon ${
                    index % 2 === 0 ? 'bg-blanco' : 'bg-grisClaro'
                  }`}
                >
                  <div className="relative h-[216px] w-full">
                    <Image
                      src="/placeholder-producto.jpg"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 384px"
                      alt={proyecto.nombre}
                    />
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <h3 className="font-titulo text-[20px] leading-[1.3] text-grisCon">
                      {proyecto.nombre}
                    </h3>
                    <p className="font-texto text-[15px] leading-[1.6] text-grisCon">
                      {proyecto.linea1}
                    </p>
                    <p className="font-texto text-[15px] leading-[1.6] text-grisCon">
                      {proyecto.linea2}
                    </p>
                  </div>
                </div>
              </Aparece>
            ))}
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section id="cierre" className="relative flex h-[120px] w-full items-center bg-grisClaro">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-center gap-3 px-4 sm:gap-6 sm:px-6 xl:px-0">
          <Aparece direccion="arriba" distancia={40} duracion={0.6}>
            <div className="flex flex-col items-center">
              <h2 className="font-titulo text-[24px] leading-[1.1] text-grisCon">
                [Titulo de cierre]
              </h2>
              <div
                aria-hidden="true"
                className="mt-4 h-1 w-20 bg-lima ring-1 ring-inset ring-grisCon"
              />
            </div>
          </Aparece>
          <BotonCotizar asChild variant="secundaria" className="h-[52px] w-[200px]">
            <Link href="/contacto">Contactar</Link>
          </BotonCotizar>
        </div>
      </section>
    </div>
  )
}
