import { catalogClient } from './client'

export const listShops = async () => {
  const response = await catalogClient.get('/api/shops')
  return response.data
}

export const listPendingShops = async () => {
  const response = await catalogClient.get('/api/shops/pending')
  return response.data
}

export const getMyShop = async () => {
  const response = await catalogClient.get('/api/shops/mine')
  return response.data
}

export const requestShop = async ({ name, description }) => {
  const response = await catalogClient.post('/api/shops', { name, description })
  return response.data
}

export const updateShop = async (id, updates) => {
  const response = await catalogClient.patch(`/api/shops/${id}`, updates)
  return response.data
}

export const approveShop = async (id) => {
  const response = await catalogClient.post(`/api/shops/${id}/approve`)
  return response.data
}

export const rejectShop = async (id, reason) => {
  const response = await catalogClient.post(`/api/shops/${id}/reject`, { reason })
  return response.data
}
