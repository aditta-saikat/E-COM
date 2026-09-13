import { authClient } from './client'

export const signup = async ({ email, password, displayName }) => {
  const response = await authClient.post('/api/auth/signup', { email, password, displayName })
  return response.data
}

export const login = async ({ email, password }) => {
  const response = await authClient.post('/api/auth/login', { email, password })
  return response.data
}
