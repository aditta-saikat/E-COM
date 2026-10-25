import { Calendar, Package, ShoppingCart, User } from 'lucide-react'
import Modal from './Modal'
import { formatPrice } from '../lib/formatPrice'

const AdminCartModal = ({ cart, onClose }) => {
  const currency = cart?.items[0]?.currency
  const unitCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0

  return (
    <Modal open={Boolean(cart)} onClose={onClose} title="Cart details" maxWidth="max-w-xl">
      {cart && (
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <User size={15} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Customer ID</p>
                <p className="font-mono text-xs break-all text-slate-900 dark:text-slate-100">{cart.userId}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Calendar size={15} />
              </span>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Last updated</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{new Date(cart.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <h4 className="mt-6 mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <ShoppingCart size={14} />
            {cart.items.length} {cart.items.length === 1 ? 'product' : 'products'} · {unitCount} {unitCount === 1 ? 'unit' : 'units'}
          </h4>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 px-4 py-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-300 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-500">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <Package size={18} strokeWidth={1.5} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.quantity} × {formatPrice(item.price, item.currency)}
                    {item.stock !== undefined && ` · ${item.stock} in stock`}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatPrice(item.price * item.quantity, item.currency)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Subtotal</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatPrice(cart.subtotal, currency)}</span>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default AdminCartModal
