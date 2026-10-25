import { Package } from 'lucide-react'
import { formatPrice } from '../lib/formatPrice'

const OrderSummary = ({ items, subtotal, children }) => {
  const currency = items[0]?.currency
  const units = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Order summary</h2>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
        {units} {units === 1 ? 'item' : 'items'}
      </p>

      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-300 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-500">
              {item.image ? (
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <Package size={18} strokeWidth={1.5} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Qty {item.quantity}</p>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {formatPrice(item.price * item.quantity, item.currency)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm dark:border-slate-800">
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal, currency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-900 dark:text-slate-100">Total</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatPrice(subtotal, currency)}</span>
        </div>
      </div>

      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}

export default OrderSummary
