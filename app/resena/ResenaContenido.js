'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResenaContenido() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const comercioId = searchParams.get('comercio')

  const [comercio, setComercio] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [estrellas, setEstrellas] = useState(0)
  const [comentario, setComentario] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    verificarUsuario()
    fetchComercio()
  }, [])

  async function verificarUsuario() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUsuario(user)
  }

  async function fetchComercio() {
    const { data } = await supabase
      .from('comercios')
      .select('id, nombre, categoria, ciudad, logo_url')
      .eq('id', comercioId)
      .single()
    setComercio(data)
  }

  async function enviarResena() {
    if (estrellas === 0) { setError('Por favor selecciona una calificación'); return }
    if (!comentario.trim()) { setError('Por favor escribe un comentario'); return }
    setCargando(true)
    setError('')
    const { error } = await supabase.from('resenas').insert({
      comercio_id: comercioId,
      usuario_id: usuario.id,
      estrellas,
      comentario
    })
    if (error) {
      setError('Error al enviar la reseña. Intenta de nuevo.')
    } else {
      router.push(`/comercio/${comercioId}`)
    }
    setCargando(false)
  }

  if (!comercio) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <button onClick={() => router.push(`/comercio/${comercioId}`)}
          className="text-gray-500 text-sm hover:text-gray-800">
          ← Volver
        </button>
        <span className="text-green-700 font-medium">Cercapp</span>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl overflow-hidden flex items-center justify-center">
            {comercio.logo_url ? (
              <img src={comercio.logo_url} className="w-full h-full object-cover"/>
            ) : (
              <span className="text-green-700 font-bold text-lg">{comercio.nombre[0]}</span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{comercio.nombre}</p>
            <p className="text-sm text-gray-500">{comercio.categoria} · {comercio.ciudad}</p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 flex flex-col gap-5">
          <p className="font-medium text-gray-900">Deja tu valoración</p>
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

          <div>
            <label className="text-sm text-gray-500 block mb-3">¿Cómo calificarías este negocio?</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setEstrellas(n)}
                  className={`text-4xl transition ${n <= estrellas ? 'text-amber-400' : 'text-gray-200'}`}>
                  ★
                </button>
              ))}
            </div>
            {estrellas > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {['','Muy malo','Malo','Regular','Bueno','Excelente'][estrellas]}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">Cuéntanos tu experiencia</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500 resize-none"
              rows={4}
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder="¿Cómo fue tu experiencia con este negocio?"/>
            <p className="text-xs text-gray-400 mt-1">{comentario.length}/500 caracteres</p>
          </div>

          <button onClick={enviarResena} disabled={cargando}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium">
            {cargando ? 'Enviando...' : 'Publicar reseña'}
          </button>
        </div>
      </div>
    </main>
  )
}