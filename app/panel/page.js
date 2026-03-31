'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Panel() {
  const router = useRouter()
  const [comercio, setComercio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [seccion, setSeccion] = useState('inicio')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [subiendoBanner, setSubiendoBanner] = useState(false)
  const [visualizaciones, setVisualizaciones] = useState(0)

  useEffect(() => {
    fetchComercio()
  }, [])

  useEffect(() => {
    if (comercio) fetchVisualizaciones()
  }, [comercio])

  async function fetchComercio() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/registro'); return }
    const { data } = await supabase
      .from('comercios')
      .select('*')
      .eq('usuario_id', user.id)
      .single()
    setComercio(data)
    setCargando(false)
  }

  async function fetchVisualizaciones() {
    const { count } = await supabase
      .from('visualizaciones')
      .select('*', { count: 'exact' })
      .eq('comercio_id', comercio.id)
    setVisualizaciones(count || 0)
  }

  async function toggleAbierto() {
    const { data } = await supabase
      .from('comercios')
      .update({ esta_abierto: !comercio.esta_abierto })
      .eq('id', comercio.id)
      .select()
      .single()
    setComercio(data)
  }

  async function guardarPerfil() {
    setGuardando(true)
    await supabase.from('comercios').update({
      nombre: comercio.nombre,
      descripcion: comercio.descripcion,
      telefono: comercio.telefono,
      direccion: comercio.direccion,
      categoria: comercio.categoria,
      ciudad: comercio.ciudad,
    }).eq('id', comercio.id)
    setMensaje('¡Cambios guardados!')
    setTimeout(() => setMensaje(''), 3000)
    setGuardando(false)
  }

  async function handleLogoUpload(e) {
    const archivo = e.target.files[0]
    if (!archivo) return
    setSubiendoLogo(true)
    try {
      const extension = archivo.name.split('.').pop()
      const nombreArchivo = `${comercio.id}.${extension}`
      await supabase.storage.from('logos').upload(nombreArchivo, archivo, { upsert: true })
      const { data } = supabase.storage.from('logos').getPublicUrl(nombreArchivo)
      await supabase.from('comercios').update({ logo_url: data.publicUrl }).eq('id', comercio.id)
      setComercio({ ...comercio, logo_url: data.publicUrl })
      setMensaje('¡Logo actualizado!')
      setTimeout(() => setMensaje(''), 3000)
    } catch (e) {
      setMensaje('Error al subir el logo')
    }
    setSubiendoLogo(false)
  }

  async function handleBannerUpload(e) {
    const archivo = e.target.files[0]
    if (!archivo) return
    setSubiendoBanner(true)
    try {
      const extension = archivo.name.split('.').pop()
      const nombreArchivo = `${comercio.id}.${extension}`
      await supabase.storage.from('banners').upload(nombreArchivo, archivo, { upsert: true })
      const { data } = supabase.storage.from('banners').getPublicUrl(nombreArchivo)
      await supabase.from('comercios').update({ banner_url: data.publicUrl }).eq('id', comercio.id)
      setComercio({ ...comercio, banner_url: data.publicUrl })
      setMensaje('¡Banner actualizado!')
      setTimeout(() => setMensaje(''), 3000)
    } catch (e) {
      setMensaje('Error al subir el banner')
    }
    setSubiendoBanner(false)
  }

  async function eliminarComercio() {
    const confirmar = window.confirm('¿Estás seguro que quieres eliminar tu negocio? Esta acción no se puede deshacer.')
    if (!confirmar) return
    await supabase.from('comercios').delete().eq('id', comercio.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </div>
  )

  if (!comercio) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">No tienes un negocio registrado.</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-52 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-2 overflow-hidden">
            {comercio.logo_url ? (
              <img src={comercio.logo_url} className="w-full h-full object-cover"/>
            ) : (
              <span className="text-green-700 font-bold">{comercio.nombre[0]}</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">{comercio.nombre}</p>
          <p className="text-xs text-green-600">Plan gratuito</p>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {[
            { id: 'inicio', label: 'Inicio' },
            { id: 'perfil', label: 'Mi perfil' },
            { id: 'resenas', label: 'Reseñas' },
            { id: 'horarios', label: 'Horarios' },
            { id: 'donacion', label: '💚 Apoyar app' },
          ].map(item => (
            <button key={item.id} onClick={() => setSeccion(item.id)}
              className={`text-left px-3 py-2 rounded-lg text-sm ${
                seccion === item.id
                  ? 'bg-gray-100 text-green-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t flex flex-col gap-1">
  <button onClick={() => router.push('/')}
    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
     Ir a la app
    </button>
     <button onClick={cerrarSesion}
      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
      Cerrar sesión
     </button>
   </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 p-8">

        {/* INICIO */}
        {seccion === 'inicio' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-xl font-medium text-gray-900">Buen día 👋</p>
                <p className="text-sm text-gray-500">{comercio.ciudad}</p>
              </div>
              <button onClick={toggleAbierto}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
                  comercio.esta_abierto
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}>
                <span className={`w-2 h-2 rounded-full ${comercio.esta_abierto ? 'bg-green-500' : 'bg-gray-400'}`}/>
                {comercio.esta_abierto ? 'Abierto ahora' : 'Cerrado'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Estado actual</p>
                <p className={`text-lg font-medium ${comercio.esta_abierto ? 'text-green-600' : 'text-gray-400'}`}>
                  {comercio.esta_abierto ? 'Abierto' : 'Cerrado'}
                </p>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Visitas totales</p>
                <p className="text-lg font-medium text-gray-900">{visualizaciones}</p>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Categoría</p>
                <p className="text-lg font-medium text-gray-900">{comercio.categoria}</p>
              </div>
            </div>
          </div>
        )}

        {/* MI PERFIL */}
        {seccion === 'perfil' && (
          <div>
            <p className="text-xl font-medium text-gray-900 mb-6">Mi perfil</p>
            {mensaje && <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg">{mensaje}</p>}

            {/* Logo */}
            <div className="bg-white border rounded-xl p-6 mb-4 flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {comercio.logo_url ? (
                  <img src={comercio.logo_url} alt={comercio.nombre} className="w-full h-full object-cover"/>
                ) : (
                  <span className="text-green-700 font-bold text-3xl">{comercio.nombre[0]}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Logo del negocio</p>
                <p className="text-xs text-gray-500 mb-3">Sube una imagen cuadrada. Máximo 2MB.</p>
                <label className="cursor-pointer bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  {subiendoLogo ? 'Subiendo...' : 'Cambiar logo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload}/>
                </label>
              </div>
            </div>

            {/* Banner */}
            <div className="bg-white border rounded-xl p-6 mb-4">
              <p className="text-sm font-medium text-gray-900 mb-1">Foto de portada</p>
              <p className="text-xs text-gray-500 mb-3">Se muestra como banner en tu perfil. Recomendado 1200x400px.</p>
              <div className="h-28 rounded-xl overflow-hidden bg-green-100 mb-3">
                {comercio.banner_url ? (
                  <img src={comercio.banner_url} alt="banner" className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full bg-green-200 flex items-center justify-center">
                    <span className="text-green-600 text-sm">Sin foto de portada</span>
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                {subiendoBanner ? 'Subiendo...' : 'Cambiar portada'}
                <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload}/>
              </label>
            </div>

            {/* Datos */}
            <div className="bg-white border rounded-xl p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Nombre del negocio</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                    value={comercio.nombre} onChange={e => setComercio({...comercio, nombre: e.target.value})}/>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Categoría</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                    value={comercio.categoria} onChange={e => setComercio({...comercio, categoria: e.target.value})}>
                    <option>Restaurante</option>
                    <option>Tienda</option>
                    <option>Servicios</option>
                    <option>Salud</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Teléfono</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                    value={comercio.telefono || ''} onChange={e => setComercio({...comercio, telefono: e.target.value})}/>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Ciudad</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                    value={comercio.ciudad || ''} onChange={e => setComercio({...comercio, ciudad: e.target.value})}/>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500 block mb-1">Dirección</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                    value={comercio.direccion || ''} onChange={e => setComercio({...comercio, direccion: e.target.value})}/>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Descripción</label>
                <textarea className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500 resize-none"
                  rows={3} value={comercio.descripcion || ''} onChange={e => setComercio({...comercio, descripcion: e.target.value})}/>
              </div>
              <button onClick={guardarPerfil} disabled={guardando}
                className="self-start bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>

              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-medium text-gray-900 mb-1">Zona de peligro</p>
                <p className="text-xs text-gray-500 mb-3">Al eliminar tu negocio se borrarán todos tus datos permanentemente.</p>
                <button onClick={eliminarComercio}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">
                  Eliminar mi negocio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESEÑAS */}
        {seccion === 'resenas' && (
          <div>
            <p className="text-xl font-medium text-gray-900 mb-6">Reseñas</p>
            <Resenas comercioId={comercio.id} />
          </div>
        )}

        {/* HORARIOS */}
        {seccion === 'horarios' && (
          <div>
            <p className="text-xl font-medium text-gray-900 mb-6">Horarios de atención</p>
            <div className="bg-white border rounded-xl p-6">
              <p className="text-sm text-gray-500">Próximamente podrás configurar tus horarios por día aquí.</p>
            </div>
          </div>
        )}

        {/* DONACIÓN */}
        {seccion === 'donacion' && (
          <div>
            <p className="text-xl font-medium text-gray-900 mb-2">Apoya el proyecto</p>
            <p className="text-sm text-gray-500 mb-6">Esta app es completamente gratuita. Si te ha sido útil puedes hacer una donación voluntaria para mantenerla funcionando.</p>
            <div className="grid grid-cols-2 gap-4">
              <a href="https://nequi.com.co" target="_blank"
                className="bg-pink-500 text-white text-center py-4 rounded-xl font-medium hover:bg-pink-600 transition">
                <p className="text-2xl mb-1">💸</p>
                <p className="text-sm">Donar por Nequi</p>
              </a>
              <a href="https://wompi.com" target="_blank"
                className="bg-green-600 text-white text-center py-4 rounded-xl font-medium hover:bg-green-700 transition">
                <p className="text-2xl mb-1">💳</p>
                <p className="text-sm">Donar por Wompi</p>
              </a>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">Cualquier aporte es bienvenido 🙏</p>
          </div>
        )}

      </div>
    </main>
  )
}

function Resenas({ comercioId }) {
  const [resenas, setResenas] = useState([])
  const [respuestas, setRespuestas] = useState({})
  const [enviando, setEnviando] = useState(null)

  useEffect(() => {
    fetchResenas()
  }, [])

  async function fetchResenas() {
    const { data } = await supabase
      .from('resenas')
      .select('*')
      .eq('comercio_id', comercioId)
      .order('created_at', { ascending: false })
    setResenas(data || [])
  }

  async function responderResena(resenaId) {
    if (!respuestas[resenaId]?.trim()) return
    setEnviando(resenaId)
    await supabase
      .from('resenas')
      .update({ respuesta: respuestas[resenaId] })
      .eq('id', resenaId)
    await fetchResenas()
    setRespuestas({ ...respuestas, [resenaId]: '' })
    setEnviando(null)
  }

  function renderEstrellas(n) {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < n ? 'text-amber-400' : 'text-gray-200'}>★</span>
    ))
  }

  if (resenas.length === 0) return (
    <div className="bg-white border rounded-xl p-6 text-center">
      <p className="text-gray-400 text-sm">Aún no tienes reseñas.</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {resenas.map(resena => (
        <div key={resena.id} className="bg-white border rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                U
              </div>
              <span className="text-sm font-medium text-gray-900">Cliente</span>
            </div>
            <div className="flex">{renderEstrellas(resena.estrellas)}</div>
          </div>
          <p className="text-sm text-gray-700 mb-3">{resena.comentario}</p>

          {resena.respuesta ? (
            <div className="bg-gray-50 border-l-2 border-green-500 pl-3 py-2">
              <p className="text-xs font-medium text-green-700 mb-1">Tu respuesta</p>
              <p className="text-sm text-gray-600">{resena.respuesta}</p>
            </div>
          ) : (
            <div className="flex gap-2 mt-2">
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                placeholder="Escribe tu respuesta..."
                value={respuestas[resena.id] || ''}
                onChange={e => setRespuestas({...respuestas, [resena.id]: e.target.value})}
              />
              <button
                onClick={() => responderResena(resena.id)}
                disabled={enviando === resena.id}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                {enviando === resena.id ? '...' : 'Responder'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}