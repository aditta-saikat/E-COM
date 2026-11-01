import { useMemo } from 'react'
import { Coins, Hourglass, Package, ReceiptText, TrendingUp, XCircle } from 'lucide-react'
import { formatPrice } from '../lib/formatPrice'

const STATUS_META = {
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  pending_payment: { label: 'Pending', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  payment_failed: { label: 'Failed', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  failed_stock: { label: 'Failed', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
}

const TONES = {
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
}

const formatDate = (isoDate) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoDate))

const monthKey = (isoDate) => {
  const date = new Date(isoDate)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const monthLabel = (key) => {
  const [year, month] = key.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1))
}

const Tile = ({ icon: Icon, tone, label, value, hint }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${TONES[tone]}`}>
      <Icon size={17} />
    </span>
    <p className="font-display mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    {hint && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
  </div>
)

// Money for one shop. An order can hold items from several shops, so only this shop's own line items are counted,
// and only paid orders count as earned.
const buildBilling = (orders, shopId) => {
  const totals = { gross: 0, paidOrders: 0, units: 0, pending: 0, pendingOrders: 0, lost: 0, lostOrders: 0 }
  const months = new Map()
  const transactions = []

  for (const order of orders) {
    const items = order.items.filter((item) => item.shopId === shopId)
    const amount = items.reduce((sum, item) => sum + item.subtotal, 0)
    const units = items.reduce((sum, item) => sum + item.quantity, 0)

    transactions.push({ order, items, amount, units })

    if (order.status === 'paid') {
      totals.gross += amount
      totals.paidOrders += 1
      totals.units += units

      const key = monthKey(order.createdAt)
      const month = months.get(key) || { key, orders: 0, units: 0, gross: 0 }
      month.orders += 1
      month.units += units
      month.gross += amount
      months.set(key, month)
    } else if (order.status === 'pending_payment') {
      totals.pending += amount
      totals.pendingOrders += 1
    } else {
      totals.lost += amount
      totals.lostOrders += 1
    }
  }

  return {
    ...totals,
    average: totals.paidOrders ? Math.round(totals.gross / totals.paidOrders) : 0,
    months: [...months.values()].sort((a, b) => b.key.localeCompare(a.key)),
    transactions,
  }
}

const ShopBilling = ({ orders, shopId }) => {
  const billing = useMemo(() => buildBilling(orders, shopId), [orders, shopId])
  const currency = orders[0]?.currency || 'BDT'
  const money = (amount) => formatPrice(amount, currency)

  if (orders.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No billing activity yet. Sales will show up here.</p>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile icon={Coins} tone="emerald" label="Gross sales" value={money(billing.gross)} hint={`${billing.paidOrders} paid ${billing.paidOrders === 1 ? 'order' : 'orders'}`} />
        <Tile icon={Package} tone="indigo" label="Units sold" value={billing.units} hint={billing.paidOrders ? `${money(billing.average)} per order` : undefined} />
        <Tile icon={Hourglass} tone="amber" label="Awaiting payment" value={money(billing.pending)} hint={`${billing.pendingOrders} ${billing.pendingOrders === 1 ? 'order' : 'orders'}`} />
        <Tile icon={XCircle} tone="rose" label="Failed or cancelled" value={money(billing.lost)} hint={`${billing.lostOrders} ${billing.lostOrders === 1 ? 'order' : 'orders'}`} />
      </div>

      <section>
        <h4 className="font-display mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <TrendingUp size={15} className="text-indigo-500" />
          Monthly statement
        </h4>
        {billing.months.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No paid orders yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3 text-right">Orders</th>
                  <th className="px-4 py-3 text-right">Units</th>
                  <th className="px-4 py-3 text-right">Gross sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {billing.months.map((month) => (
                  <tr key={month.key}>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{monthLabel(month.key)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-300">{month.orders}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-300">{month.units}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">{money(month.gross)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50/60 font-semibold dark:border-slate-800 dark:bg-slate-800/30">
                <tr>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">Total</td>
                  <td className="px-4 py-3 text-right tabular-nums">{billing.paidOrders}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{billing.units}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-700 dark:text-emerald-300">{money(billing.gross)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      <section>
        <h4 className="font-display mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <ReceiptText size={15} className="text-indigo-500" />
          Transactions
        </h4>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:bg-slate-800/40 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Payment ID</th>
                <th className="px-4 py-3 text-right">Items</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {billing.transactions.map(({ order, amount, units }) => {
                const status = STATUS_META[order.status] || STATUS_META.cancelled

                return (
                  <tr key={order._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">#{order._id.slice(-8)}</td>
                    <td className="max-w-40 truncate px-4 py-3 text-slate-700 dark:text-slate-200">{order.shippingAddress?.fullName || order.userId.slice(-8)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{order.paymentId ? order.paymentId.slice(-10) : '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-300">{units}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">{money(amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          Amounts are this shop&apos;s own items only. An order with products from several shops is split between them. Gateway fees are not included.
        </p>
      </section>
    </div>
  )
}

export default ShopBilling
