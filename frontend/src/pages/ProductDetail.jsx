import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct } from '../api/products'

const formatPrice = (minorUnits, currency) =>
  new Intl.NumberFormat('en-BD', { style: 'currency', currency }).format(minorUnits / 100)

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch(() => setError('Product not found'))
  }, [id])

  if (error) {
    return <p className="p-6 text-sm text-rose-600">{error}</p>
  }

  if (!product) {
    return <p className="p-6 text-sm text-slate-500">Loading...</p>
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6 aspect-video rounded-lg bg-linear-to-br from-indigo-100 to-cyan-100" />
      <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
      <p className="mt-1 text-sm text-slate-500">{product.category}</p>
      <p className="mt-4 text-xl font-semibold text-indigo-600">
        {formatPrice(product.price, product.currency)}
      </p>
      <p className="mt-4 text-sm text-slate-500">{product.stock} in stock</p>
      {product.description && <p className="mt-4 text-slate-700">{product.description}</p>}
    </div>
  )
}

export default ProductDetail
