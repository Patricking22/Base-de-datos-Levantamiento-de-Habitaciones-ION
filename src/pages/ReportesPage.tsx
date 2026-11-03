import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, Download, FileText, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function ReportesPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // --- EXPORTAR A EXCEL ---
  const exportarExcel = async () => {
    setLoading(true)
    try {
      // 1. Traer todos los datos con sus relaciones
      const { data: pisos } = await supabase.from('pisos').select('*').order('numero')
      
      // Traer habitaciones, camas, etc., y aplanar los datos para el Excel
      const filas = []
      
      for (const piso of pisos || []) {
        const { data: habs } = await supabase.from('habitaciones').select('*').eq('piso_id', piso.id)
        
        for (const hab of habs || []) {
          const { data: camas } = await supabase.from('camas').select('*').eq('habitacion_id', hab.id)
          const { data: tomas } = await supabase.from('tomacorrientes').select('*').eq('habitacion_id', hab.id)
          const { data: nodos } = await supabase.from('nodos').select('*').eq('habitacion_id', hab.id)
          
          // Si la habitación no tiene camas registradas, igual la incluimos
          if (!camas || camas.length === 0) {
            filas.push({
              'Piso': piso.numero,
              'Habitación': hab.numero,
              'Cama': '-',
              'Largo (cm)': '-',
              'Ancho (cm)': '-',
              'Distancia al Nodo (m)': '-',
              'Tomacorrientes': tomas?.length || 0,
              'Estado Nodo': nodos?.[0]?.estado || 'No registrado',
              'Ubicación Nodo': nodos?.[0]?.ubicacion_propuesta || '-'
            })
          } else {
            // Si tiene camas, creamos una fila por cada cama
            camas.forEach(cama => {
              filas.push({
                'Piso': piso.numero,
                'Habitación': hab.numero,
                'Cama': cama.numero_cama,
                'Largo (cm)': cama.largo_cm || '',
                'Ancho (cm)': cama.ancho_cm || '',
                'Distancia al Nodo (m)': cama.distancia_nodo_m || '',
                'Tomacorrientes': tomas?.length || 0,
                'Estado Nodo': nodos?.[0]?.estado || 'No registrado',
                'Ubicación Nodo': nodos?.[0]?.ubicacion_propuesta || '-'
              })
            })
          }
        }
      }

      // 2. Generar el archivo
      const ws = XLSX.utils.json_to_sheet(filas)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Levantamiento")
      XLSX.writeFile(wb, "Levantamiento_ION.xlsx")
      
    } catch (error) {
      alert('Error al exportar Excel')
      console.error(error)
    }
    setLoading(false)
  }

  // --- EXPORTAR A PDF POR PISO ---
  const exportarPDF = async () => {
    setLoading(true)
    try {
      const { data: pisos } = await supabase.from('pisos').select('*').order('numero')
      const doc = new jsPDF()
      
      for (const piso of pisos || []) {
        const { data: habs } = await supabase.from('habitaciones').select('*').eq('piso_id', piso.id).order('numero')
        
        if (!habs || habs.length === 0) continue

        // Título del piso
        doc.setFontSize(16)
        doc.text(`Reporte Técnico - Piso ${piso.numero}`, 14, 20)
        
        // Tabla de habitaciones
        const tableData = []
        
        for (const hab of habs) {
          const { data: camas } = await supabase.from('camas').select('*').eq('habitacion_id', hab.id)
          const { data: nodos } = await supabase.from('nodos').select('*').eq('habitacion_id', hab.id).single()
          
          tableData.push([
            hab.numero,
            camas?.length || 0,
            camas?.map(c => c.distancia_nodo_m ? `${c.distancia_nodo_m}m` : '-').join(', ') || '-',
            nodos?.estado || 'Pendiente',
            nodos?.ubicacion_propuesta || '-'
          ])
        }

        autoTable(doc, {
          startY: 30,
          head: [['Habitación', 'Camas', 'Distancias al Nodo', 'Estado del Nodo', 'Ubicación Nodo']],
          body: tableData,
        })
        
        doc.addPage()
      }

      // Borrar la última página en blanco
      const pageCount = doc.getNumberOfPages()
      doc.deletePage(pageCount)

      doc.save("Reporte_Levantamiento.pdf")
    } catch (error) {
      alert('Error al exportar PDF')
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-500">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Reportes y Exportación</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Descargar Datos</h2>
            <p className="text-sm text-slate-500">Exporta la información para presupuestos y análisis.</p>
          </div>
          
          <button
            onClick={exportarExcel}
            disabled={loading}
            className="w-full flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl active:bg-green-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
              <div className="text-left">
                <div className="font-bold text-green-900">Exportar a Excel</div>
                <div className="text-xs text-green-700">Tabla completa para presupuestos</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-green-600" />
          </button>

          <button
            onClick={exportarPDF}
            disabled={loading}
            className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl active:bg-red-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-red-600" />
              <div className="text-left">
                <div className="font-bold text-red-900">Exportar a PDF</div>
                <div className="text-xs text-red-700">Reporte técnico por piso</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </main>
    </div>
  )
}