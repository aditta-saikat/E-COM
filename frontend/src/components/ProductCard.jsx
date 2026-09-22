import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Loader2, Package, ShoppingCart } from 'lucide-react'
import { formatPrice } from '../lib/formatPrice'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const ProductCard = ({ product }) => {
  const { currentUser } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddToCart = async (event) => {
    event.preventDefault()

    if (!currentUser) {
      navigate('/login')
      return
    }

    setAdding(true)
    try {
      await addItem(product._id, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-300 transition group-hover:text-indigo-400 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-500">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <Package size={36} strokeWidth={1.5} />
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="absolute top-2 right-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              Low stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-2 right-2 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
              Out of stock
            </span>
          )}
        </div>
        <div className="px-4 pt-4">
          <h3 className="truncate font-medium text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
            {product.name}
          </h3>
          <p className="text-sm text-slate-500 capitalize dark:text-slate-400">{product.category}</p>
          <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>
      </Link>

      <div className="p-4 pt-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
        >
          {adding ? (
            <Loader2 size={14} className="animate-spin" />
          ) : added ? (
            <Check size={14} />
          ) : (
            <ShoppingCart size={14} />
          )}
          {added ? 'Added' : 'Add to cart'}
        </button>
      </div>
    </div>
  )
}

export default ProductCard
