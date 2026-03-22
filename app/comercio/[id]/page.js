'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function PerfilComercio() {
  const { id } = useParams()
  const router = useRouter()
  const [comercio, setComercio] = useState(null)
  const [resenas, setResenas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetchComercio()
    fetchResenas()
  }, [])

  async function fetchComercio() {
    const { data } = await supabase
      .from('comercios')
      .select('*')
      .eq('id', id)
      .single()
    setComercio(data)
    setCargando(false)
  }

  async function fetchResenas() {
    const { data } = await supabase
      .from('resenas')
      .select('*')
      .eq('comercio_id', id)
      .order('created_at', { ascending: false })
    setResenas(data || [])
  }

  function promedioEstrellas() {
    if (!resenas.length) return 0
    return (resenas.reduce((acc, r) => acc + r.estrellas, 0) / resenas.length).toFixed(1)
  }

  function renderEstrellas(n) {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < n ? 'text-amber-400' : 'text-gray-300'}>★</span>
    ))
  }

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </div>
  )

  if (!comercio) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Comercio no encontrado.</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <button onClick={() => router.push('/')}
          className="text-gray-500 text-sm flex items-center gap-1 hover:text-gray-800">
          ← Volver
        </button>
        <span className="text-green-700 font-medium">Comercios cerca</span>
      </nav>

     {/* Banner */}
<div className="h-48 bg-green-600 overflow-hidden">
  {comercio.banner_url ? (
    <img src={comercio.banner_url} alt="banner"
      className="w-full h-full object-cover"/>
  ) : (
    <div className="w-full h-full bg-green-600"/>
  )}
</div>
{/* Info principal */}
<div className="max-w-3xl mx-auto px-6">
  <div className="flex items-end gap-5 -mt-12 mb-6">
    <div className="w-24 h-24 bg-white border-4 border-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
      {comercio.logo_url ? (
        <img src={comercio.logo_url} alt={comercio.nombre}
          className="w-full h-full object-cover rounded-2xl"/>
      ) : (
        <span className="text-green-700 font-bold text-4xl">{comercio.nombre[0]}</span>
      )}
    </div>
    <div className="pb-1 flex-1">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className={`text-xs px-3 py-1 rounded-full ${
          comercio.esta_abierto
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {comercio.esta_abierto ? 'Abierto ahora' : 'Cerrado'}
        </span>
      </div>
      <h1 className="text-2xl font-medium text-gray-900">{comercio.nombre}</h1>
      <p className="text-sm text-gray-500">{comercio.categoria} · {comercio.ciudad}</p>
    </div>
  </div>
        {/* Info rápida */}
        <div className="flex flex-wrap gap-2 mb-6">
          {comercio.direccion && (
            <span className="text-xs bg-white border rounded-full px-3 py-1.5 text-gray-600">
              📍 {comercio.direccion}
            </span>
          )}
          {comercio.telefono && (
            <span className="text-xs bg-white border rounded-full px-3 py-1.5 text-gray-600">
              📞 {comercio.telefono}
            </span>
          )}
        </div>

        {/* Descripción */}
        {comercio.descripcion && (
          <div className="bg-white border rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">{comercio.descripcion}</p>
          </div>
        )}

        {/* Valoraciones */}
        <div className="bg-white border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-900">Valoraciones</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-medium text-gray-900">{promedioEstrellas()}</span>
              <div className="flex">{renderEstrellas(Math.round(promedioEstrellas()))}</div>
              <span className="text-sm text-gray-500">· {resenas.length} reseñas</span>
            </div>
          </div>

          {resenas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aún no hay reseñas. ¡Sé el primero!</p>
          ) : (
            <div className="flex flex-col gap-4">
              {resenas.map(resena => (
                <div key={resena.id} className="border-t pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                        U
                      </div>
                      <span className="text-sm font-medium text-gray-900">Cliente</span>
                    </div>
                    <div className="flex">{renderEstrellas(resena.estrellas)}</div>
                  </div>
                  <p className="text-sm text-gray-700">{resena.comentario}</p>
                  {resena.respuesta && (
                    <div className="mt-3 bg-gray-50 border-l-2 border-green-500 pl-3 py-2">
                      <p className="text-xs font-medium text-green-700 mb-1">Respuesta del comercio</p>
                      <p className="text-sm text-gray-600">{resena.respuesta}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => router.push('/login')}
            className="mt-4 w-full border border-gray-200 rounded-lg py-2.5 text-sm text-gray-600 hover:bg-gray-50">
            Dejar una valoración
          </button>
        </div>
      </div>
    </main>
  )
}