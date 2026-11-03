import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Cama } from '../types/database'
import { Plus, Ruler, ArrowRight, MapPin } from 'lucide-react'
import ModalCama from './ModalCama'

export default function TabCamas({ habitacionId }: { habitacionId: string }) {
  const [camas, setCamas] = useState<Cama[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [camaSeleccionada, setCamaSeleccionada] = useState<Cama | null>(null)

  const cargarCamas = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('camas')
      .select('*')
      .eq('habitacion_id', habitacionId)
      .order('created_at', { ascending: true })
    
    if (data) setCamas(data as Cama[])
    setLoading(false)
  }

  useEffect(() => {
    cargarCamas()
  }, [habitacionId])

  const abrirParaEditar = (cama: Cama) => {
    setCamaSeleccionada(cama)
    setModalAbierto(true)
  }

  const abrirParaCrear = () => {
    setCamaSeleccionada(null)
    setModalAbierto(true)
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Cargando camas...</div>

  return (
    <div className="space-y-3">
      {camas.length === 0 && (
        <div className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-slate-200">
          No hay camas registradas.
        </div>
      )}

      {camas.map((cama) => (
        <div
          key={cama.id}
          onClick={() => abrirParaEditar(cama)}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 active:bg-slate-50 cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-900 text-lg">{cama.numero_cama}</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">Editar</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
            {(cama.largo_cm || cama.ancho_cm) && (
              <div className="flex items-center gap-1">
                <Ruler className="w-4 h-4 text-slate-400" />
                {cama.largo_cm ?? '?'} x {cama.ancho_cm ?? '?'} cm
              </div>
            )}
            {cama.distancia_nodo_m !== null && (
              <div className="flex items-center gap-1">
                <ArrowRight className="w-4 h-4 text-slate-400" />
                {cama.distancia_nodo_m} m al nodo
              </div>
            )}
            {cama.ubicacion && (
              <div className="flex items-center gap-1 col-span-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                {cama.ubicacion}
              </div>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={abrirParaCrear}
        className="w-full bg-white text-blue-700 border border-blue-300 font-semibold rounded-xl px-5 py-3 active:bg-blue-50 transition-colors flex items-center justify-center gap-2 mt-4"
      >
        <Plus className="w-5 h-5" /> Agregar Cama
      </button>

      {modalAbierto && (
        <ModalCama
          habitacionId={habitacionId}
          camaExistente={camaSeleccionada}
          onClose={() => setModalAbierto(false)}
          onSaved={() => {
            setModalAbierto(false)
            cargarCamas()
          }}
        />
      )}
    </div>
  )
}