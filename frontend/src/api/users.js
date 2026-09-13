import { authClient } from './client'

export const getCurrentUserProfile = async () => {
  const response = await authClient.get('/api/users/me')
  return response.data.user
}

export const updateCurrentUserProfile = async (updates) => {
  const response = await authClient.patch('/api/users/me', updates)
  return response.data.user
}
