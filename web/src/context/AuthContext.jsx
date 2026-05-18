import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = async () => {
    try {
      const res = await api.get('/accounts/users/me/')
      setUser(res.data)
      return res.data
    } catch {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      return null
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchMe().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/accounts/login/login/', { email, password })
    const { access, user: userData, profile_completed } = res.data
    localStorage.setItem('token', access)
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`
    setUser(userData)
    return { user: userData, profile_completed }
  }

  const signup = async (payload) => {
    const res = await api.post('/accounts/users/signup/', payload)
    return res.data
  }

  const updateUser = async (formData) => {
    const res = await api.patch('/accounts/users/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    setUser(res.data)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
