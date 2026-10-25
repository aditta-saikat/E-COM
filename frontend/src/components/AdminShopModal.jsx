import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  Check,
  ReceiptText,
  Clock,
  Package,
  PackageX,
  Search,
  ShoppingCart,
  Store,
  User,
  X,
  XCircle,
} from 'lucide-react'
import Modal from './Modal'
import AdminOrdersTable from './AdminOrdersTable'
import AdminCartsTable from './AdminCartsTable'
import { listProducts } from '../api/products'
import { listAllOrders } from '../api/orders'
import { listAllCarts } from '../api/cart'
import { formatPrice } from '../lib/formatPrice'

const STATUS_META = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  approved: { label: 'Approved', icon: Check, className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
}

const TABS = [
  { key: 'products', label: 'Products', icon: Package },
  { key: 'orders', label: 'Orders', icon: ReceiptText },
  { key: 'carts', label: 'Carts', icon: ShoppingCart },
]

const MAX_PAGES = 50

const formatDate = (isoDate) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoDate))

// The catalog API pages its results, so keep fetching until every product of the shop is loaded.
const fetchAllProducts = async (shopId) => {
  const items = []
  let total = Infinity

  for (let page = 1; items.length < total && page <= MAX_PAGES; page += 1) {
    const result = await listProducts({ shopId, page })
    items.push(...result.items)
    total = result.total

    if (result.items.length === 0) break
  }

  return items
}

const Summary = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-2.5">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      <Icon size={15} />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{children}</div>
    </div>
  </div>
)

const ShopProductsTable = ({ products }) => {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return products
    return products.filter((product) => product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term))
  }, [products, search])

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="relative">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-56 rounded-lg border border-slate-300 py-1.5 pr-3 pl-8 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
          <PackageX size={30} className="text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {products.length === 0 ? 'This shop has no products yet.' : 'No products match your search.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-[0.9375rem]">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-400 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-500">
                          <Package size={16} />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900 dark:text-slate-100">{product.name}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 capitalize dark:text-slate-400">{product.category || '—'}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{formatPrice(product.price, product.currency)}</td>
                  <td
                    className={`px-6 py-4 ${
                      product.stock === 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : product.stock <= 3
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {product.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const TabState = ({ loading, failed, children }) => {
  if (loading) return <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">Loading…</p>
  if (failed) return <p className="py-10 text-center text-sm text-rose-600 dark:text-rose-400">Could not load this data.</p>
  return children
}

const AdminShopModal = ({ shop, onClose, onApprove, onReject }) => {
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState(null)
  const [orders, setOrders] = useState(null)
  const [carts, setCarts] = useState(null)
  const [failed, setFailed] = useState({})
  const [acting, setActing] = useState(false)
  const shopId = shop?._id

  useEffect(() => {
    setTab('products')
    setProducts(null)
    setOrders(null)
    setCarts(null)
    setFailed({})
  }, [shopId])

  useEffect(() => {
    if (!shopId) return undefined

    let cancelled = false
    const load = (key, request, setData) => {
      request()
        .then((data) => !cancelled && setData(data))
        .catch(() => {
          if (cancelled) return
          setData([])
          setFailed((prev) => ({ ...prev, [key]: true }))
        })
    }

    if (products === null) load('products', () => fetchAllProducts(shopId), setProducts)
    if (tab === 'orders' && orders === null) load('orders', () => listAllOrders({ shopId }).then((data) => data.items), setOrders)
    if (tab === 'carts' && carts === null) load('carts', () => listAllCarts({ shopId }).then((data) => data.items), setCarts)

    return () => {
      cancelled = true
    }
  }, [shopId, tab, products, orders, carts])

  const runAction = async (action) => {
    setActing(true)

    try {
      await action(shop._id)
      onClose()
    } finally {
      setActing(false)
    }
  }

  const counts = { products: products?.length, orders: orders?.length, carts: carts?.length }
  const statusMeta = shop ? STATUS_META[shop.status] : null
  const StatusIcon = statusMeta?.icon

  return (
    <Modal open={Boolean(shop)} onClose={onClose} title="Shop details" maxWidth="max-w-4xl">
      {shop && (
        <div>
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-100 to-cyan-100 text-indigo-600 dark:from-indigo-500/15 dark:to-cyan-500/15 dark:text-indigo-300">
              <Store size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display truncate text-lg font-bold text-slate-900 dark:text-slate-100">{shop.name}</h3>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>
                  <StatusIcon size={12} />
                  {statusMeta.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{shop.description || 'No description provided.'}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3 dark:border-slate-800">
            <Summary icon={User} label="Owner ID">
              <span className="font-mono text-xs break-all">{shop.ownerId}</span>
            </Summary>
            <Summary icon={Calendar} label="Created">{formatDate(shop.createdAt)}</Summary>
            {shop.updatedAt && <Summary icon={Calendar} label="Last updated">{formatDate(shop.updatedAt)}</Summary>}
          </div>

          {shop.status === 'rejected' && shop.rejectionReason && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              Rejection reason: {shop.rejectionReason}
            </p>
          )}

          <div className="mt-6 mb-4 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  tab === key
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`}
              >
                <Icon size={15} />
                {label}
                {counts[key] !== undefined && (
                  <span className="rounded-full bg-slate-100 px-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {counts[key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'products' && (
            <TabState loading={products === null} failed={failed.products}>
              <ShopProductsTable products={products || []} />
            </TabState>
          )}
          {tab === 'orders' && (
            <TabState loading={orders === null} failed={failed.orders}>
              <AdminOrdersTable orders={orders || []} emptyMessage="This shop has no orders yet." />
            </TabState>
          )}
          {tab === 'carts' && (
            <TabState loading={carts === null} failed={failed.carts}>
              <AdminCartsTable carts={carts || []} emptyMessage="No active carts for this shop." />
            </TabState>
          )}

          <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end dark:border-slate-800">
            {shop.status === 'pending' && (
              <>
                <button
                  type="button"
                  disabled={acting}
                  onClick={() => runAction(onApprove)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Check size={15} />
                  Approve
                </button>
                <button
                  type="button"
                  disabled={acting}
                  onClick={() => runAction(onReject)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                >
                  <X size={15} />
                  Reject
                </button>
              </>
            )}
            <Link
              to={`/admin/shops/${shop._id}`}
              className="group flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Open full page to edit products
              <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default AdminShopModal
