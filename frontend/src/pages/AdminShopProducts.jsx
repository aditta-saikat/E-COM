import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Check, Clock, Package, Store, User, XCircle } from 'lucide-react'
import { createProduct, deleteProduct, listProducts, updateProduct } from '../api/products'
import { listShops } from '../api/shops'
import ProductsManager from '../components/ProductsManager'

const STATUS_META = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  approved: { label: 'Approved', icon: Check, className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
}

const formatDate = (isoDate) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(isoDate))

const AdminShopProducts = () => {
  const { shopId } = useParams()
  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])

  const load = async () => {
    const [shopsResult, productsResult] = await Promise.all([
      listShops(),
      listProducts({ shopId }),
    ])
    setShop(shopsResult.items.find((item) => item._id === shopId) || null)
    setProducts(productsResult.items)
  }

  useEffect(() => {
    load()
  }, [shopId])

  const handleCreate = async (payload) => {
    await createProduct({ ...payload, shopId })
    await load()
  }

  const handleUpdate = async (id, payload) => {
    await updateProduct(id, payload)
    await load()
  }

  const handleDelete = async (id) => {
    await deleteProduct(id)
    await load()
  }

  const statusMeta = shop ? STATUS_META[shop.status] : null
  const StatusIcon = statusMeta?.icon

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link
        to="/admin/shops"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft size={14} />
        All shops
      </Link>

      {shop && (
        <div className="mb-8 animate-fade-in-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative bg-linear-to-r from-indigo-600 to-cyan-600 px-6 py-8 text-white">
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                    <Store size={17} />
                  </span>
                  <h1 className="font-display text-2xl font-bold">{shop.name}</h1>
                </div>
                <p className="mt-2 max-w-md text-sm text-indigo-100">
                  {shop.description || 'No description provided.'}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
              >
                <StatusIcon size={12} />
                {statusMeta.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-6 py-4 text-sm sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <User size={12} />
                Owner ID
              </p>
              <p className="mt-1 truncate font-mono text-xs text-slate-700 dark:text-slate-300" title={shop.ownerId}>
                {shop.ownerId}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar size={12} />
                Created
              </p>
              <p className="mt-1 text-slate-700 dark:text-slate-300">{formatDate(shop.createdAt)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Package size={12} />
                Products
              </p>
              <p className="mt-1 text-slate-700 dark:text-slate-300">{products.length}</p>
            </div>
          </div>

          {shop.status === 'rejected' && shop.rejectionReason && (
            <div className="border-t border-slate-100 px-6 py-3 text-sm text-rose-600 dark:border-slate-800 dark:text-rose-400">
              Rejection reason: {shop.rejectionReason}
            </div>
          )}
        </div>
      )}

      <h2 className="font-display mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">Products</h2>

      <ProductsManager
        products={products}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        emptyMessage="This shop has no products yet."
      />
    </div>
  )
}

export default AdminShopProducts
