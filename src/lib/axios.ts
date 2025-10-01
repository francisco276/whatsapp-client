import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_WHATSAPP_API,
  timeout: 0
})

api.interceptors.request.use((config) => {
  const authorizationToken = localStorage.getItem('auth_token')
  if (authorizationToken) {
    config.headers.Authorization = `Bearer ${authorizationToken}`
  }
  return config
}, error => Promise.reject(error?.response?.data?.message || error))

export { api }
