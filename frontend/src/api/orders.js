import { orderClient } from './client'

export const createOrder = async (shippingAddress) => {
  const response = await orderClient.post('/api/orders', { shippingAddress })
  return response.data
}

export const listOrders = async () => {
  const response = await orderClient.get('/api/orders')
  return response.data
}

export const getOrder = async (id) => {
  const response = await orderClient.get(`/api/orders/${id}`)
  return response.data
}

export const listAllOrders = async ({ shopId, status } = {}) => {
  const response = await orderClient.get('/api/orders/admin', { params: { shopId, status } })
  return response.data
}
