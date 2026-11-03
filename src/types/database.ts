export interface Piso {
  id: string
  numero: string
  nombre: string | null
  created_at: string
}

export interface Habitacion {
  id: string
  piso_id: string
  numero: string
  cantidad_camas: number
  observaciones: string | null
  estado: 'pendiente' | 'en_progreso' | 'completa'
  created_at: string
}

export interface Cama {
  id: string
  habitacion_id: string
  numero_cama: string
  largo_cm: number | null
  ancho_cm: number | null
  distancia_nodo_m: number | null
  ubicacion: string | null
  observacion: string | null
  created_at: string
}

export interface Tomacorriente {
  id: string
  habitacion_id: string
  identificacion: string | null
  ubicacion: string | null
  estado: 'funcional' | 'no_funcional' | 'pendiente'
  distancia_nodo_m: number | null
  observacion: string | null
  created_at: string
}

export interface Nodo {
  id: string
  habitacion_id: string
  ubicacion_propuesta: string | null
  distancia_central_m: number | null
  alimentacion_disponible: boolean
  estado: 'pendiente' | 'ubicacion_identificada' | 'instalado' | 'verificado'
  observaciones: string | null
  created_at: string
}

export interface Fotografia {
  id: string
  entidad_tipo: 'habitacion' | 'cama' | 'tomacorriente' | 'nodo' | 'central' | 'elemento' | 'piso'
  entidad_id: string
  storage_path: string
  descripcion: string | null
  marcas: MarcaFoto[]
  created_at: string
}

export interface MarcaFoto {
  x: number
  y: number
  tipo: 'cama' | 'tomacorriente' | 'nodo' | 'canalizacion' | 'otro'
  etiqueta?: string
}