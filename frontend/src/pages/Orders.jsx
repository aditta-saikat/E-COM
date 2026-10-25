import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ReceiptText } from 'lucide-react'
import { listOrders } from '../api/orders'
import { formatPrice } from '../lib/formatPrice'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'

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
      <EmptyState
        icon={ReceiptText}
        title="No orders yet"
        description="Orders you place will show up here."
        action={{ to: '/products', label: 'Browse products' }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        icon={ReceiptText}
        title="Your orders"
        subtitle={`${orders.length} ${orders.length === 1 ? 'order' : 'orders'} placed so far.`}
      />

      <div className="space-y-3">
        {orders.map((order) => {
          const meta = STATUS_META[order.status] || STATUS_META.pending_payment
          return (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <ReceiptText size={20} />
                </span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {order.items.length} item{order.items.length === 1 ? '' : 's'} · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}>{meta.label}</span>
                <p className="w-28 text-right text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatPrice(order.total, order.currency)}
                </p>
                <ChevronRight size={18} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-slate-600" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Orders
