import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  LayoutGrid,
  List,
  LogOut,
  Search,
  ShieldCheck,
  Store,
  X,
  XCircle,
} from 'lucide-react'
import { approveShop, listPendingShops, listShops, rejectShop } from '../api/shops'
import { useAuth } from '../context/AuthContext'

const STATUS_META = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  approved: { label: 'Approved', icon: Check, className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
}

const formatDate = (isoDate) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoDate))

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
    <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-white ${accent}`}>
      <Icon size={16} />
    </div>
    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
  </div>
)

const AdminShops = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [pending, setPending] = useState([])
  const [allShops, setAllShops] = useState([])
  const [error, setError] = useState('')
  const [stalePermissions, setStalePermissions] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [view, setView] = useState(() => localStorage.getItem('admin_shops_view') || 'table')

  const load = async () => {
    setError('')
    setStalePermissions(false)

    try {
      const [pendingResult, allResult] = await Promise.all([listPendingShops(), listShops()])
      setPending(pendingResult.items)
      setAllShops(allResult.items)
    } catch (err) {
      if (err.response?.status === 403) {
        setStalePermissions(true)
        setError('Your session was issued before you became an admin, so it still has your old permissions.')
      } else {
        setError('Could not load shops')
      }
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleReLogin = async () => {
    await logout()
    navigate('/login')
  }

  const handleApprove = async (id) => {
    await approveShop(id)
    await load()
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):') || ''
    await rejectShop(id, reason)
    await load()
  }

  const setViewMode = (mode) => {
    setView(mode)
    localStorage.setItem('admin_shops_view', mode)
  }

  const filteredShops = useMemo(
    () =>
      allShops.filter((shop) => {
        if (search && !shop.name.toLowerCase().includes(search.trim().toLowerCase())) return false
        if (statusFilter && shop.status !== statusFilter) return false
        return true
      }),
    [allShops, search, statusFilter],
  )

  const counts = useMemo(
    () => ({
      total: allShops.length,
      approved: allShops.filter((shop) => shop.status === 'approved').length,
      pending: allShops.filter((shop) => shop.status === 'pending').length,
      rejected: allShops.filter((shop) => shop.status === 'rejected').length,
    }),
    [allShops],
  )

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <ShieldCheck size={22} className="text-rose-600 dark:text-rose-400" />
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Admin</h1>
      </div>

      {error && stalePermissions && (
        <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          <p>{error} Log out and back in to refresh it.</p>
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
      {error && !stalePermissions && <p className="mb-6 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Store} label="Total shops" value={counts.total} accent="bg-indigo-500" />
        <StatCard icon={CheckCircle2} label="Approved" value={counts.approved} accent="bg-emerald-500" />
        <StatCard icon={Clock} label="Pending" value={counts.pending} accent="bg-amber-500" />
        <StatCard icon={XCircle} label="Rejected" value={counts.rejected} accent="bg-rose-500" />
      </div>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Pending requests</h2>
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {pending.map((shop) => (
              <li key={shop._id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-500 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-400">
                  <Store size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-slate-100">{shop.name}</p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{shop.description || 'No description'}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(shop._id)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                  >
                    <Check size={14} />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(shop._id)}
                    className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">All shops</h2>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search shops..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-48 rounded-lg border border-slate-300 py-1.5 pr-3 pl-8 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pr-8 pl-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              className={`rounded-md p-1.5 transition ${
                view === 'table'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`rounded-md p-1.5 transition ${
                view === 'grid'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {filteredShops.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <Store size={32} className="text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {allShops.length === 0 ? 'No shops yet.' : 'No shops match your filters.'}
          </p>
        </div>
      )}

      {filteredShops.length > 0 && view === 'table' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                <th className="px-5 py-3">Shop</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredShops.map((shop) => {
                const statusMeta = STATUS_META[shop.status]
                const StatusIcon = statusMeta.icon

                return (
                  <tr
                    key={shop._id}
                    onClick={() => navigate(`/admin/shops/${shop._id}`)}
                    tabIndex={0}
                    onKeyDown={(event) => event.key === 'Enter' && navigate(`/admin/shops/${shop._id}`)}
                    className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-500 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-400">
                          <Store size={15} />
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{shop.name}</span>
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-5 py-3 text-slate-500 dark:text-slate-400">
                      {shop.description || 'No description'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
                      >
                        <StatusIcon size={12} />
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatDate(shop.createdAt)}</td>
                    <td className="px-5 py-3">
                      <ChevronRight size={16} className="text-slate-300 dark:text-slate-700" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredShops.length > 0 && view === 'grid' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredShops.map((shop) => {
            const statusMeta = STATUS_META[shop.status]
            const StatusIcon = statusMeta.icon

            return (
              <button
                key={shop._id}
                type="button"
                onClick={() => navigate(`/admin/shops/${shop._id}`)}
                className="group flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-3 flex w-full items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-500 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-400">
                    <Store size={18} />
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
                  >
                    <StatusIcon size={12} />
                    {statusMeta.label}
                  </span>
                </div>
                <p className="font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                  {shop.name}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {shop.description || 'No description'}
                </p>
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-600">Created {formatDate(shop.createdAt)}</p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminShops
