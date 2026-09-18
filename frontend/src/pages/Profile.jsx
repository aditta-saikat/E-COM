import { Mail, ShieldCheck, Store, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ROLE_META = {
  customer: { label: 'Customer', icon: User, className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' },
  shop_admin: { label: 'Shop admin', icon: Store, className: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300' },
  admin: { label: 'Admin', icon: ShieldCheck, className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
}

const Profile = () => {
  const { currentUser } = useAuth()
  const roleMeta = ROLE_META[currentUser.role] || ROLE_META.customer
  const RoleIcon = roleMeta.icon

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>

      <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-cyan-600 text-xl font-semibold text-white shadow-sm shadow-indigo-600/30">
            {(currentUser.displayName || currentUser.email)[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {currentUser.displayName || 'No display name'}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Mail size={13} />
              {currentUser.email}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${roleMeta.className}`}
        >
          <RoleIcon size={13} />
          {roleMeta.label}
        </span>
      </div>
    </div>
  )
}

export default Profile
