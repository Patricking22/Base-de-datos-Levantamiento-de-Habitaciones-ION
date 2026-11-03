import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Fotografia } from '../types/database'
import { Camera, Image as ImageIcon, Trash2, Loader2, MapPin  } from 'lucide-react'
import VisorFoto from './VisorFoto'

export default function TabFotos({ habitacionId }: { habitacionId: string }) {
  const [fotos, setFotos] = useState<Fotografia[]>([])
  const [loading, setLoading] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [fotoSeleccionada, setFotoSeleccionada] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const cargarFotos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('fotografias')
      .select('*')
      .eq('entidad_tipo', 'habitacion')
      .eq('entidad_id', habitacionId)
      .order('created_at', { ascending: false })
    
    if (data) {
      const fotosConUrl = await Promise.all(data.map(async (foto) => {
        const { data: urlData } = await supabase.storage
          .from('fotos-levantamiento')
          .createSignedUrl(foto.storage_path, 3600)
        
        return { ...foto, urlFirmada: urlData?.signedUrl }
      }))
      setFotos(fotosConUrl as any[])
    }
    setLoading(false)
  }

  useEffect(() => {
    cargarFotos()
  }, [habitacionId])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSubiendo(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${habitacionId}/${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fotos-levantamiento')
      .upload(fileName, file)

    if (uploadError) {
      alert('Error al subir foto: ' + uploadError.message)
      setSubiendo(false)
      return
    }

    await supabase
      .from('fotografias')
      .insert({
        entidad_tipo: 'habitacion',
        entidad_id: habitacionId,
        storage_path: uploadData.path,
      })

    await cargarFotos()
    setSubiendo(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const eliminarFoto = async (e: React.MouseEvent, foto: Fotografia) => {
    e.stopPropagation() // Evita que se abra el visor al borrar
    if (!confirm('¿Seguro que deseas eliminar esta foto?')) return

    await supabase.storage.from('fotos-levantamiento').remove([foto.storage_path])
    await supabase.from('fotografias').delete().eq('id', foto.id)
    cargarFotos()
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <Camera className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Fotografías de la Habitación</h3>
          <p className="text-sm text-slate-500 mt-1">Captura desde la cámara o galería</p>
        </div>
        
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={subiendo}
          className="w-full bg-blue-600 text-white font-semibold rounded-xl px-5 py-3 active:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {subiendo ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo...</>
          ) : (
            <><Camera className="w-5 h-5" /> Tomar / Subir Foto</>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500">Cargando fotos...</div>
      ) : fotos.length === 0 ? (
        <div className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-slate-200">
          <ImageIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          No hay fotos en esta habitación.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {fotos.map((foto: any) => (
            <div 
              key={foto.id} 
              onClick={() => setFotoSeleccionada(foto)}
              className="relative group bg-slate-200 rounded-xl overflow-hidden aspect-square shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            >
              {foto.urlFirmada ? (
                <img src={foto.urlFirmada} alt="Foto habitación" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-slate-400">Error</div>
              )}

              {/* Indicador de que tiene marcas */}
              {foto.marcas && foto.marcas.length > 0 && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {foto.marcas.length}
                </div>
              )}
              
              <button
                onClick={(e) => eliminarFoto(e, foto)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg shadow-md opacity-90 z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Visor Modal */}
      {fotoSeleccionada && (
        <VisorFoto 
          foto={fotoSeleccionada} 
          onClose={() => setFotoSeleccionada(null)} 
          onSaved={() => {
            setFotoSeleccionada(null)
            cargarFotos()
          }} 
        />
      )}
    </div>
  )
}