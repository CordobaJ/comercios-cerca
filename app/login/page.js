'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [modo, setModo] = useState('login')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })

  async function handleLogin() {
    setCargando(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    })
    if (error) setError('Correo o contraseña incorrectos')
    else router.push('/')
    setCargando(false)
  }

  async function handleRegistro() {
    setCargando(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { nombre: form.nombre } }
    })
    if (error) setError(error.message)
    else router.push('/')
    setCargando(false)
  }

  async function handleOlvide() {
    setCargando(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(form.email)
    if (error) setError(error.message)
    else setError('¡Te enviamos un enlace a tu correo!')
    setCargando(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b px-8 py-4">
        <span className="text-green-700 font-medium cursor-pointer" onClick={() => router.push('/')}>
          Cercapp
        </span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-green-700 font-bold text-2xl">C</span>
            </div>
            <p className="text-xl font-medium text-gray-900">
              {modo === 'login' ? 'Bienvenido de vuelta' :
               modo === 'registro' ? 'Crea tu cuenta' :
               '¿Olvidaste tu contraseña?'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {modo === 'login' ? 'Inicia sesión para dejar reseñas' :
               modo === 'registro' ? 'Para dejar valoraciones y reseñas' :
               'Te enviaremos un enlace a tu correo'}
            </p>
          </div>

          {/* Tabs login/registro */}
          {modo !== 'olvide' && (
            <div className="flex bg-gray-100 rounded-full p-1 mb-6">
              <button onClick={() => setModo('login')}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  modo === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}>
                Iniciar sesión
              </button>
              <button onClick={() => setModo('registro')}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  modo === 'registro' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}>
                Crear cuenta
              </button>
            </div>
          )}

          {/* Formulario */}
          <div className="bg-white border rounded-xl p-6 flex flex-col gap-4">
            {error && (
              <p className={`text-sm p-3 rounded-lg ${
                error.includes('enviamos') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>{error}</p>
            )}

            {modo === 'registro' && (
              <div>
                <label className="text-sm text-gray-500 block mb-1">Nombre completo</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                  value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                  placeholder="Tu nombre"/>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-500 block mb-1">Correo electrónico</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                placeholder="correo@ejemplo.com"/>
            </div>

            {modo !== 'olvide' && (
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-gray-500">Contraseña</label>
                  {modo === 'login' && (
                    <span onClick={() => setModo('olvide')}
                      className="text-sm text-green-600 cursor-pointer">
                      ¿Olvidaste?
                    </span>
                  )}
                </div>
                <input className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500"
                  type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Mínimo 6 caracteres"/>
              </div>
            )}

            <button
              onClick={modo === 'login' ? handleLogin : modo === 'registro' ? handleRegistro : handleOlvide}
              disabled={cargando}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium mt-1">
              {cargando ? 'Cargando...' :
               modo === 'login' ? 'Iniciar sesión' :
               modo === 'registro' ? 'Crear cuenta' :
               'Enviar enlace'}
            </button>

            {modo === 'olvide' && (
              <button onClick={() => setModo('login')}
                className="text-sm text-green-600 text-center">
                Volver al login
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}