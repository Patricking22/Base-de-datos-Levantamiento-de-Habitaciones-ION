import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Piso, Habitacion } from '../types/database'
import { ArrowLeft, Plus, DoorOpen, CheckCircle2, Circle } from 'lucide-react'

export default function PisoDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [piso, setPiso] = useState<Piso | null>(null)
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nuevaHab, setNuevaHab] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cargarDatos = async () => {
    setLoading(true)
    
    // Cargar el piso
    const { data: pisoData } = await supabase
      .from('pisos')
      .select('*')
      .eq('id', id)
      .single()
    if (pisoData) setPiso(pisoData as Piso)

    // Cargar las habitaciones
    const { data: habsData } = await supabase
      .from('habitaciones')
      .select('*')
      .eq('piso_id', id)
      .order('numero', { ascending: true })
    if (habsData) setHabitaciones(habsData as Habitacion[])

    setLoading(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [id])

  const agregarHabitacion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevaHab.trim()) return
    setGuardando(true)

    const { error } = await supabase
      .from('habitaciones')
      .insert({
        piso_id: id,
        numero: nuevaHab.trim(),
        estado: 'pendiente'
      })

    if (!error) {
      setNuevaHab('')
      setMostrarForm(false)
      await cargarDatos() // Recargar la lista
    } else {
      alert('Error al crear habitación: ' + error.message)
    }
    setGuardando(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Cargando piso...</div>
  }

  if (!piso) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Piso no encontrado</div>
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{piso.nombre ?? `Piso ${piso.numero}`}</h1>
            <p className="text-sm text-slate-500">{habitaciones.length} habitaciones registradas</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {habitaciones.length === 0 && !mostrarForm && (
          <div className="text-center py-12 text-slate-500">
            Aún no hay habitaciones en este piso.
          </div>
        )}

        {habitaciones.map((hab) => {
          const estaCompleta = hab.estado === 'completa'
          return (
            <Link
              key={hab.id}
              to={`/habitacion/${hab.id}`}
              className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 active:bg-slate-50"
            >
              {estaCompleta ? (
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-slate-300 shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-slate-900">Habitación {hab.numero}</div>
                <div className="text-sm text-slate-500">{hab.cantidad_camas} camas</div>
              </div>
              <DoorOpen className="w-5 h-5 text-slate-400" />
            </Link>
          )
        })}

        {mostrarForm ? (
          <form onSubmit={agregarHabitacion} className="bg-white p-4 rounded-2xl shadow-sm border border-blue-200 space-y-3 mt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número de habitación</label>
              <input
                type="text"
                autoFocus
                placeholder="Ej: 401, 402, A1..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={nuevaHab}
                onChange={(e) => setNuevaHab(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="flex-1 py-3 text-slate-600 font-medium bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando || !nuevaHab.trim()}
                className="flex-1 py-3 text-white font-medium bg-blue-600 rounded-xl disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setMostrarForm(true)}
            className="w-full bg-white text-blue-700 border border-blue-300 font-semibold rounded-xl px-5 py-3 active:bg-blue-50 transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <Plus className="w-5 h-5" /> Agregar habitación
          </button>
        )}
      </main>
    </div>
  )
}