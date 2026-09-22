import { Fragment, useMemo, useState } from 'react'
import { ChevronDown, Package, Search, ShoppingCart } from 'lucide-react'
import { formatPrice } from '../lib/formatPrice'

const formatDate = (isoDate) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
    new Date(isoDate),
  )

const AdminCartsTable = ({ carts, emptyMessage = 'No active carts.' }) => {
  const [search, setSearch] = useState('')
  const [expandedUserId, setExpandedUserId] = useState(null)

  const filteredCarts = useMemo(
    () =>
      carts.filter((cart) => {
        if (!search) return true
        const term = search.trim().toLowerCase()
        return cart.userId.toLowerCase().includes(term) || cart.items.some((item) => item.name.toLowerCase().includes(term))
      }),
    [carts, search],
  )

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="relative">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search carts..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-56 rounded-lg border border-slate-300 py-1.5 pr-3 pl-8 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {filteredCarts.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <ShoppingCart size={32} className="text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {carts.length === 0 ? emptyMessage : 'No carts match your search.'}
          </p>
        </div>
      )}

      {filteredCarts.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Subtotal</th>
                <th className="px-5 py-3">Last updated</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCarts.map((cart) => {
                const isExpanded = expandedUserId === cart.userId
                return (
                  <Fragment key={cart.userId}>
                    <tr
                      onClick={() => setExpandedUserId(isExpanded ? null : cart.userId)}
                      tabIndex={0}
                      onKeyDown={(event) =>
                        event.key === 'Enter' && setExpandedUserId(isExpanded ? null : cart.userId)
                      }
                      className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400" title={cart.userId}>
                        {cart.userId.slice(-8)}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {formatPrice(cart.subtotal, cart.items[0]?.currency)}
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatDate(cart.updatedAt)}</td>
                      <td className="px-5 py-3">
                        <ChevronDown
                          size={16}
                          className={`text-slate-300 transition dark:text-slate-700 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50 dark:bg-slate-800/40">
                        <td colSpan={5} className="px-5 py-4">
                          <div className="space-y-2">
                            {cart.items.map((item) => (
                              <div key={item.productId} className="flex items-center gap-3 text-sm">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-300 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-500">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <Package size={14} strokeWidth={1.5} />
                                  )}
                                </span>
                                <span className="flex-1 text-slate-700 dark:text-slate-300">{item.name}</span>
                                <span className="text-slate-500 dark:text-slate-400">× {item.quantity}</span>
                                <span className="w-24 text-right font-medium text-slate-900 dark:text-slate-100">
                                  {formatPrice(item.price * item.quantity, item.currency)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminCartsTable
