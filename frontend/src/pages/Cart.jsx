import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Minus, Package, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { formatPrice } from '../lib/formatPrice'
import { useCart } from '../context/CartContext'

const CartLineItem = ({ item, onUpdate, onRemove }) => {
  const [busy, setBusy] = useState(false)

  const handleQuantityChange = async (nextQuantity) => {
    if (nextQuantity < 1) return
    setBusy(true)
    try {
      await onUpdate(item.productId, nextQuantity)
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async () => {
    setBusy(true)
    try {
      await onRemove(item.productId)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-4 border-b border-slate-200 py-4 last:border-b-0 dark:border-slate-800">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-300 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-500">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <Package size={24} strokeWidth={1.5} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          to={`/products/${item.productId}`}
          className="truncate font-medium text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
        >
          {item.name}
        </Link>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {formatPrice(item.price, item.currency)} each
        </p>
      </div>

      <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700">
        <button
          type="button"
          disabled={busy}
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <Minus size={13} />
        </button>
        <span className="w-7 text-center text-sm font-medium text-slate-900 dark:text-slate-100">
          {item.quantity}
        </span>
        <button
          type="button"
          disabled={busy || item.quantity >= item.stock}
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <Plus size={13} />
        </button>
      </div>

      <p className="w-24 shrink-0 text-right font-semibold text-slate-900 dark:text-slate-100">
        {formatPrice(item.price * item.quantity, item.currency)}
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={handleRemove}
        className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button>
    </div>
  )
}

const Cart = () => {
  const { cart, updateItem, removeItem } = useCart()
  const navigate = useNavigate()
  const items = cart.items || []

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400">
          <ShoppingCart size={24} />
        </div>
        <h1 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">Your cart is empty</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Browse products and add something you like.
        </p>
        <Link
          to="/products"
          className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
        >
          Browse products
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Your cart</h1>

      <div className="rounded-2xl border border-slate-200 bg-white px-5 dark:border-slate-800 dark:bg-slate-900">
        {items.map((item) => (
          <CartLineItem key={item.productId} item={item} onUpdate={updateItem} onRemove={removeItem} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Subtotal</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatPrice(cart.subtotal, items[0]?.currency)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/checkout')}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
        >
          Checkout
        </button>
      </div>
    </div>
  )
}

export default Cart
