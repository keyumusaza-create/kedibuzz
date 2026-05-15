import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  if (user.role === 'instructor') return <Navigate to="/instructor" replace />
  if (user.role === 'learner') return <Navigate to="/my-learning" replace />

  // Unknown role — go back to login to avoid a redirect loop
  return <Navigate to="/login" replace />
}