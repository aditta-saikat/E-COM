import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Package } from 'lucide-react'
import { getOrder } from '../api/orders'
import { formatPrice } from '../lib/formatPrice'

const STATUS_META = {
  pending_payment: { label: 'Pending payment', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  payment_failed: { label: 'Payment failed', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  failed_stock: { label: 'Stock unavailable', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
}

const OrderDetail = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getOrder(id)
      .then((data) => setOrder(data.order || data))
      .catch(() => setError('Could not load this order'))
  }, [id])

  if (error) {
    return <p className="p-6 text-sm text-rose-600 dark:text-rose-400">{error}</p>
  }

  if (!order) {
    return <p className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
  }

  const meta = STATUS_META[order.status] || STATUS_META.pending_payment

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ChevronLeft size={15} /> Back to orders
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}>{meta.label}</span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        {order.items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 border-b border-slate-200 py-4 first:pt-0 last:border-b-0 last:pb-0 dark:border-slate-800"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-300 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-500">
              <Package size={22} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {item.quantity} × {formatPrice(item.price, order.currency)}
              </p>
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {formatPrice(item.subtotal, order.currency)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 font-medium text-slate-900 dark:text-slate-100">Shipping</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{order.shippingAddress?.fullName}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{order.shippingAddress?.phone}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{order.shippingAddress?.address}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 font-medium text-slate-900 dark:text-slate-100">Total</h2>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatPrice(order.total, order.currency)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
