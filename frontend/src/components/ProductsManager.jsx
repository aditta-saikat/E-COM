import { useMemo, useState } from 'react'
import { ChevronDown, Package, PackageX, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import ProductFormModal from './ProductFormModal'
import ConfirmDialog from './ConfirmDialog'
import { formatPrice } from '../lib/formatPrice'

const STOCK_FILTERS = [
  { value: '', label: 'All stock' },
  { value: 'in', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
]

const selectClass = 'appearance-none rounded-lg border border-slate-300 bg-white py-2 pr-8 pl-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'

const readableError = (err) => {
  if (err.response?.status === 403) {
    return 'Your session still has your old role. Log out and back in, then try again.'
  }
  return err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Could not save product'
}

const ProductsManager = ({ products, onCreate, onUpdate, onDelete, emptyMessage = 'No products yet.' }) => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    [products],
  )

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return false
        if (category && product.category !== category) return false
        if (stockFilter === 'in' && product.stock <= 3) return false
        if (stockFilter === 'low' && !(product.stock > 0 && product.stock <= 3)) return false
        if (stockFilter === 'out' && product.stock !== 0) return false
        return true
      }),
    [products, search, category, stockFilter],
  )

  const openCreate = () => {
    setEditingProduct(null)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (form) => {
    setSubmitting(true)
    setFormError('')

    const payload = {
      name: form.name,
      description: form.description,
      price: Math.round(Number(form.price) * 100),
      sku: form.sku,
      stock: Number(form.stock || 0),
      category: form.category,
      images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
    }

    try {
      if (editingProduct) {
        await onUpdate(editingProduct._id, payload)
      } else {
        await onCreate(payload)
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(readableError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(deleteTarget._id)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const initialValues = editingProduct
    ? {
        name: editingProduct.name,
        description: editingProduct.description,
        price: String(editingProduct.price / 100),
        sku: editingProduct.sku,
        stock: String(editingProduct.stock),
        category: editingProduct.category,
        imageUrl: editingProduct.images?.[0] || '',
      }
    : null

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[160px] flex-1">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-8 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal size={13} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400" />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={`${selectClass} pl-7`}
            >
              <option value="">All categories</option>
              {categories.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
              className={selectClass}
            >
              {STOCK_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
        >
          <Plus size={16} />
          Add product
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <PackageX size={32} className="text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {products.length === 0 ? emptyMessage : 'No products match your filters.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full table-fixed text-left text-[0.9375rem]">
            <thead className="bg-slate-50/80 dark:bg-slate-800/40">
              <tr className="border-b border-slate-200 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                <th className="px-5 py-3.5">Product</th>
                <th className="hidden w-36 px-3 py-3.5 md:table-cell">Category</th>
                <th className="w-32 px-3 py-3.5 text-right">Price</th>
                <th className="w-28 px-3 py-3.5 text-center">Stock</th>
                <th className="w-24 px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((product) => (
                <tr key={product._id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-4">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain p-0.5 ring-1 ring-slate-200 dark:ring-slate-700" />
                      ) : (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-400 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-500">
                          <Package size={16} />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900 dark:text-slate-100" title={product.name}>{product.name}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 md:table-cell">
                    {product.category ? (
                      <span className="inline-block max-w-full truncate rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {product.category}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-slate-800 tabular-nums dark:text-slate-200">
                    {formatPrice(product.price, product.currency)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`inline-block min-w-12 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.stock === 0
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
                          : product.stock <= 3
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                      }`}
                    >
                      {product.stock === 0 ? 'Out' : product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        aria-label="Edit product"
                        className="rounded-lg p-1.5 text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(product)}
                        aria-label="Delete product"
                        className="rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={initialValues}
        submitting={submitting}
        error={formError}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="Delete product"
        message={`Delete "${deleteTarget?.name}"? This can't be undone.`}
      />
    </div>
  )
}

export default ProductsManager
