'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const router = useRouter()
  const [seccion, setSeccion] = useState('estadisticas')
  const [comercios, setComercios] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [totalVisitas, setTotalVisitas] = useState(0)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    verificarAdmin()
  }, [])

  async function verificarAdmin() {
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Usuario:', user?.id)
  
  if (!user) { router.push('/login'); return }

  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .single()

  console.log('Admin data:', data)
  console.log('Admin error:', error)

  if (!data) { router.push('/'); return }

  fetchDatos()
}

  async function fetchDatos() {
    const { data: comerciosData } = await supabase
      .from('comercios')
      .select('*')
      .order('created_at', { ascending: false })
    setComercios(comerciosData || [])

    const { count } = await supabase
      .from('visualizaciones')
      .select('*', { count: 'exact' })
    setTotalVisitas(count || 0)

    setCargando(false)
  }

  async function toggleComercio(comercio) {
    const { data } = await supabase
      .from('comercios')
      .update({ plan_activo: !comercio.plan_activo })
      .eq('id', comercio.id)
      .select()
      .single()
    setComercios(comercios.map(c => c.id === comercio.id ? data : c))
  }

  async function eliminarComercio(id) {
    const confirmar = window.confirm('¿Eliminar este comercio permanentemente?')
    if (!confirmar) return
    await supabase.from('comercios').delete().eq('id', id)
    setComercios(comercios.filter(c => c.id !== id))
  }

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Verificando acceso...</p>
    </div>
  )

  const comerciosActivos = comercios.filter(c => c.plan_activo).length
  const comerciosInactivos = comercios.filter(c => !c.plan_activo).length
  const ciudades = [...new Set(comercios.map(c => c.ciudad))].length

  return (
    <main className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-52 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <p className="text-sm font-medium text-gray-900">Panel Admin</p>
          <p className="text-xs text-green-600">Acceso total</p>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {[
            { id: 'estadisticas', label: '📊 Estadísticas' },
            { id: 'comercios', label: '🏪 Comercios' },
            { id: 'usuarios', label: '👤 Usuarios' },
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
          <button onClick={() => router.push('/')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
            ← Volver a la app
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 p-8">

        {/* ESTADÍSTICAS */}
        {seccion === 'estadisticas' && (
          <div>
            <p className="text-xl font-medium text-gray-900 mb-6">Estadísticas generales</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Total comercios</p>
                <p className="text-3xl font-medium text-gray-900">{comercios.length}</p>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Comercios activos</p>
                <p className="text-3xl font-medium text-green-600">{comerciosActivos}</p>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Visitas totales</p>
                <p className="text-3xl font-medium text-gray-900">{totalVisitas}</p>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Ciudades</p>
                <p className="text-3xl font-medium text-gray-900">{ciudades}</p>
              </div>
            </div>

            {/* Comercios por categoría */}
            <p className="text-sm font-medium text-gray-900 mb-3">Comercios por categoría</p>
            <div className="bg-white border rounded-xl p-4">
              {['Restaurante','Tienda','Servicios','Salud','Otro'].map(cat => {
                const count = comercios.filter(c => c.categoria === cat).length
                const pct = comercios.length ? Math.round(count / comercios.length * 100) : 0
                return (
                  <div key={cat} className="flex items-center gap-3 mb-3">
                    <span className="text-sm text-gray-600 w-24">{cat}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${pct}%`}}/>
                    </div>
                    <span className="text-sm text-gray-500 w-8">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* COMERCIOS */}
        {seccion === 'comercios' && (
          <div>
            <p className="text-xl font-medium text-gray-900 mb-6">Todos los comercios</p>
            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Nombre</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Categoría</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Ciudad</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {comercios.map(comercio => (
                    <tr key={comercio.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {comercio.logo_url ? (
                              <img src={comercio.logo_url} className="w-full h-full object-cover"/>
                            ) : (
                              <span className="text-green-700 font-bold text-sm">{comercio.nombre[0]}</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-900">{comercio.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{comercio.categoria}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{comercio.ciudad}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          comercio.plan_activo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {comercio.plan_activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => toggleComercio(comercio)}
                            className={`text-xs px-2 py-1 rounded border ${
                              comercio.plan_activo
                                ? 'text-red-600 border-red-200 hover:bg-red-50'
                                : 'text-green-600 border-green-200 hover:bg-green-50'
                            }`}>
                            {comercio.plan_activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button onClick={() => eliminarComercio(comercio.id)}
                            className="text-xs px-2 py-1 rounded border text-red-600 border-red-200 hover:bg-red-50">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USUARIOS */}
        {seccion === 'usuarios' && (
          <div>
            <p className="text-xl font-medium text-gray-900 mb-6">Usuarios registrados</p>
            <div className="bg-white border rounded-xl p-6">
              <p className="text-sm text-gray-500">Los usuarios se gestionan directamente desde el dashboard de Supabase → Authentication → Users por seguridad.</p>
              <a href="https://supabase.com/dashboard" target="_blank"
                className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                Ir a Supabase →
              </a>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}