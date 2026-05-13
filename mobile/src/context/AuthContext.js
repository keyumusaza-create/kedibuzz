import { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      try {
        const res = await api.get('/accounts/users/me/')
        setUser(res.data)
      } catch (err) {
        await AsyncStorage.removeItem('token')
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    const res = await api.post('/accounts/login/login/', { email, password })
    const { access, user: userData } = res.data
    await AsyncStorage.setItem('token', access)
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`
    setUser(userData)
    return userData
  }

  const logout = async () => {
    await AsyncStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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