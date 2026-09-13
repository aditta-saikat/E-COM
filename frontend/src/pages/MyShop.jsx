import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock, Store, XCircle } from 'lucide-react'
import { getMyShop, requestShop, updateShop } from '../api/shops'

const STATUS_META = {
  pending: { label: 'Pending review', icon: Clock, className: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Approved', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-rose-50 text-rose-700' },
}

const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

const RequestShopForm = ({ onRequested }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const shop = await requestShop({ name, description })
      onRequested(shop)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit your shop request')
    }
  }

  return (
    <div className="mx-auto max-w-md animate-fade-in-up px-6 py-8">
      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-cyan-600 text-white shadow-sm shadow-indigo-600/30">
        <Store size={19} />
      </div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Open a shop</h1>
      <p className="mb-6 text-sm text-slate-500">
        Submit your shop details for approval. An admin will review your request.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <input
          required
          placeholder="Shop name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
        />
        <textarea
          placeholder="Describe your shop"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className={inputClass}
        />

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
        >
          Submit request
        </button>
      </form>
    </div>
  )
}

const ShopDetails = ({ shop, onUpdated }) => {
  const [name, setName] = useState(shop.name)
  const [description, setDescription] = useState(shop.description)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const statusMeta = STATUS_META[shop.status]
  const StatusIcon = statusMeta.icon

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSaved(false)

    try {
      const updated = await updateShop(shop._id, { name, description })
      onUpdated(updated)
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save changes')
    }
  }

  return (
    <div className="mx-auto max-w-md animate-fade-in-up px-6 py-8">
      <h1 className="font-display mb-2 text-2xl font-bold text-slate-900">My shop</h1>

      <span
        className={`mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}
      >
        <StatusIcon size={13} />
        {statusMeta.label}
      </span>

      {shop.status === 'pending' && (
        <p className="mb-6 -mt-2 text-sm text-slate-500">
          Your shop is awaiting admin approval. You'll be able to add products once it's approved.
        </p>
      )}

      {shop.status === 'rejected' && (
        <p className="mb-6 -mt-2 text-sm text-rose-600">
          Your request was rejected{shop.rejectionReason ? `: ${shop.rejectionReason}` : '.'}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className={inputClass}
        />

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {saved && <p className="text-sm text-emerald-600">Saved</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
        >
          Save changes
        </button>
      </form>

      {shop.status === 'approved' && (
        <Link
          to="/my-products"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Manage products <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}

const MyShop = () => {
  const [shop, setShop] = useState(undefined)

  useEffect(() => {
    getMyShop()
      .then(setShop)
      .catch(() => setShop(null))
  }, [])

  if (shop === undefined) {
    return <p className="p-6 text-sm text-slate-500">Loading...</p>
  }

  if (shop === null) {
    return <RequestShopForm onRequested={setShop} />
  }

  return <ShopDetails shop={shop} onUpdated={setShop} />
}

export default MyShop
