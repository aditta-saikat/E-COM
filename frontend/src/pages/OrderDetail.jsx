import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CreditCard, ChevronLeft, MapPin, Package, Phone, ReceiptText, User } from 'lucide-react'
import { getOrder } from '../api/orders'
import { formatPrice } from '../lib/formatPrice'
import PageHeader from '../components/PageHeader'

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
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Link
        to="/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ChevronLeft size={15} />
        Back to orders
      </Link>

      <PageHeader
        icon={ReceiptText}
        title={`Order #${order._id.slice(-8).toUpperCase()}`}
        subtitle={`Placed on ${new Date(order.createdAt).toLocaleString()}`}
      >
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}>{meta.label}</span>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
            Items ({order.items.length})
          </h2>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-300 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-500">
                  <Package size={24} strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/products/${item.productId}`}
                    className="block truncate font-medium text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {item.quantity} × {formatPrice(item.price, order.currency)}
                  </p>
                </div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{formatPrice(item.subtotal, order.currency)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Shipping</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                [User, order.shippingAddress?.fullName],
                [Phone, order.shippingAddress?.phone],
                [MapPin, order.shippingAddress?.address],
              ].map(([Icon, value], index) => (
                <div key={index} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <Icon size={15} className="mt-0.5 shrink-0 text-slate-400" />
                  <dd className="break-words">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <CreditCard size={18} className="text-slate-400" />
              Payment
            </h2>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="font-medium text-slate-900 dark:text-slate-100">Total</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatPrice(order.total, order.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
