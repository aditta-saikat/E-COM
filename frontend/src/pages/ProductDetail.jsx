import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Loader2, Minus, Package, Plus, ShoppingCart } from 'lucide-react'
import { getProduct } from '../api/products'
import { formatPrice } from '../lib/formatPrice'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const { currentUser } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch(() => setError('Product not found'))
  }, [id])

  const handleAddToCart = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    setAdding(true)
    try {
      await addItem(product._id, quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    } finally {
      setAdding(false)
    }
  }

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

      {product.stock > 0 && (
        <div className="mt-8 flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-medium text-slate-900 dark:text-slate-100">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              className="p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : added ? (
              <Check size={16} />
            ) : (
              <ShoppingCart size={16} />
            )}
            {added ? 'Added to cart' : 'Add to cart'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
