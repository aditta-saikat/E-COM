import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Boxes, Coins, Package, ReceiptText, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { getShopSummary } from '../api/orders'
import { getInventorySummary } from '../api/products'
import { formatPrice } from '../lib/formatPrice'

const TONES = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
}

const STATUS_LABELS = {
  paid: ['Paid', 'text-emerald-600 dark:text-emerald-300'],
  pending_payment: ['Awaiting payment', 'text-amber-600 dark:text-amber-300'],
}

const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

const StatTile = ({ icon: Icon, tone, label, value, hint }) => (
  <div className={card}>
    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}>
      <Icon size={18} />
    </span>
    <p className="font-display mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
  </div>
)

const RevenueChart = ({ daily, currency }) => {
  const max = Math.max(...daily.map((day) => day.revenue), 1)
  const total = daily.reduce((sum, day) => sum + day.revenue, 0)

  return (
    <div className={`${card} lg:col-span-2`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">Revenue, last 14 days</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Paid orders only.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {formatPrice(total, currency)}
        </span>
      </div>

      <div className="mt-6 flex h-40 items-end gap-1.5">
        {daily.map((day) => (
          <div key={day.date} className="group relative flex h-full flex-1 items-end">
            <div
              className={`w-full rounded-t-md transition ${day.revenue ? 'bg-linear-to-t from-indigo-400 to-cyan-300 group-hover:from-indigo-500' : 'bg-slate-100 dark:bg-slate-800'}`}
              style={{ height: `${day.revenue ? Math.max((day.revenue / max) * 100, 6) : 4}%` }}
            />
            <span className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
              {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {formatPrice(day.revenue, currency)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>{new Date(daily[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        <span>Today</span>
      </div>
    </div>
  )
}

const TopProducts = ({ products, currency }) => {
  const max = Math.max(...products.map((product) => product.units), 1)

  return (
    <div className={card}>
      <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">Best sellers</h3>
      {products.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No sales yet. Your best sellers will show up here.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {products.map((product, index) => (
            <li key={product.productId}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                  {index + 1}. {product.name}
                </span>
                <span className="shrink-0 text-slate-500 dark:text-slate-400">{product.units} sold</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-linear-to-r from-violet-400 to-indigo-400" style={{ width: `${(product.units / max) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-400">{formatPrice(product.revenue, currency)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const RecentSales = ({ orders, currency }) => (
  <div className={`${card} lg:col-span-2`}>
    <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">Recent orders</h3>
    {orders.length === 0 ? (
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No orders for your products yet.</p>
    ) : (
      <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
        {orders.map((order) => {
          const [label, className] = STATUS_LABELS[order.status] || ['Not completed', 'text-slate-400']

          return (
            <li key={order._id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {order.units} {order.units === 1 ? 'item' : 'items'}
                  <span className="ml-2 text-xs text-slate-400">#{order._id.slice(-6)}</span>
                </p>
                <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{formatPrice(order.total, currency)}</p>
                <p className={`text-xs font-medium ${className}`}>{label}</p>
              </div>
            </li>
          )
        })}
      </ul>
    )}
  </div>
)

const StockAlerts = ({ inventory }) => {
  const healthy = inventory.outOfStock === 0 && inventory.lowStock === 0

  return (
    <div className={card}>
      <h3 className="font-display flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
        <AlertTriangle size={16} className={healthy ? 'text-emerald-500' : 'text-amber-500'} />
        Stock health
      </h3>
      {healthy ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">All products are comfortably in stock.</p>
      ) : (
        <>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {inventory.outOfStock} out of stock, {inventory.lowStock} running low (5 or fewer).
          </p>
          <ul className="mt-3 space-y-2">
            {inventory.needsAttention.map((product) => (
              <li key={product._id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-slate-700 dark:text-slate-300">{product.name}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${product.stock === 0 ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
                  {product.stock === 0 ? 'Out' : `${product.stock} left`}
                </span>
              </li>
            ))}
          </ul>
          <Link to="/my-products" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            Restock →
          </Link>
        </>
      )}
    </div>
  )
}

// One place for a shop owner to see how the business is doing: listings, sales, revenue and stock.
const ShopBusiness = () => {
  const [sales, setSales] = useState(null)
  const [inventory, setInventory] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getShopSummary(), getInventorySummary()])
      .then(([salesData, inventoryData]) => {
        setSales(salesData)
        setInventory(inventoryData)
      })
      .catch((err) => setError(err.response?.data?.error || 'Could not load your business overview'))
  }, [])

  if (error) {
    return <p className="mt-8 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">{error}</p>
  }

  if (!sales || !inventory) {
    return <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">Loading your business overview...</p>
  }

  const { currency } = sales

  return (
    <section className="mt-10 animate-fade-in-up">
      <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
        <TrendingUp size={18} className="text-indigo-500" />
        Your business
      </h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Coins} tone="emerald" label="Revenue" value={formatPrice(sales.revenue, currency)} hint={sales.paidOrders ? `${formatPrice(sales.averageOrderValue, currency)} per order` : 'From paid orders'} />
        <StatTile icon={ShoppingBag} tone="indigo" label="Units sold" value={sales.unitsSold} hint={`${sales.paidOrders} paid ${sales.paidOrders === 1 ? 'order' : 'orders'}`} />
        <StatTile icon={Users} tone="cyan" label="Customers" value={sales.customers} hint="Unique buyers" />
        <StatTile icon={ReceiptText} tone="amber" label="Awaiting payment" value={sales.pendingOrders} hint={sales.unsuccessfulOrders ? `${sales.unsuccessfulOrders} not completed` : 'Orders in progress'} />
        <StatTile icon={Package} tone="violet" label="Products listed" value={inventory.products} />
        <StatTile icon={Boxes} tone="indigo" label="Units in stock" value={inventory.unitsInStock} />
        <StatTile icon={Coins} tone="emerald" label="Stock value" value={formatPrice(inventory.inventoryValue, currency)} hint="At current prices" />
        <StatTile icon={AlertTriangle} tone="amber" label="Need restocking" value={inventory.outOfStock + inventory.lowStock} hint={`${inventory.outOfStock} out of stock`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <RevenueChart daily={sales.daily} currency={currency} />
        <TopProducts products={sales.topProducts} currency={currency} />
        <RecentSales orders={sales.recentOrders} currency={currency} />
        <StockAlerts inventory={inventory} />
      </div>
    </section>
  )
}

export default ShopBusiness
