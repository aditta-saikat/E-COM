import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, ChevronRight } from 'lucide-react'
import { listOrders } from '../api/orders'
import { formatPrice } from '../lib/formatPrice'

const STATUS_META = {
  pending_payment: { label: 'Pending payment', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  payment_failed: { label: 'Payment failed', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  failed_stock: { label: 'Stock unavailable', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
}

const Orders = () => {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listOrders()
      .then((data) => setOrders(data.items))
      .catch(() => setError('Could not load your orders'))
  }, [])

  if (error) {
    return <p className="p-6 text-sm text-rose-600 dark:text-rose-400">{error}</p>
  }

  if (!orders) {
    return <p className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400">
          <ClipboardList size={24} />
        </div>
        <h1 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">No orders yet</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Orders you place will show up here.</p>
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
      <h1 className="font-display mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Your orders</h1>

      <div className="space-y-3">
        {orders.map((order) => {
          const meta = STATUS_META[order.status] || STATUS_META.pending_payment
          return (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {order.items.length} item{order.items.length === 1 ? '' : 's'} ·{' '}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}>
                  {meta.label}
                </span>
                <p className="w-24 text-right font-semibold text-slate-900 dark:text-slate-100">
                  {formatPrice(order.total, order.currency)}
                </p>
                <ChevronRight size={16} className="text-slate-400" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Orders
