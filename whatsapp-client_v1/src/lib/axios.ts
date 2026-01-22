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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export { api }
