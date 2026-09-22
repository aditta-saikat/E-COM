import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, ClipboardList, Search } from 'lucide-react'
import { formatPrice } from '../lib/formatPrice'

const STATUS_META = {
  pending_payment: { label: 'Pending payment', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  payment_failed: { label: 'Payment failed', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  failed_stock: { label: 'Stock unavailable', className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
}

const formatDate = (isoDate) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoDate))

const AdminOrdersTable = ({ orders, emptyMessage = 'No orders yet.' }) => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (statusFilter && order.status !== statusFilter) return false

        if (search) {
          const term = search.trim().toLowerCase()
          const matches =
            order._id.toLowerCase().includes(term) ||
            order.userId.toLowerCase().includes(term) ||
            (order.shippingAddress?.fullName || '').toLowerCase().includes(term) ||
            (order.shippingAddress?.phone || '').toLowerCase().includes(term)
          if (!matches) return false
        }

        return true
      }),
    [orders, search, statusFilter],
  )

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="relative">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-56 rounded-lg border border-slate-300 py-1.5 pr-3 pl-8 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pr-8 pl-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <ClipboardList size={32} className="text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {orders.length === 0 ? emptyMessage : 'No orders match your filters.'}
          </p>
        </div>
      )}

      {filteredOrders.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Placed</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((order) => {
                const meta = STATUS_META[order.status] || STATUS_META.pending_payment
                return (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/orders/${order._id}`)}
                    tabIndex={0}
                    onKeyDown={(event) => event.key === 'Enter' && navigate(`/orders/${order._id}`)}
                    className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400" title={order.userId}>
                      {order.shippingAddress?.fullName || order.userId.slice(-8)}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{order.items.length}</td>
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {formatPrice(order.total, order.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-3">
                      <ChevronRight size={16} className="text-slate-300 dark:text-slate-700" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminOrdersTable
