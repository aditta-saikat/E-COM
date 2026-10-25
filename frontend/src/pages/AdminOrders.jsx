import { useEffect, useState } from 'react'
import { ReceiptText } from 'lucide-react'
import { listAllOrders } from '../api/orders'
import PageHeader from '../components/PageHeader'
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
    <div className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader icon={ReceiptText} title="Orders" subtitle="Every order placed across all shops." />

      {error && <p className="mb-6 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      {orders === null && !error && <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>}

      {orders !== null && <AdminOrdersTable orders={orders} emptyMessage="No orders have been placed yet." />}
    </div>
  )
}

export default AdminOrders
