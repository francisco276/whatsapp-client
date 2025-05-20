import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_WHATSAPP_API,
  timeout: 0
})

export { api }
