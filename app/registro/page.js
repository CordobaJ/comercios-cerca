'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Registro() {
  const router = useRouter()
  const [paso, setPaso] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const [cuenta, setCuenta] = useState({
    nombre: '', email: '', password: ''
  })

  const [negocio, setNegocio] = useState({
    nombre: '', categoria: '', ciudad: '',
    direccion: '', telefono: '', descripcion: ''
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCuenta({ nombre: user.user_metadata?.nombre || '', email: user.email, password: '' })
        setPaso(2)
      }
    })
  }, [])

  async function handleRegistro() {
    setCargando(true)
    setError('')
    try {
      const { error } = await supabase.auth.signUp({
        email: cuenta.email,
        password: cuenta.password,
        options: { data: { nombre: cuenta.nombre } }
      })
      if (error) throw error
      setPaso(2)
    } catch (e) {
      setError(e.message)
    }
    setCargando(false)
  }

  async function handleNegocio() {
    setCargando(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('comercios').insert({
        ...negocio,
        usuario_id: user.id,
        plan: 'gratis',
        plan_activo: true,
        esta_abierto: false
      })
      if (error) throw error
      setPaso(3)
    } catch (e) {
      setError(e.message)
    }
    setCargando(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-green-600 px-8 py-6">
        <p className="text-white text-xl font-medium">Registra tu negocio</p>
        <p className="text-green-200 text-sm mt-1">Gratis · Sin tarjeta requerida</p>
      </div>

      <div className="bg-white border-b px-8 py-4 flex items-center gap-2">
        {[1,2,3].map(n => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
              paso > n ? 'bg-green-600 text-white' :
              paso === n ? 'bg-green-600 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {paso > n ? '✓' : n}
            </div>
            <span className={`text-sm ${paso === n ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
              {['Cuenta','Negocio','¡Listo!'][n-1]}
            </span>
            {n < 3 && <div className={`h-px w-8 ${paso > n ? 'bg-green-600' : 'bg-gray-200'}`}/>}
          </div>
        ))}
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">
        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

        {paso === 1 && (
          <div className="bg-white rounded-xl border p-6 flex flex-col gap-4">
            <p className="font-medium text-gray-900">Crea tu cuenta</p>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Nombre completo</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                value={cuenta.nombre} onChange={e => setCuenta({...cuenta, nombre: e.target.value})}
                placeholder="Tu nombre"/>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Correo electrónico</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                type="email" value={cuenta.email} onChange={e => setCuenta({...cuenta, email: e.target.value})}
                placeholder="correo@ejemplo.com"/>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Contraseña</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                type="password" value={cuenta.password} onChange={e => setCuenta({...cuenta, password: e.target.value})}
                placeholder="Mínimo 6 caracteres"/>
            </div>
            <button onClick={handleRegistro} disabled={cargando}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium mt-2">
              {cargando ? 'Creando cuenta...' : 'Continuar'}
            </button>
          </div>
        )}

        {paso === 2 && (
          <div className="bg-white rounded-xl border p-6 flex flex-col gap-4">
            <p className="font-medium text-gray-900">Datos de tu negocio</p>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Nombre del negocio</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                value={negocio.nombre} onChange={e => setNegocio({...negocio, nombre: e.target.value})}
                placeholder="Ej: Tienda Don Carlos"/>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Categoría</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                value={negocio.categoria} onChange={e => setNegocio({...negocio, categoria: e.target.value})}>
                <option value="">Selecciona una categoría</option>
                <option>Restaurante</option>
                <option>Tienda</option>
                <option>Servicios</option>
                <option>Salud</option>
                <option>Otro</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-500 block mb-1">Ciudad</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                  value={negocio.ciudad} onChange={e => setNegocio({...negocio, ciudad: e.target.value})}
                  placeholder="Ej: Medellín"/>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Teléfono</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                  value={negocio.telefono} onChange={e => setNegocio({...negocio, telefono: e.target.value})}
                  placeholder="300 000 0000"/>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Dirección</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                value={negocio.direccion} onChange={e => setNegocio({...negocio, direccion: e.target.value})}
                placeholder="Ej: Cra 80 #45-12"/>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Descripción</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500 resize-none"
                rows={3} value={negocio.descripcion} onChange={e => setNegocio({...negocio, descripcion: e.target.value})}
                placeholder="Cuéntale a tus clientes qué ofreces..."/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPaso(1)}
                className="px-4 py-2.5 border rounded-lg text-sm text-gray-600">Atrás</button>
              <button onClick={handleNegocio} disabled={cargando}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium">
                {cargando ? 'Guardando...' : 'Registrar negocio'}
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="bg-white rounded-xl border p-6 flex flex-col gap-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">🎉</span>
            </div>
            <p className="font-medium text-gray-900 text-lg">¡Tu negocio está listo!</p>
            <p className="text-sm text-gray-500">Tu negocio ya es visible para todos los clientes de la app. ¡Totalmente gratis!</p>
            <div className="bg-gray-50 border rounded-xl p-4 text-left">
              <p className="text-sm font-medium text-gray-900 mb-1">¿Te gustó la app? 💚</p>
              <p className="text-xs text-gray-500 mb-3">Si quieres apoyar el proyecto puedes hacer una donación voluntaria.</p>
              <div className="flex gap-2">
                <a href="href="https://link.nequi.com.co/3215673678"" target="_blank"
                  className="flex-1 bg-pink-500 text-white text-center py-2 rounded-lg text-xs font-medium">
                  Donar por Nequi
                </a>
                <a href="https://wompi.com" target="_blank"
                  className="flex-1 bg-green-600 text-white text-center py-2 rounded-lg text-xs font-medium">
                  Donar por Wompi
                </a>
              </div>
            </div>
            <button onClick={() => router.push('/panel')}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium">
              Ir a mi panel
            </button>
          </div>
        )}
      </div>
    </main>
  )
}