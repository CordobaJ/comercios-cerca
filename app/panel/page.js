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

  useEffect(() => {
    fetchComercio()
  }, [])

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
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-2">
            <span className="text-green-700 font-bold">{comercio.nombre[0]}</span>
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">{comercio.nombre}</p>
          <p className="text-xs text-green-600">Plan {comercio.plan}</p>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {[
            { id: 'inicio', label: 'Inicio' },
            { id: 'perfil', label: 'Mi perfil' },
            { id: 'horarios', label: 'Horarios' },
            { id: 'suscripcion', label: 'Suscripción' },
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

        <div className="p-3 border-t">
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
              {/* Toggle abierto/cerrado */}
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

            {/* Aviso prueba */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-green-800">Periodo de prueba activo</p>
              <p className="text-sm text-green-600 mt-1">Tienes 30 días gratis para explorar la app.</p>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Estado actual</p>
                <p className={`text-lg font-medium ${comercio.esta_abierto ? 'text-green-600' : 'text-gray-400'}`}>
                  {comercio.esta_abierto ? 'Abierto' : 'Cerrado'}
                </p>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Categoría</p>
                <p className="text-lg font-medium text-gray-900">{comercio.categoria}</p>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Plan activo</p>
                <p className="text-lg font-medium text-gray-900 capitalize">{comercio.plan}</p>
              </div>
            </div>
          </div>
        )}

        {/* MI PERFIL */}
        {seccion === 'perfil' && (
          <div>
            <p className="text-xl font-medium text-gray-900 mb-6">Mi perfil</p>
            {mensaje && <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg">{mensaje}</p>}
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
  <label className="text-sm text-gray-500 block mb-1">Dirección</label>
  <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
    value={comercio.direccion || ''} onChange={e => setComercio({...comercio, direccion: e.target.value})}/>
</div>
<div>
  <label className="text-sm text-gray-500 block mb-1">Ciudad</label>
  <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
    value={comercio.ciudad || ''} onChange={e => setComercio({...comercio, ciudad: e.target.value})}/>
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
            </div>
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

        {/* SUSCRIPCIÓN */}
        {seccion === 'suscripcion' && (
          <div>
            <p className="text-xl font-medium text-gray-900 mb-6">Suscripción</p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-green-800">Periodo de prueba activo</p>
              <p className="text-sm text-green-600 mt-1">30 días gratis incluidos al registrarse.</p>
            </div>
            <div className="flex gap-4">
              <div className={`flex-1 border-2 rounded-xl p-4 ${comercio.plan === 'mensual' ? 'border-green-600' : 'border-gray-200'}`}>
                <p className="font-medium text-sm text-gray-900">Mensual</p>
                <p className="text-2xl font-medium text-green-700 mt-1">$18.000<span className="text-sm font-normal text-gray-500">/mes</span></p>
              </div>
              <div className={`flex-1 border-2 rounded-xl p-4 ${comercio.plan === 'anual' ? 'border-green-600' : 'border-gray-200'}`}>
                <p className="font-medium text-sm text-gray-900">Anual</p>
                <p className="text-2xl font-medium text-green-700 mt-1">$15.000<span className="text-sm font-normal text-gray-500">/mes</span></p>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}