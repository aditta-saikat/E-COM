import { useEffect, useState } from 'react'
import { Check, ShieldCheck, Store, X } from 'lucide-react'
import { approveShop, listPendingShops, rejectShop } from '../api/shops'

const AdminShops = () => {
  const [shops, setShops] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const result = await listPendingShops()
      setShops(result.items)
    } catch (err) {
      setError('Could not load pending shops')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleApprove = async (id) => {
    await approveShop(id)
    await load()
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):') || ''
    await rejectShop(id, reason)
    await load()
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <ShieldCheck size={22} className="text-rose-600" />
        <h1 className="font-display text-2xl font-bold text-slate-900">Pending shop requests</h1>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {shops.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <Store size={32} className="text-slate-300" />
          <p className="text-sm text-slate-500">No pending requests right now.</p>
        </div>
      )}

      {shops.length > 0 && (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {shops.map((shop) => (
            <li key={shop._id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-500">
                <Store size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{shop.name}</p>
                <p className="truncate text-sm text-slate-500">{shop.description || 'No description'}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => handleApprove(shop._id)}
                  className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                >
                  <Check size={14} />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(shop._id)}
                  className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                >
                  <X size={14} />
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AdminShops
