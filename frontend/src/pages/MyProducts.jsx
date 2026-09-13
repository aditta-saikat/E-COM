import { useEffect, useState } from 'react'
import { Package, PackagePlus, PackageX } from 'lucide-react'
import { createProduct, deleteProduct, listProducts, updateProduct } from '../api/products'
import { useAuth } from '../context/AuthContext'

const emptyForm = { name: '', description: '', price: '', sku: '', stock: '', category: '' }

const inputClass = 'rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

const MyProducts = () => {
  const { currentUser } = useAuth()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const loadMyProducts = async () => {
    const result = await listProducts()
    setProducts(result.items.filter((product) => product.createdBy === currentUser._id))
  }

  useEffect(() => {
    loadMyProducts()
  }, [])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      sku: form.sku,
      stock: Number(form.stock || 0),
      category: form.category,
    }

    try {
      if (editingId) {
        await updateProduct(editingId, payload)
      } else {
        await createProduct(payload)
      }

      setForm(emptyForm)
      setEditingId(null)
      await loadMyProducts()
    } catch (err) {
      setError(
        err.response?.data?.error
          || err.response?.data?.errors?.[0]?.msg
          || 'Could not save product',
      )
    }
  }

  const handleEdit = (product) => {
    setEditingId(product._id)
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      sku: product.sku,
      stock: String(product.stock),
      category: product.category,
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleDelete = async (id) => {
    await deleteProduct(id)
    await loadMyProducts()
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-slate-900">My products</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <PackagePlus size={16} className="text-indigo-600" />
          {editingId ? 'Edit product' : 'New product'}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Name" value={form.name} onChange={handleChange('name')} className={inputClass} />
          <input required placeholder="SKU" value={form.sku} onChange={handleChange('sku')} className={inputClass} />
          <input
            required
            type="number"
            min="0"
            placeholder="Price (minor units, e.g. paisa)"
            value={form.price}
            onChange={handleChange('price')}
            className={inputClass}
          />
          <input type="number" min="0" placeholder="Stock" value={form.stock} onChange={handleChange('stock')} className={inputClass} />
          <input placeholder="Category" value={form.category} onChange={handleChange('category')} className={inputClass} />
          <input placeholder="Description" value={form.description} onChange={handleChange('description')} className={inputClass} />
        </div>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            {editingId ? 'Update product' : 'Create product'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <PackageX size={32} className="text-slate-300" />
          <p className="text-sm text-slate-500">You haven't added any products yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {products.map((product) => (
            <li key={product._id} className="flex items-center gap-4 px-5 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-400">
                <Package size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{product.name}</p>
                <p className="text-sm text-slate-500">
                  {product.stock} in stock · {product.sku}
                </p>
              </div>
              <div className="flex gap-3 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => handleEdit(product)}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product._id)}
                  className="text-rose-600 hover:text-rose-500"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyProducts
