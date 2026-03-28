'use client'
import { Suspense } from 'react'
import ResenaContenido from './ResenaContenido'

export default function Resena() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    }>
      <ResenaContenido />
    </Suspense>
  )
}