import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, Minus, Package, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { formatPrice } from '../lib/formatPrice'
import EmptyState from '../components/EmptyState'
import OrderSummary from '../components/OrderSummary'
import PageHeader from '../components/PageHeader'
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
    <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 py-5 first:pt-0 last:border-b-0 last:pb-0 dark:border-slate-800">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-300 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-500">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <Package size={28} strokeWidth={1.5} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          to={`/products/${item.productId}`}
          className="block truncate font-medium text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
        >
          {item.name}
        </Link>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {formatPrice(item.price, item.currency)} each
        </p>
      </div>

      <div className="flex items-center rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800/50">
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
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is empty"
        description="Browse products and add something you like."
        action={{ to: '/products', label: 'Browse products' }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader icon={ShoppingCart} title="Your cart" subtitle="Review your items before checking out." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          {items.map((item) => (
            <CartLineItem key={item.productId} item={item} onUpdate={updateItem} onRemove={removeItem} />
          ))}
        </div>

        <OrderSummary items={items} subtotal={cart.subtotal}>
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 dark:bg-indigo-500/90 dark:hover:bg-indigo-500"
          >
            Proceed to checkout
            <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
          </button>
          <Link
            to="/products"
            className="mt-3 block text-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Continue shopping
          </Link>
        </OrderSummary>
      </div>
    </div>
  )
}

export default Cart
