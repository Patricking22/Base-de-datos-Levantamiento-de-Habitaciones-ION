import { useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { MarcaFoto } from '../types/database'
import { X, Save } from 'lucide-react'

interface Props {
  foto: any // Incluye la urlFirmada
  onClose: () => void
  onSaved: () => void
}

export default function VisorFoto({ foto, onClose, onSaved }: Props) {
  const [marcas, setMarcas] = useState<MarcaFoto[]>(foto.marcas || [])
  const [tipoMarca, setTipoMarca] = useState<'cama' | 'tomacorriente' | 'nodo' | 'canalizacion' | 'otro'>('cama')
  const [guardando, setGuardando] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const colores = {
    cama: 'bg-blue-500',
    tomacorriente: 'bg-yellow-500',
    nodo: 'bg-red-500',
    canalizacion: 'bg-purple-500',
    otro: 'bg-slate-500'
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    
    // Calcular porcentajes (0-100) para que funcione en cualquier tamaño de pantalla
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const nuevaMarca: MarcaFoto = { x, y, tipo: tipoMarca }
    setMarcas([...marcas, nuevaMarca])
  }

  const guardarMarcas = async () => {
    setGuardando(true)
    const { error } = await supabase
      .from('fotografias')
      .update({ marcas })
      .eq('id', foto.id)

    if (error) alert('Error al guardar: ' + error.message)
    
    setGuardando(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Cabecera */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <h2 className="font-semibold">Marcar Fotografía</h2>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Selector de herramientas */}
      <div className="p-3 bg-black/50 flex flex-wrap gap-2 justify-center">
        {(['cama', 'tomacorriente', 'nodo', 'canalizacion', 'otro'] as const).map((tipo) => (
          <button
            key={tipo}
            onClick={() => setTipoMarca(tipo)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border ${
              tipoMarca === tipo ? 'border-white bg-white/20 text-white' : 'border-transparent text-slate-300'
            }`}
          >
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${colores[tipo]}`}></span>
            {tipo}
          </button>
        ))}
      </div>

      {/* Área de la imagen */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        <div className="relative inline-block max-h-full">
          <img
            ref={imgRef}
            src={foto.urlFirmada}
            alt="Foto"
            className="max-h-[60vh] max-w-full object-contain cursor-crosshair"
            onClick={handleImageClick}
          />
          
          {/* Dibujar marcas */}
          {marcas.map((marca, i) => (
            <div
              key={i}
              className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 ${colores[marca.tipo]}`}
              style={{ left: `${marca.x}%`, top: `${marca.y}%` }}
              title={marca.tipo}
            />
          ))}
        </div>
      </div>

      {/* Botón guardar */}
      <div className="p-4 bg-black/50">
        <button
          onClick={guardarMarcas}
          disabled={guardando}
          className="w-full bg-blue-600 text-white font-semibold rounded-xl px-5 py-3 flex items-center justify-center gap-2 active:bg-blue-700"
        >
          {guardando ? 'Guardando...' : <><Save className="w-5 h-5" /> Guardar Marcas</>}
        </button>
        <p className="text-center text-xs text-slate-400 mt-2">
          Toca la imagen para colocar un pin del color seleccionado.
        </p>
      </div>
    </div>
  )
}