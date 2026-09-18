import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Package } from 'lucide-react'
import { getProduct } from '../api/products'
import { formatPrice } from '../lib/formatPrice'

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
    return <p className="p-6 text-sm text-rose-600 dark:text-rose-400">{error}</p>
  }

  if (!product) {
    return <p className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6 flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-300 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-500">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <Package size={56} strokeWidth={1.5} />
        )}
      </div>

      <span className="mb-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize dark:bg-slate-800 dark:text-slate-300">
        {product.category}
      </span>

      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{product.name}</h1>

      <p className="mt-4 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
        {formatPrice(product.price, product.currency)}
      </p>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
      </p>

      {product.description && (
        <p className="mt-6 leading-relaxed text-slate-700 dark:text-slate-300">{product.description}</p>
      )}
    </div>
  )
}

export default ProductDetail
