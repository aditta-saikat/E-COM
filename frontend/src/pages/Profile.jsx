import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const { currentUser } = useAuth()

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Profile</h1>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-cyan-600 text-lg font-semibold text-white">
            {(currentUser.displayName || currentUser.email)[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {currentUser.displayName || 'No display name'}
            </p>
            <p className="text-sm text-slate-500">{currentUser.email}</p>
          </div>
        </div>

        <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          {currentUser.role}
        </span>
      </div>
    </div>
  )
}

export default Profile
