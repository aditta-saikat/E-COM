import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Modal from './Modal'

const emptyForm = { name: '', description: '', price: '', sku: '', stock: '', category: '', imageUrl: '' }

const inputClass = 'rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500'

const ProductFormModal = ({ open, onClose, onSubmit, initialValues, submitting, error }) => {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (open) setForm(initialValues || emptyForm)
  }, [open, initialValues])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <Modal open={open} onClose={onClose} title={initialValues ? 'Edit product' : 'New product'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Name" value={form.name} onChange={handleChange('name')} className={inputClass} />
          <input required placeholder="SKU" value={form.sku} onChange={handleChange('sku')} className={inputClass} />
          <input
            required
            type="number"
            min="0"
            placeholder="Price (minor units)"
            value={form.price}
            onChange={handleChange('price')}
            className={inputClass}
          />
          <input type="number" min="0" placeholder="Stock" value={form.stock} onChange={handleChange('stock')} className={inputClass} />
          <input placeholder="Category" value={form.category} onChange={handleChange('category')} className={inputClass} />
          <input placeholder="Image URL" value={form.imageUrl} onChange={handleChange('imageUrl')} className={inputClass} />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={handleChange('description')}
            rows={2}
            className={`${inputClass} col-span-2 resize-none`}
          />
        </div>

        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {initialValues ? 'Save changes' : 'Create product'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ProductFormModal
