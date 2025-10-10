import Image from 'next/image'

export const metadata = {
  title: 'Sobre Nosotros - Concrecol',
  description: 'Conozca más sobre Concrecol, nuestra historia, misión y visión. Comprometidos con la calidad en materiales de construcción.',
}

export default function SobreNosotrosPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Sobre Nosotros
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
          Concrecol es una empresa líder en la producción y distribución de concreto y materiales de construcción en Colombia.
        </p>
      </div>

      {/* Historia y Valores */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Nuestra Historia
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Concrecol nace del trabajo y la experiencia de un grupo empresarial con más de 17 años dedicados a la construcción de vías, instituciones y proyectos de infraestructura al servicio de la región, en alianza con entidades públicas y privadas.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            Nuestro crecimiento ha estado marcado por la pasión por construir y la búsqueda constante de innovación. Esa visión nos llevó a ampliar nuestras operaciones con una planta de agregados y nuestra propia concretera, que hoy se convierte en la base de nuestra expansión.
          </p>
          <p className="text-lg text-gray-600">
            Seguimos siendo constructores, pero ahora con la capacidad de ofrecer soluciones integrales: desde los materiales hasta la ejecución de la obra. Concrecol es historia, presente y futuro al servicio del desarrollo y la confianza de nuestros clientes.
          </p>
        </div>
        <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
          <img 
            src="/imagen-planta.jpg" 
            alt="Planta de Concrecol" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Misión y Visión */}
      <div className="bg-gray-50 py-12 px-6 rounded-lg mb-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-[#C4D600]">
            <div className="w-16 h-16 bg-[#C4D600]/20 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#4D4D4D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h3>
            <p className="text-gray-600">
              Suministrar soluciones innovadoras en concreto y materiales de construcción que excedan las expectativas de nuestros clientes, a través de productos de alta calidad, servicio excepcional y prácticas sostenibles, contribuyendo al desarrollo de la infraestructura del país.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-[#C4D600]">
            <div className="w-16 h-16 bg-[#C4D600]/20 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#4D4D4D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Visión</h3>
            <p className="text-gray-600">
              Ser reconocidos como el líder indiscutible en la industria del concreto y materiales de construcción en Colombia para el año 2030, distinguiéndonos por nuestra innovación, calidad superior, responsabilidad ambiental y excelencia operativa, siendo la primera opción para clientes, colaboradores y socios estratégicos.
            </p>
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Nuestros Valores
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-[#C4D600]/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#C4D600]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Integridad</h3>
            <p className="text-gray-600">
              Actuamos con honestidad, transparencia y ética en todas nuestras operaciones y relaciones comerciales.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-[#C4D600]/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#C4D600]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Excelencia</h3>
            <p className="text-gray-600">
              Nos esforzamos constantemente por superar expectativas en calidad, servicio y eficiencia operativa.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-[#C4D600]/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#C4D600]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Innovación</h3>
            <p className="text-gray-600">
              Buscamos continuamente nuevas formas de mejorar nuestros productos, servicios y procesos para mantenernos a la vanguardia.
            </p>
          </div>
        </div>
      </div>

      {/* Equipo */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Nuestro Equipo Directivo
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="text-center">
              <div className="mx-auto w-32 h-32 bg-gray-300 rounded-full mb-4 flex items-center justify-center text-gray-500">
                Foto
              </div>
              <h3 className="text-xl font-bold text-gray-900">Nombre Ejecutivo</h3>
              <p className="text-[#C4D600] font-medium">Cargo</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
