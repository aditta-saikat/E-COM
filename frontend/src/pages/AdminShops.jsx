import { useEffect, useState } from 'react'
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
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Pending shop requests</h1>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {shops.length === 0 && !error && (
        <p className="text-sm text-slate-500">No pending requests right now.</p>
      )}

      <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {shops.map((shop) => (
          <li key={shop._id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="font-medium text-slate-900">{shop.name}</p>
              <p className="text-sm text-slate-500">{shop.description || 'No description'}</p>
            </div>
            <div className="flex gap-3 text-sm font-medium">
              <button
                type="button"
                onClick={() => handleApprove(shop._id)}
                className="text-emerald-600 hover:text-emerald-500"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleReject(shop._id)}
                className="text-rose-600 hover:text-rose-500"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AdminShops
