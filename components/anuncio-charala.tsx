import { Aparece } from '@/components/animations/aparece'

export function AnuncioCharala() {
  return (
    <div className="flex h-[64px] sm:h-[88px] w-full items-center overflow-hidden whitespace-nowrap">
      <div className="marquesina-track">
        <span className="mr-12 font-titulo text-[32px] sm:text-[42px] text-lima uppercase tracking-[0.05em]">
          ¡Buenas noticias Charalá! Concrecol llega con todo
        </span>
        <span
          className="mr-12 font-titulo text-[32px] sm:text-[42px] text-lima uppercase tracking-[0.05em]"
          aria-hidden="true"
        >
          ¡Buenas noticias Charalá! Concrecol llega con todo
        </span>
      </div>
    </div>
  )
}