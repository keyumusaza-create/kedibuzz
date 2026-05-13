import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const api = axios.create({
  baseURL: 'http://10.0.2.2:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export default api