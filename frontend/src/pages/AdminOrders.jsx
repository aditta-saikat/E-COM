import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { listAllOrders } from '../api/orders'
import AdminTabs from '../components/AdminTabs'
import AdminOrdersTable from '../components/AdminOrdersTable'

const AdminOrders = () => {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listAllOrders()
      .then((data) => setOrders(data.items))
      .catch(() => setError('Could not load orders'))
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <ShieldCheck size={22} className="text-rose-600 dark:text-rose-400" />
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Admin</h1>
      </div>

      <AdminTabs />

      {error && <p className="mb-6 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      {orders === null && !error && <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>}

      {orders !== null && <AdminOrdersTable orders={orders} emptyMessage="No orders have been placed yet." />}
    </div>
  )
}

export default AdminOrders
