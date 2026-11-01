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

// Every request goes through the API gateway, which routes it to the right service by URL prefix.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const authClient = createServiceClient(API_URL)
export const catalogClient = createServiceClient(API_URL)
export const cartClient = createServiceClient(API_URL)
export const orderClient = createServiceClient(API_URL)
