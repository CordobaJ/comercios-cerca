'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'


export default function Home() {
  const [comercios, setComercios] = useState([])
  const [ciudad, setCiudad] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const router = useRouter()

  const categorias = ['Todos', 'Restaurante', 'Tienda', 'Servicios', 'Salud']

  useEffect(() => {
    fetchComercios()
  }, [ciudad, categoria])

  async function fetchComercios() {
    let query = supabase
      .from('comercios')
      .select('*')
      .eq('plan_activo', true)

    if (ciudad) query = query.ilike('ciudad', `%${ciudad}%`)
    if (categoria !== 'Todos') query = query.eq('categoria', categoria)

    const { data, error } = await query
    if (!error) setComercios(data)
  }

  const comerciosFiltrados = comercios.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <span className="text-green-700 font-medium text-lg">Comercios cerca</span>
        <button className="bg-green-600 text-white px-4 py-2 rounded-full text-sm">
          Registra tu negocio
        </button>
      </nav>

      {/* Hero */}
      <div className="bg-green-600 px-8 py-8">
        <p className="text-white text-xl font-medium mb-4">Descubre comercios abiertos ahora</p>
        <input
          type="text"
          placeholder="¿En qué ciudad estás?"
          value={ciudad}
          onChange={e => setCiudad(e.target.value)}
          className="w-full max-w-sm px-4 py-2 rounded-lg text-sm outline-none"
        />
      </div>

      {/* Filtros */}
      <div className="bg-white px-8 py-3 flex gap-2 border-b overflow-x-auto">
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              categoria === cat
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
        <input
          type="text"
          placeholder="Buscar comercio..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="ml-auto border px-3 py-1 rounded-full text-sm outline-none"
        />
      </div>

      {/* Lista de comercios */}
      <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comerciosFiltrados.length === 0 ? (
          <p className="text-gray-500 col-span-3 text-center py-12">
            No hay comercios disponibles en esta ciudad aún.
          </p>
        ) : (
          comerciosFiltrados.map(comercio => (
            <div key={comercio.id} onClick={() => router.push(`/comercio/${comercio.id}`)} className="bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-content-center">
                  <span className="text-green-700 font-bold text-lg pl-3">
                    {comercio.nombre[0]}
                  </span>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  comercio.esta_abierto
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {comercio.esta_abierto ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
              <h3 className="font-medium text-gray-900">{comercio.nombre}</h3>
              <p className="text-sm text-gray-500">{comercio.categoria} · {comercio.ciudad}</p>
              <p className="text-xs text-gray-400 mt-1">{comercio.direccion}</p>
            </div>
          ))
        )}
      </div>
    </main>
  )
}