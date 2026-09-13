import axios from 'axios'
import { getToken } from '../lib/token'

const createServiceClient = (baseURL) => {
  const client = axios.create({ baseURL })

  client.interceptors.request.use((config) => {
    const token = getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  return client
}

export const authClient = createServiceClient(import.meta.env.VITE_AUTH_SERVICE_URL)
export const catalogClient = createServiceClient(import.meta.env.VITE_PRODUCT_CATALOG_URL)
