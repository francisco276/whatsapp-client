import axios from 'axios'

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_WHATSAPP_API) {
    return import.meta.env.VITE_WHATSAPP_API
  }
  return 'https://3e5729a4-02a3-4a8c-8eba-aadd16aa74f8-00-3a2yr3uhnetzl.spock.replit.dev/api/v1'
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
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
