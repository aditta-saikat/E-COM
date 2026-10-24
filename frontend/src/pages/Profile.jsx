import { useState } from 'react'
import { Calendar, Loader2, Mail, Pencil, ShieldCheck, Store, User, X } from 'lucide-react'
import FormField from '../components/FormField'
import ImageUploader from '../components/ImageUploader'
import { EMPTY_IMAGE_CHANGE, resolveImageUrl } from '../lib/imgbb'
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

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 py-4">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      <Icon size={16} />
    </span>
    <div className="min-w-0">
      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  </div>
)

const Profile = () => {
  const { currentUser, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(currentUser.displayName || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [avatarChange, setAvatarChange] = useState(EMPTY_IMAGE_CHANGE)

  const roleMeta = ROLE_META[currentUser.role] || ROLE_META.customer
  const RoleIcon = roleMeta.icon

  const startEditing = () => {
    setDisplayName(currentUser.displayName || '')
    setAvatarChange(EMPTY_IMAGE_CHANGE)
    setError('')
    setEditing(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const avatarUrl = await resolveImageUrl(currentUser.avatarUrl, avatarChange)
      await updateProfile({ displayName: displayName.trim(), avatarUrl })
      setEditing(false)
    } catch (err) {
      setError(err.response ? err.response.data?.error || 'Could not save changes' : err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>

      <div className="grid animate-fade-in-up gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative h-28 bg-linear-to-br from-indigo-100 via-sky-100 to-cyan-100 dark:from-indigo-950 dark:via-slate-900 dark:to-cyan-950">
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-indigo-300/30 blur-2xl dark:bg-indigo-500/10" />
          </div>
          <div className="relative px-6 pb-7 text-center">
            <div className="mx-auto -mt-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-linear-to-br from-indigo-400 to-cyan-400 text-2xl font-semibold text-white shadow-md dark:border-slate-900 dark:from-indigo-500 dark:to-cyan-600">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                (currentUser.displayName || currentUser.email)[0].toUpperCase()
              )}
            </div>
            <p className="font-display mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
              {currentUser.displayName || 'No display name'}
            </p>
            <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{currentUser.email}</p>
            <span
              className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${roleMeta.className}`}
            >
              <RoleIcon size={13} />
              {roleMeta.label}
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Account details</h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Manage how you appear on E-COM.</p>
            </div>
            {!editing && (
              <button
                type="button"
                onClick={startEditing}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Pencil size={13} />
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-5">
              <ImageUploader
                label="Choose photo"
                rounded="rounded-full"
                currentUrl={currentUser.avatarUrl || ''}
                change={avatarChange}
                onChange={setAvatarChange}
                disabled={submitting}
                fallback={<User size={26} />}
              />
              <FormField
                label="Display name"
                icon={User}
                autoFocus
                placeholder="Display name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />

              {error && (
                <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-indigo-500/90 dark:hover:bg-indigo-500"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {submitting && avatarChange.file ? 'Uploading…' : 'Save changes'}
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
            <dl className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
              <DetailRow icon={User} label="Display name" value={currentUser.displayName || 'Not set'} />
              <DetailRow icon={Mail} label="Email" value={currentUser.email} />
              <DetailRow icon={RoleIcon} label="Role" value={roleMeta.label} />
              {memberSince(currentUser.createdAt) && (
                <DetailRow icon={Calendar} label="Member since" value={memberSince(currentUser.createdAt)} />
              )}
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
