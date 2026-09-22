import { cartClient } from './client'

export const getCart = async () => {
  const response = await cartClient.get('/api/cart')
  return response.data
}

export const addToCart = async (productId, quantity = 1) => {
  const response = await cartClient.post('/api/cart/items', { productId, quantity })
  return response.data
}

export const updateCartItem = async (productId, quantity) => {
  const response = await cartClient.patch(`/api/cart/items/${productId}`, { quantity })
  return response.data
}

export const removeCartItem = async (productId) => {
  const response = await cartClient.delete(`/api/cart/items/${productId}`)
  return response.data
}

export const clearCart = async () => {
  await cartClient.delete('/api/cart')
}
