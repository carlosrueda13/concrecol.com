import { Aparece } from '@/components/animations/aparece'
import { BotonCotizar } from '@/components/boton-cotizar'
import { MapPin } from 'lucide-react'

export function Ubicacion() {
  return (
    <>
      {/* Ubicacion */}
      <section id="ubicacion" className="relative w-full scroll-mt-14 bg-blanco py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0">
          <Aparece direccion="izquierda" distancia={40} duracion={0.6}>
            <h2 className="font-titulo text-[40px] text-grisCon">Ubicación</h2>
            <div aria-hidden="true" className="w-20 h-1 bg-lima mt-4" />
          </Aparece>
          <div className="mt-8 flex flex-col gap-6 xl:flex-row">
            {/* Mapa: contenedor vacio con borde visible, sin imagen ni servicio de mapas */}
            <div
              role="img"
              aria-label="Mapa de ubicación de Concrecol"
              className="h-[520px] w-full border-2 border-grisCon bg-grisClaro xl:w-[750px]"
            />
            {/* Panel de ubicacion */}
            <div className="flex w-full flex-col justify-center gap-6 xl:h-[520px] xl:w-[426px]">
              <address className="font-texto text-[20px] not-italic text-grisCon">
                KM 8 Via San gil - Socorro, Santander, Colombia
              </address>
              <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-lima animate-pulse" aria-hidden="true" />
                <p className="font-titulo text-[24px] text-lima">
                  ¿Dónde nos necesitas?
                </p>
              </div>
              <BotonCotizar type="button" variant="contorno" className="h-[48px] w-fit px-6">
                [Texto del botón]
              </BotonCotizar>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
