'use client'

import Image from 'next/image'
import { useState } from 'react'
// Removed withBasePath import - using direct paths for Vercel

// Metadata se moverá a un archivo layout.tsx específico para esta ruta

export default function ProyectosPage() {
  // Estado para la categoría seleccionada
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  
  // Lista de proyectos de ejemplo
  const proyectos = [
    {
      id: 1,
      titulo: "Torre Residencial Altavista",
      descripcion: "Edificio residencial de 25 pisos con 120 apartamentos de lujo en el norte de Bogotá. Concrecol suministró más de 5,000 m³ de concreto de alta resistencia para su estructura.",
      ubicacion: "Bogotá, Colombia",
      año: 2024,
      categorias: ["Residencial", "Edificios Altos"],
      imagen: "/projects/house.JPG",
    },
    {
      id: 2,
      titulo: "Puente Vial Río Grande",
      descripcion: "Puente de 450 metros de longitud que conecta dos importantes municipios. Se utilizó concreto especializado para resistir condiciones climáticas extremas y alta carga vehicular.",
      ubicacion: "Antioquia, Colombia",
      año: 2023,
      categorias: ["Infraestructura", "Puentes"],
      imagen: "/projects/placa-huella.JPG",
    },
    {
      id: 3,
      titulo: "Centro Comercial Horizonte",
      descripcion: "Centro comercial de 85,000 m² con más de 200 locales comerciales, cines y zona de restaurantes. Concrecol proveyó concreto para pisos de alto tráfico y elementos estructurales.",
      ubicacion: "Cali, Colombia",
      año: 2023,
      categorias: ["Comercial", "Centro Comercial"],
      imagen: "/projects/water-tank.JPG",
    },
    {
      id: 4,
      titulo: "Hospital Regional Santa Clara",
      descripcion: "Moderno hospital con 180 habitaciones y 12 quirófanos. Se utilizó concreto especializado para áreas críticas como quirófanos y zonas de radiología.",
      ubicacion: "Medellín, Colombia",
      año: 2022,
      categorias: ["Salud", "Hospital"],
      imagen: "/projects/house.JPG",
    },
    {
      id: 5,
      titulo: "Complejo Deportivo Olímpico",
      descripcion: "Complejo deportivo con estadio, piscinas olímpicas y gimnasios. Concrecol suministró concreto para gradas, piscinas y áreas exteriores de alta durabilidad.",
      ubicacion: "Barranquilla, Colombia",
      año: 2022,
      categorias: ["Deportivo", "Estadio"],
      imagen: "/projects/water-tank.JPG",
    },
    {
      id: 6,
      titulo: "Proyecto Hidroeléctrico El Cañón",
      descripcion: "Central hidroeléctrica con capacidad de 120MW. Se utilizó concreto de alta densidad y resistencia para las estructuras de contención y la presa.",
      ubicacion: "Santander, Colombia",
      año: 2021,
      categorias: ["Energía", "Hidroeléctrica"],
      imagen: "/projects/placa-huella.JPG",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Nuestros Proyectos
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
          Descubre cómo nuestros productos han contribuido a la construcción de importantes obras en todo el país.
        </p>
      </div>

      {/* Filtros funcionales */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        <button 
          onClick={() => setCategoriaSeleccionada(null)} 
          className={`px-4 py-2 font-medium rounded-full transition-colors ${
            categoriaSeleccionada === null 
              ? 'bg-[#C4D600] text-[#4D4D4D]' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos
        </button>
        <button 
          onClick={() => setCategoriaSeleccionada('Residencial')} 
          className={`px-4 py-2 font-medium rounded-full transition-colors ${
            categoriaSeleccionada === 'Residencial' 
              ? 'bg-[#C4D600] text-[#4D4D4D]' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Residencial
        </button>
        <button 
          onClick={() => setCategoriaSeleccionada('Comercial')} 
          className={`px-4 py-2 font-medium rounded-full transition-colors ${
            categoriaSeleccionada === 'Comercial' 
              ? 'bg-[#C4D600] text-[#4D4D4D]' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Comercial
        </button>
        <button 
          onClick={() => setCategoriaSeleccionada('Infraestructura')} 
          className={`px-4 py-2 font-medium rounded-full transition-colors ${
            categoriaSeleccionada === 'Infraestructura' 
              ? 'bg-[#C4D600] text-[#4D4D4D]' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Infraestructura
        </button>
        <button 
          onClick={() => setCategoriaSeleccionada('Salud')} 
          className={`px-4 py-2 font-medium rounded-full transition-colors ${
            categoriaSeleccionada === 'Salud' 
              ? 'bg-[#C4D600] text-[#4D4D4D]' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Salud
        </button>
      </div>

      {/* Listado de Proyectos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {proyectos
          .filter(proyecto => 
            categoriaSeleccionada === null || 
            proyecto.categorias.includes(categoriaSeleccionada)
          )
          .map((proyecto) => (
          <div key={proyecto.id} className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-100">
            <div className="relative h-56 overflow-hidden">
              <img 
                src={proyecto.imagen} 
                alt={proyecto.titulo}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {proyecto.categorias.map((categoria, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                    {categoria}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{proyecto.titulo}</h3>
              <p className="text-gray-600 mb-4">{proyecto.descripcion}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>📍 {proyecto.ubicacion}</span>
                <span>📅 {proyecto.año}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 bg-gray-50 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Tienes un proyecto en mente?</h2>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Nuestro equipo de expertos está listo para asesorarte y proporcionarte los materiales de la más alta calidad para tu próximo proyecto.
        </p>
        <a href="/contacto" className="inline-block px-6 py-3 bg-[#C4D600] text-[#4D4D4D] font-medium rounded-lg hover:bg-[#C4D600]/90 transition-colors">
          Contacta con nosotros
        </a>
      </div>
    </div>
  )
}
