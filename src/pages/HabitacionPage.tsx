import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Habitacion, Piso } from '../types/database'
import { ArrowLeft, BedDouble, Plug, Cpu, Camera } from 'lucide-react'

// Importaremos estos componentes luego
import TabCamas from '../components/TabCamas'
import TabTomacorrientes from '../components/TabTomacorrientes'
import TabNodo from '../components/TabNodo'
import TabFotos from '../components/TabFotos'

export default function HabitacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [habitacion, setHabitacion] = useState<Habitacion | null>(null)
  const [piso, setPiso] = useState<Piso | null>(null)
  const [loading, setLoading] = useState(true)
  const [tabActiva, setTabActiva] = useState<'camas' | 'tomacorrientes' | 'nodo' | 'fotos'>('camas')

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true)
      const { data: habData } = await supabase
        .from('habitaciones')
        .select('*, pisos(*)')
        .eq('id', id)
        .single()
      
      if (habData) {
        setHabitacion(habData as Habitacion)
        setPiso(habData.pisos as Piso)
      }
      setLoading(false)
    }
    cargarDatos()
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Cargando...</div>
  if (!habitacion || !piso) return <div className="min-h-screen flex items-center justify-center text-slate-500">Habitación no encontrada</div>

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(`/piso/${piso.id}`)} className="p-2 -ml-2 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Habitación {habitacion.numero}</h1>
            <p className="text-sm text-slate-500">{piso.nombre ?? `Piso ${piso.numero}`}</p>
          </div>
        </div>
        
        {/* Navegación por Pestañas */}
        <div className="max-w-2xl mx-auto px-4 flex overflow-x-auto hide-scrollbar">
          <button onClick={() => setTabActiva('camas')} className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 border-b-2 text-sm font-medium ${tabActiva === 'camas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
            <BedDouble className="w-5 h-5" /> Camas
          </button>
          <button onClick={() => setTabActiva('tomacorrientes')} className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 border-b-2 text-sm font-medium ${tabActiva === 'tomacorrientes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
            <Plug className="w-5 h-5" /> Enchufes
          </button>
          <button onClick={() => setTabActiva('nodo')} className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 border-b-2 text-sm font-medium ${tabActiva === 'nodo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
            <Cpu className="w-5 h-5" /> Nodo
          </button>
          <button onClick={() => setTabActiva('fotos')} className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 border-b-2 text-sm font-medium ${tabActiva === 'fotos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
            <Camera className="w-5 h-5" /> Fotos
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {tabActiva === 'camas' && <TabCamas habitacionId={habitacion.id} />}
        {tabActiva === 'tomacorrientes' && <TabTomacorrientes habitacionId={habitacion.id} />}
        {tabActiva === 'nodo' && <TabNodo habitacionId={habitacion.id} />}
        {tabActiva === 'fotos' && <TabFotos habitacionId={habitacion.id} />}
      </main>
    </div>
  )
}