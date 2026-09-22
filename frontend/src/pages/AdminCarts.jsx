import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { listAllCarts } from '../api/cart'
import AdminCartsTable from '../components/AdminCartsTable'

const AdminCarts = () => {
  const [carts, setCarts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listAllCarts()
      .then((data) => setCarts(data.items))
      .catch(() => setError('Could not load carts'))
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <ShieldCheck size={22} className="text-rose-600 dark:text-rose-400" />
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Carts</h1>
      </div>

      {error && <p className="mb-6 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      {carts === null && !error && <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>}

      {carts !== null && <AdminCartsTable carts={carts} emptyMessage="No one has an active cart right now." />}
    </div>
  )
}

export default AdminCarts
