import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import PisosPage from './pages/PisosPage'
import PisoDetallePage from './pages/PisoDetallePage'
import HabitacionPage from './pages/HabitacionPage'
import ReportesPage from './pages/ReportesPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PisosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/piso/:id"
          element={
            <ProtectedRoute>
              <PisoDetallePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/habitacion/:id"
          element={
            <ProtectedRoute>
              <HabitacionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <ReportesPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}