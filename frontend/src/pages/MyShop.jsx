import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  LogOut,
  Send,
  Store,
  XCircle,
} from 'lucide-react'
import { getMyShop, requestShop, updateShop } from '../api/shops'
import AuthShell from '../components/AuthShell'
import FormField from '../components/FormField'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import { getToken } from '../lib/token'

const STATUS_META = {
  pending: {
    label: 'Pending review',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    message: 'Your shop is awaiting admin approval. You can add products as soon as it is approved.',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    message: 'Your shop is live. Add products and start selling.',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    message: 'Your request was not approved.',
  },
}

const REQUEST_STEPS = [
  { icon: FileText, text: 'Submit your shop name and description' },
  { icon: Clock, text: 'An admin reviews your request' },
  { icon: Store, text: 'Once approved you can add products and sell' },
]

const submitButtonClass = 'flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-indigo-500/90 dark:hover:bg-indigo-500'

const errorBox = (message) => (
  <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
    {message}
  </p>
)

// The role is carried inside the JWT that the other services check, so a role change only applies after a fresh login.
const tokenRole = () => {
  try {
    return JSON.parse(atob(getToken().split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role
  } catch {
    return null
  }
}

const RequestShopForm = ({ onRequested }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      onRequested(await requestShop({ name: name.trim(), description: description.trim() }))
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Could not submit your shop request')
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      badge="Open a shop"
      heading="Start selling on E-COM."
      subheading="Tell us about your shop. We review every request before it goes live."
      highlights={REQUEST_STEPS}
    >
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Open a shop</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">It only takes a minute to submit.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <FormField
          label="Shop name"
          icon={Store}
          required
          placeholder="e.g. Green Corner"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <FormField
          label="Description"
          icon={FileText}
          multiline
          rows={4}
          placeholder="What do you sell?"
          hint="Shown to customers once your shop is approved."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        {error && errorBox(error)}

        <button type="submit" disabled={submitting} className={submitButtonClass}>
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          Submit request
        </button>
      </form>
    </AuthShell>
  )
}

const ShopDetails = ({ shop, onUpdated }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(shop.name)
  const [description, setDescription] = useState(shop.description)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const statusMeta = STATUS_META[shop.status]
  const StatusIcon = statusMeta.icon
  const needsRelogin = shop.status === 'approved' && tokenRole() !== 'shop_admin'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSaved(false)
    setSubmitting(true)

    try {
      onUpdated(await updateShop(shop._id, { name: name.trim(), description: description.trim() }))
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save changes')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReLogin = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in-up px-6 py-8">
      <PageHeader icon={Store} title="My shop" subtitle="Your shop details and approval status." />

      {needsRelogin && (
        <div className="mb-6 flex flex-col items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          <p>Your shop was approved, but your current session still has your old permissions. Log in again to start adding products.</p>
          <button
            type="button"
            onClick={handleReLogin}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-500"
          >
            <LogOut size={14} />
            Log out now
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}>
            <StatusIcon size={13} />
            {statusMeta.label}
          </span>
          <h2 className="font-display mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">{shop.name}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{statusMeta.message}</p>

          {shop.status === 'rejected' && shop.rejectionReason && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              Reason: {shop.rejectionReason}
            </p>
          )}

          {shop.status === 'approved' && (
            <Link
              to="/my-products"
              className="group mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Manage products
              <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Shop details</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">How your shop appears to customers.</p>

          <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-5">
            <FormField
              label="Shop name"
              icon={Store}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <FormField
              label="Description"
              icon={FileText}
              multiline
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            {error && errorBox(error)}
            {saved && (
              <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                Changes saved.
              </p>
            )}

            <button type="submit" disabled={submitting} className={submitButtonClass}>
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Save changes
            </button>
          </form>
        </div>
      </div>
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
    return <p className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
  }

  if (shop === null) {
    return <RequestShopForm onRequested={setShop} />
  }

  return <ShopDetails shop={shop} onUpdated={setShop} />
}

export default MyShop
