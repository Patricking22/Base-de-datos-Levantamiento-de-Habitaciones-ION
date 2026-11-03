import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Nodo } from '../types/database'
import { Plus, Cpu, ArrowRight, MapPin, Zap } from 'lucide-react'
import ModalNodo from './ModalNodo'

export default function TabNodo({ habitacionId }: { habitacionId: string }) {
  const [nodo, setNodo] = useState<Nodo | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)

  const cargar = async () => {
    setLoading(true)
    const { data } = await supabase.from('nodos').select('*').eq('habitacion_id', habitacionId).single()
    if (data) setNodo(data as Nodo)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [habitacionId])

  if (loading) return <div className="text-center py-8 text-slate-500">Cargando...</div>

  return (
    <div className="space-y-3">
      {nodo ? (
        <div onClick={() => setModalAbierto(true)} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 active:bg-slate-50 cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-lg">Nodo ESP32</h3>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">Editar</span>
          </div>
          
          <div className="space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> <b>Ubicación:</b> {nodo.ubicacion_propuesta || 'No especificada'}</p>
            {nodo.distancia_central_m !== null && <p className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-slate-400" /> <b>A central:</b> {nodo.distancia_central_m} m</p>}
            <p className="flex items-center gap-2"><Zap className="w-4 h-4 text-slate-400" /> <b>Alimentación:</b> {nodo.alimentacion_disponible ? 'Sí disponible' : 'No disponible'}</p>
            <p className="mt-2 text-xs bg-slate-100 inline-block px-2 py-1 rounded text-slate-700"><b>Estado:</b> {nodo.estado.replace('_', ' ').toUpperCase()}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-slate-200">
          No hay nodo registrado en esta habitación.
        </div>
      )}

      {!nodo && (
        <button onClick={() => setModalAbierto(true)} className="w-full bg-white text-blue-700 border border-blue-300 font-semibold rounded-xl px-5 py-3 active:bg-blue-50 transition-colors flex items-center justify-center gap-2 mt-4">
          <Plus className="w-5 h-5" /> Registrar Nodo
        </button>
      )}

      {modalAbierto && <ModalNodo habitacionId={habitacionId} nodoExistente={nodo} onClose={() => setModalAbierto(false)} onSaved={() => { setModalAbierto(false); cargar() }} />}
    </div>
  )
}