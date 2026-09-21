import { useState } from 'react'
import { Calendar, Loader2, Mail, Pencil, ShieldCheck, Store, User, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ROLE_META = {
  customer: { label: 'Customer', icon: User, className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' },
  shop_admin: { label: 'Shop admin', icon: Store, className: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300' },
  admin: { label: 'Admin', icon: ShieldCheck, className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
}

const memberSince = (isoDate) => {
  if (!isoDate) return null
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(isoDate))
}

const Profile = () => {
  const { currentUser, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(currentUser.displayName || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const roleMeta = ROLE_META[currentUser.role] || ROLE_META.customer
  const RoleIcon = roleMeta.icon

  const startEditing = () => {
    setDisplayName(currentUser.displayName || '')
    setError('')
    setEditing(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await updateProfile({ displayName: displayName.trim() })
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save changes')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>

      <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative bg-linear-to-r from-indigo-600 to-cyan-600 px-6 pt-8 pb-16">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <span
            className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${roleMeta.className}`}
          >
            <RoleIcon size={13} />
            {roleMeta.label}
          </span>
        </div>

        <div className="relative px-6 pb-6">
          <div className="absolute -top-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-linear-to-br from-indigo-600 to-cyan-600 text-2xl font-semibold text-white shadow-md dark:border-slate-900">
            {(currentUser.displayName || currentUser.email)[0].toUpperCase()}
          </div>

          <div className="pt-12">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  autoFocus
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Display name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
                />

                {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {currentUser.displayName || 'No display name'}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Mail size={13} />
                    {currentUser.email}
                  </p>
                  {memberSince(currentUser.createdAt) && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar size={13} />
                      Member since {memberSince(currentUser.createdAt)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={startEditing}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Pencil size={13} />
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
