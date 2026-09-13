import { useEffect, useState } from 'react'
import { createProduct, deleteProduct, listProducts, updateProduct } from '../api/products'
import { useAuth } from '../context/AuthContext'

const emptyForm = { name: '', description: '', price: '', sku: '', stock: '', category: '' }

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

  const handleDelete = async (id) => {
    await deleteProduct(id)
    await loadMyProducts()
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My products</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={handleChange('name')}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <input
          required
          placeholder="SKU"
          value={form.sku}
          onChange={handleChange('sku')}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <input
          required
          type="number"
          min="0"
          placeholder="Price (minor units, e.g. paisa)"
          value={form.price}
          onChange={handleChange('price')}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <input
          type="number"
          min="0"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange('stock')}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={handleChange('category')}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={handleChange('description')}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        {error && <p className="col-span-2 text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          className="col-span-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
        >
          {editingId ? 'Update product' : 'Create product'}
        </button>
      </form>

      <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {products.map((product) => (
          <li key={product._id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="font-medium text-slate-900">{product.name}</p>
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
    </div>
  )
}

export default MyProducts
