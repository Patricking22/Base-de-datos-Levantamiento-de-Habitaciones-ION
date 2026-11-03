import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { X } from 'lucide-react'
import type { Tomacorriente } from '../types/database'

interface Props {
  habitacionId: string
  elementoExistente: Tomacorriente | null
  onClose: () => void
  onSaved: () => void
}

export default function ModalTomacorriente({ habitacionId, elementoExistente, onClose, onSaved }: Props) {
  const [identificacion, setIdentificacion] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [estado, setEstado] = useState<'funcional' | 'no_funcional' | 'pendiente'>('pendiente')
  const [distancia, setDistancia] = useState('')
  const [observacion, setObservacion] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (elementoExistente) {
      setIdentificacion(elementoExistente.identificacion || '')
      setUbicacion(elementoExistente.ubicacion || '')
      setEstado(elementoExistente.estado || 'pendiente')
      setDistancia(elementoExistente.distancia_nodo_m?.toString() || '')
      setObservacion(elementoExistente.observacion || '')
    }
  }, [elementoExistente])

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    const datos = {
      habitacion_id: habitacionId,
      identificacion: identificacion || null,
      ubicacion: ubicacion || null,
      estado,
      distancia_nodo_m: distancia ? parseFloat(distancia) : null,
      observacion: observacion || null,
    }

    if (elementoExistente) {
      await supabase.from('tomacorrientes').update(datos).eq('id', elementoExistente.id)
    } else {
      await supabase.from('tomacorrientes').insert(datos)
    }

    setGuardando(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {elementoExistente ? 'Editar Tomacorriente' : 'Nuevo Tomacorriente'}
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGuardar} className="p-4 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Identificación (opcional)</label>
            <input
              type="text"
              placeholder="Ej: Toma A, Toma junto a cama 1..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={identificacion}
              onChange={(e) => setIdentificacion(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
            <input
              type="text"
              placeholder="Ej: Pared norte, detrás de puerta..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              value={estado}
              onChange={(e) => setEstado(e.target.value as any)}
            >
              <option value="pendiente">Pendiente de verificar</option>
              <option value="funcional">Funcional</option>
              <option value="no_funcional">No funcional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Distancia al Nodo (metros)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ej: 1.5"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={distancia}
              onChange={(e) => setDistancia(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observación (opcional)</label>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={2}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={guardando} className="w-full bg-blue-600 text-white font-semibold rounded-xl px-5 py-3">
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}