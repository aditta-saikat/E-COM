import { useEffect, useState } from 'react'
import { ReceiptText } from 'lucide-react'
import { listOrders } from '../api/orders'
import EmptyState from '../components/EmptyState'
import OrdersTable from '../components/OrdersTable'
import PageHeader from '../components/PageHeader'

const Orders = () => {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listOrders()
      .then((data) => setOrders(data.items))
      .catch(() => setError('Could not load your orders'))
  }, [])

  if (error) {
    return <p className="p-6 text-sm text-rose-600 dark:text-rose-400">{error}</p>
  }

  if (!orders) {
    return <p className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="No orders yet"
        description="Orders you place will show up here."
        action={{ to: '/products', label: 'Browse products' }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        icon={ReceiptText}
        title="Your orders"
        subtitle={`${orders.length} ${orders.length === 1 ? 'order' : 'orders'} placed so far. Click one to see its details.`}
      />

      <OrdersTable orders={orders} showCustomer={false} emptyMessage="You have not placed any orders yet." />
    </div>
  )
}

export default Orders
