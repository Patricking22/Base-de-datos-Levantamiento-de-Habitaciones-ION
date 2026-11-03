import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { X } from 'lucide-react'
import type { Cama } from '../types/database'

interface Props {
  habitacionId: string
  camaExistente: Cama | null
  onClose: () => void
  onSaved: () => void
}

export default function ModalCama({ habitacionId, camaExistente, onClose, onSaved }: Props) {
  const [numeroCama, setNumeroCama] = useState('')
  const [largo, setLargo] = useState('')
  const [ancho, setAncho] = useState('')
  const [distancia, setDistancia] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [observacion, setObservacion] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (camaExistente) {
      setNumeroCama(camaExistente.numero_cama || '')
      setLargo(camaExistente.largo_cm?.toString() || '')
      setAncho(camaExistente.ancho_cm?.toString() || '')
      setDistancia(camaExistente.distancia_nodo_m?.toString() || '')
      setUbicacion(camaExistente.ubicacion || '')
      setObservacion(camaExistente.observacion || '')
    }
  }, [camaExistente])

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!numeroCama.trim()) return
    setGuardando(true)

    const datos = {
      habitacion_id: habitacionId,
      numero_cama: numeroCama,
      largo_cm: largo ? parseFloat(largo) : null,
      ancho_cm: ancho ? parseFloat(ancho) : null,
      distancia_nodo_m: distancia ? parseFloat(distancia) : null,
      ubicacion: ubicacion || null,
      observacion: observacion || null,
    }

    if (camaExistente) {
      // Actualizar
      const { error } = await supabase.from('camas').update(datos).eq('id', camaExistente.id)
      if (error) alert('Error: ' + error.message)
    } else {
      // Insertar nueva
      const { error } = await supabase.from('camas').insert(datos)
      if (error) alert('Error: ' + error.message)
    }

    setGuardando(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {camaExistente ? 'Editar Cama' : 'Nueva Cama'}
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGuardar} className="p-4 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Número / Identificador de cama</label>
            <input
              type="text"
              required
              placeholder="Ej: Cama 1, Cama A..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={numeroCama}
              onChange={(e) => setNumeroCama(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Largo (cm)</label>
              <input
                type="number"
                step="0.1"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={largo}
                onChange={(e) => setLargo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ancho (cm)</label>
              <input
                type="number"
                step="0.1"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={ancho}
                onChange={(e) => setAncho(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Distancia al Nodo (metros)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ej: 2.5"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={distancia}
              onChange={(e) => setDistancia(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación en la habitación</label>
            <input
              type="text"
              placeholder="Ej: Pared izquierda, junto a ventana..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
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
            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-blue-600 text-white font-semibold rounded-xl px-5 py-3 active:bg-blue-700 disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar Cama'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}