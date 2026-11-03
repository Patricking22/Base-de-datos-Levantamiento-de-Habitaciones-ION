import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { Hospital } from 'lucide-react'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    if (error) setError(error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-slate-50">
      <div className="max-w-sm mx-auto w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-4">
            <Hospital className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 text-center">
            Levantamiento Técnico
          </h1>
          <p className="text-slate-500 text-center mt-1">
            Instituto Oncológico Nacional
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-semibold rounded-xl px-5 py-3 active:bg-blue-700 transition-colors" 
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="text-xs text-slate-400 text-center mt-6">
          Acceso restringido al personal autorizado
        </p>
      </div>
    </div>
  )
}