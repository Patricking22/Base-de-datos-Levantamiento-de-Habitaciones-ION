import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Tomacorriente } from '../types/database'
import { Plus, ArrowRight, MapPin } from 'lucide-react'
import ModalTomacorriente from './ModalTomacorriente'

export default function TabTomacorrientes({ habitacionId }: { habitacionId: string }) {
  const [elementos, setElementos] = useState<Tomacorriente[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [seleccionado, setSeleccionado] = useState<Tomacorriente | null>(null)

  const cargar = async () => {
    setLoading(true)
    const { data } = await supabase.from('tomacorrientes').select('*').eq('habitacion_id', habitacionId).order('created_at')
    if (data) setElementos(data as Tomacorriente[])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [habitacionId])

  if (loading) return <div className="text-center py-8 text-slate-500">Cargando...</div>

  return (
    <div className="space-y-3">
      {elementos.length === 0 && <div className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-slate-200">No hay tomacorrientes registrados.</div>}

      {elementos.map((el) => (
        <div key={el.id} onClick={() => { setSeleccionado(el); setModalAbierto(true) }} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 active:bg-slate-50 cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-900">{el.identificacion || 'Tomacorriente'}</h3>
            <span className={`text-xs px-2 py-1 rounded-md font-medium ${el.estado === 'funcional' ? 'bg-green-100 text-green-700' : el.estado === 'no_funcional' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
              {el.estado.replace('_', ' ')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mt-2">
            {el.distancia_nodo_m !== null && <div className="flex items-center gap-1"><ArrowRight className="w-4 h-4 text-slate-400" /> {el.distancia_nodo_m} m al nodo</div>}
            {el.ubicacion && <div className="flex items-center gap-1 col-span-2"><MapPin className="w-4 h-4 text-slate-400" /> {el.ubicacion}</div>}
          </div>
        </div>
      ))}

      <button onClick={() => { setSeleccionado(null); setModalAbierto(true) }} className="w-full bg-white text-blue-700 border border-blue-300 font-semibold rounded-xl px-5 py-3 active:bg-blue-50 transition-colors flex items-center justify-center gap-2 mt-4">
        <Plus className="w-5 h-5" /> Agregar Tomacorriente
      </button>

      {modalAbierto && <ModalTomacorriente habitacionId={habitacionId} elementoExistente={seleccionado} onClose={() => setModalAbierto(false)} onSaved={() => { setModalAbierto(false); cargar() }} />}
    </div>
  )
}