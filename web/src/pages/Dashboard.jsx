import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  if (user?.role === 'instructor') return <Navigate to="/instructor" replace />
  return <Navigate to="/my-learning" replace />
}