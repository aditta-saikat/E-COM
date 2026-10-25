import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, CreditCard, MapPin, Package, Phone, User } from 'lucide-react'
import Modal from './Modal'
import { formatPrice } from '../lib/formatPrice'

const STATUS_META = {
  pending_payment: { label: 'Pending payment', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  payment_failed: { label: 'Payment failed', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  failed_stock: { label: 'Stock unavailable', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
}

const Info = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-2.5">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      <Icon size={15} />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <div className="text-sm font-medium break-words text-slate-900 dark:text-slate-100">{children || '—'}</div>
    </div>
  </div>
)

const AdminOrderModal = ({ order, onClose }) => {
  const meta = order ? STATUS_META[order.status] || STATUS_META.pending_payment : null

  return (
    <Modal open={Boolean(order)} onClose={onClose} title="Order details" maxWidth="max-w-2xl">
      {order && (
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
                Order #{order._id.slice(-8).toUpperCase()}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Placed {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}>{meta.label}</span>
          </div>

          <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 dark:border-slate-800">
            <Info icon={User} label="Customer">
              {order.shippingAddress?.fullName}
              <span className="block font-mono text-xs font-normal text-slate-500 dark:text-slate-400">{order.userId}</span>
            </Info>
            <Info icon={Phone} label="Phone">{order.shippingAddress?.phone}</Info>
            <Info icon={MapPin} label="Shipping address">{order.shippingAddress?.address}</Info>
            <Info icon={CreditCard} label="Payment ID">
              {order.paymentId && <span className="font-mono text-xs">{order.paymentId}</span>}
            </Info>
            <Info icon={Calendar} label="Last updated">{new Date(order.updatedAt).toLocaleString()}</Info>
          </div>

          <h4 className="mt-6 mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Items ({order.items.length})
          </h4>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 px-4 py-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-300 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-500">
                  <Package size={18} strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.quantity} × {formatPrice(item.price, order.currency)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatPrice(item.subtotal, order.currency)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Total</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatPrice(order.total, order.currency)}</span>
          </div>

          <div className="mt-5 flex justify-end">
            <Link
              to={`/orders/${order._id}`}
              className="group flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Open full order page
              <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default AdminOrderModal
