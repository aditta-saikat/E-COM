import { catalogClient } from './client'

export const listProducts = async ({ search, category, page, shopId, sort } = {}) => {
  const response = await catalogClient.get('/api/products', {
    params: { search, category, page, shopId, sort },
  })
  return response.data
}

// The API returns one page at a time (20 products); this walks every page for screens that need the whole list.
export const listAllProducts = async (params = {}) => {
  const items = []
  let total = 0

  for (let page = 1; page <= 50; page += 1) {
    const result = await listProducts({ ...params, page })
    items.push(...result.items)
    total = result.total

    if (result.items.length === 0 || items.length >= total) break
  }

  return items
}

export const listCategories = async () => {
  const response = await catalogClient.get('/api/products/categories')
  return response.data.items
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

export const getInventorySummary = async () => {
  const response = await catalogClient.get('/api/products/mine/summary')
  return response.data
}
