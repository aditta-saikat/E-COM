import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock, CreditCard, ChevronLeft, MapPin, Package, Phone, ReceiptText, User, XCircle } from 'lucide-react'
import { getOrder } from '../api/orders'
import { formatPrice } from '../lib/formatPrice'
import PageHeader from '../components/PageHeader'
import { useCart } from '../context/CartContext'

const STATUS_META = {
  pending_payment: { label: 'Pending payment', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  payment_failed: { label: 'Payment failed', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  failed_stock: { label: 'Stock unavailable', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
}

const RETURN_BANNERS = {
  paid: { icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300', text: 'Payment received. Thank you for your order!' },
  pending_payment: { icon: Clock, className: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300', text: 'We are confirming your payment. This page updates automatically.' },
  payment_failed: { icon: XCircle, className: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300', text: 'Your payment did not go through. Your cart is still saved, so you can try again.' },
  cancelled: { icon: XCircle, className: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300', text: 'You cancelled the payment. Your cart is still saved, so you can try again.' },
}

const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 10

const OrderDetail = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const returnedFromGateway = searchParams.has('payment')
  const { refresh } = useCart()
  const refreshCart = useRef(refresh)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    refreshCart.current = refresh
  })

  useEffect(() => {
    let cancelled = false
    let polls = 0
    let timer

    const load = () => {
      getOrder(id)
        .then((data) => {
          if (cancelled) return
          const loaded = data.order || data
          setOrder(loaded)

          // Right after returning from the gateway the result can lag a moment behind the redirect.
          if (returnedFromGateway && loaded.status === 'pending_payment' && polls < MAX_POLLS) {
            polls += 1
            timer = setTimeout(load, POLL_INTERVAL_MS)
          } else if (returnedFromGateway) {
            refreshCart.current()
          }
        })
        .catch(() => !cancelled && setError('Could not load this order'))
    }

    load()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [id, returnedFromGateway])

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

      {returnedFromGateway && RETURN_BANNERS[order.status] && (
        <div role="status" className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-sm ${RETURN_BANNERS[order.status].className}`}>
          {(() => {
            const BannerIcon = RETURN_BANNERS[order.status].icon
            return <BannerIcon size={18} className="shrink-0" />
          })()}
          {RETURN_BANNERS[order.status].text}
        </div>
      )}

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
