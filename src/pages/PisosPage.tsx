import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import type { Piso } from '../types/database'
import { Building2, LogOut, Plus, FileSpreadsheet } from 'lucide-react'

export default function PisosPage() {
  const { signOut } = useAuth()
  const [pisos, setPisos] = useState<Piso[]>([])
  const [loading, setLoading] = useState(true)

  const cargarPisos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('pisos')
      .select('*')
      .order('numero', { ascending: true })
    if (!error && data) setPisos(data as Piso[])
    setLoading(false)
  }

  useEffect(() => {
    cargarPisos()
  }, [])

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">Pisos</h1>
          <button
            onClick={signOut}
            className="text-slate-500 hover:text-slate-700 p-2"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {loading && (
          <div className="text-center text-slate-500 py-12">Cargando pisos...</div>
        )}

        {!loading && pisos.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 text-center text-slate-500">
            No hay pisos registrados todavía.
          </div>
        )}

        {pisos.map((piso) => (
          <Link
            key={piso.id}
            to={`/piso/${piso.id}`}
            className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 active:bg-slate-50"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-blue-700" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">
                {piso.nombre ?? `Piso ${piso.numero}`}
              </div>
              <div className="text-sm text-slate-500">Piso {piso.numero}</div>
            </div>
          </Link>
        ))}

        <button className="w-full bg-white text-blue-700 border border-blue-300 font-semibold rounded-xl px-5 py-3 active:bg-blue-50 transition-colors flex items-center justify-center gap-2 mt-4">
          <Plus className="w-5 h-5" /> Agregar piso
        </button>

        <Link 
          to="/reportes"
          className="w-full bg-slate-800 text-white font-semibold rounded-xl px-5 py-3 active:bg-slate-900 transition-colors flex items-center justify-center gap-2 mt-4"
        >
          <FileSpreadsheet className="w-5 h-5" /> Ver Reportes y Exportar
        </Link>
      </main>
    </div>
  )
}