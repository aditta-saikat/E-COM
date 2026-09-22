import { catalogClient } from './client'

export const listProducts = async ({ search, category, page, shopId } = {}) => {
  const response = await catalogClient.get('/api/products', {
    params: { search, category, page, shopId },
  })
  return response.data
}

export const getProduct = async (id) => {
  const response = await catalogClient.get(`/api/products/${id}`)
  return response.data
}

export const createProduct = async (product) => {
  const response = await catalogClient.post('/api/products', product)
  return response.data
}

export const updateProduct = async (id, updates) => {
  const response = await catalogClient.patch(`/api/products/${id}`, updates)
  return response.data
}

export const deleteProduct = async (id) => {
  await catalogClient.delete(`/api/products/${id}`)
}
