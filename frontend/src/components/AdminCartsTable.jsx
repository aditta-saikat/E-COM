import { useMemo, useState } from 'react'
import { ChevronRight, Search, ShoppingCart } from 'lucide-react'
import AdminCartModal from './AdminCartModal'
import { formatPrice } from '../lib/formatPrice'

const formatDate = (isoDate) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
    new Date(isoDate),
  )

const AdminCartsTable = ({ carts, emptyMessage = 'No active carts.' }) => {
  const [search, setSearch] = useState('')
  const [selectedCart, setSelectedCart] = useState(null)

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
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-100 to-cyan-100 text-indigo-500 dark:from-indigo-500/15 dark:to-cyan-500/15 dark:text-indigo-300">
            <ShoppingCart size={28} />
          </span>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {carts.length === 0 ? emptyMessage : 'No carts match your search.'}
          </p>
        </div>
      )}

      {filteredCarts.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-[0.9375rem]">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Items</th>
                <th className="px-6 py-3.5">Subtotal</th>
                <th className="px-6 py-3.5">Last updated</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCarts.map((cart) => (
                <tr
                  key={cart.userId}
                  onClick={() => setSelectedCart(cart)}
                  tabIndex={0}
                  onKeyDown={(event) => event.key === 'Enter' && setSelectedCart(cart)}
                  className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400" title={cart.userId}>
                    {cart.userId.slice(-8)}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {formatPrice(cart.subtotal, cart.items[0]?.currency)}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDate(cart.updatedAt)}</td>
                  <td className="px-6 py-4">
                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-700" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminCartModal cart={selectedCart} onClose={() => setSelectedCart(null)} />
    </div>
  )
}

export default AdminCartsTable
