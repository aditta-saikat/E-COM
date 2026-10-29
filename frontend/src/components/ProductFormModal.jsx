import { useEffect, useState } from 'react'
import { Boxes, Coins, FileText, Hash, Layers, Loader2, Package } from 'lucide-react'
import FormField from './FormField'
import ImageUploader from './ImageUploader'
import Modal from './Modal'
import { EMPTY_IMAGE_CHANGE, resolveImageUrl } from '../lib/imgbb'

const emptyForm = { name: '', description: '', price: '', sku: '', stock: '', category: '', imageUrl: '' }

const SectionTitle = ({ children }) => (
  <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">{children}</h3>
)

// Price is typed in whole currency units (e.g. 7899.50) and converted to minor units by the parent when saving.
const ProductFormModal = ({ open, onClose, onSubmit, initialValues, submitting, error }) => {
  const [form, setForm] = useState(emptyForm)
  const [imageChange, setImageChange] = useState(EMPTY_IMAGE_CHANGE)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(initialValues || emptyForm)
      setImageChange(EMPTY_IMAGE_CHANGE)
      setUploadError('')
    }
  }, [open, initialValues])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setUploadError('')
    setUploading(true)

    try {
      const imageUrl = await resolveImageUrl(form.imageUrl, imageChange)
      await onSubmit({ ...form, imageUrl })
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const busy = submitting || uploading

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit product' : 'New product'}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 md:grid-cols-5">
          <div className="space-y-5 md:col-span-3">
            <SectionTitle>Details</SectionTitle>
            <FormField
              label="Product name"
              icon={Package}
              required
              placeholder="e.g. Acer Aspire Lite 15.6&quot; Laptop"
              value={form.name}
              onChange={handleChange('name')}
            />
            <FormField
              label="Description"
              icon={FileText}
              multiline
              rows={8}
              placeholder="Key specs, what is in the box, warranty..."
              hint="One point per line reads best on the product page."
              value={form.description}
              onChange={handleChange('description')}
            />
          </div>

          <div className="space-y-5 md:col-span-2">
            <SectionTitle>Image</SectionTitle>
            <ImageUploader
              label="Upload image"
              currentUrl={form.imageUrl}
              change={imageChange}
              onChange={setImageChange}
              disabled={busy}
              size="h-28 w-28"
            />

            <SectionTitle>Pricing and stock</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Price (৳)"
                icon={Coins}
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="7899"
                value={form.price}
                onChange={handleChange('price')}
              />
              <FormField
                label="Stock"
                icon={Boxes}
                type="number"
                min="0"
                step="1"
                placeholder="10"
                value={form.stock}
                onChange={handleChange('stock')}
              />
            </div>
            <FormField label="SKU" icon={Hash} required placeholder="e.g. ST-52018" value={form.sku} onChange={handleChange('sku')} />
            <FormField label="Category" icon={Layers} placeholder="e.g. Monitors" value={form.category} onChange={handleChange('category')} />
          </div>
        </div>

        {(uploadError || error) && (
          <p role="alert" className="mt-6 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {uploadError || error}
          </p>
        )}

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex min-w-40 items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {uploading ? 'Uploading image…' : initialValues ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ProductFormModal
