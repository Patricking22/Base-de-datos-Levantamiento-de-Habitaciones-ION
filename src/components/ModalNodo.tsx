import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { X } from 'lucide-react'
import type { Nodo } from '../types/database'

interface Props {
  habitacionId: string
  nodoExistente: Nodo | null
  onClose: () => void
  onSaved: () => void
}

export default function ModalNodo({ habitacionId, nodoExistente, onClose, onSaved }: Props) {
  const [ubicacion, setUbicacion] = useState('')
  const [distancia, setDistancia] = useState('')
  const [alimentacion, setAlimentacion] = useState(false)
  const [estado, setEstado] = useState<'pendiente' | 'ubicacion_identificada' | 'instalado' | 'verificado'>('pendiente')
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (nodoExistente) {
      setUbicacion(nodoExistente.ubicacion_propuesta || '')
      setDistancia(nodoExistente.distancia_central_m?.toString() || '')
      setAlimentacion(nodoExistente.alimentacion_disponible || false)
      setEstado(nodoExistente.estado || 'pendiente')
      setObservaciones(nodoExistente.observaciones || '')
    }
  }, [nodoExistente])

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    const datos = {
      habitacion_id: habitacionId,
      ubicacion_propuesta: ubicacion || null,
      distancia_central_m: distancia ? parseFloat(distancia) : null,
      alimentacion_disponible: alimentacion,
      estado,
      observaciones: observaciones || null,
    }

    if (nodoExistente) {
      await supabase.from('nodos').update(datos).eq('id', nodoExistente.id)
    } else {
      await supabase.from('nodos').insert(datos)
    }

    setGuardando(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{nodoExistente ? 'Editar Nodo' : 'Nuevo Nodo'}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleGuardar} className="p-4 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación propuesta</label>
            <input type="text" className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Distancia a Central de Enfermería (m)</label>
            <input type="number" step="0.01" className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={distancia} onChange={(e) => setDistancia(e.target.value)} />
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <input type="checkbox" id="alimentacion" className="w-5 h-5 text-blue-600 rounded" checked={alimentacion} onChange={(e) => setAlimentacion(e.target.checked)} />
            <label htmlFor="alimentacion" className="text-sm font-medium text-slate-700">¿Hay alimentación eléctrica disponible?</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado de Instalación</label>
            <select className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white" value={estado} onChange={(e) => setEstado(e.target.value as any)}>
              <option value="pendiente">Pendiente</option>
              <option value="ubicacion_identificada">Ubicación identificada</option>
              <option value="instalado">Instalado</option>
              <option value="verificado">Verificado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
            <textarea className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={guardando} className="w-full bg-blue-600 text-white font-semibold rounded-xl px-5 py-3">
              {guardando ? 'Guardando...' : 'Guardar Nodo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}