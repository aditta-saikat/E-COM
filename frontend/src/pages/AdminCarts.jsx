import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { listAllCarts } from '../api/cart'
import PageHeader from '../components/PageHeader'
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
    <div className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader icon={ShoppingCart} title="Carts" subtitle="Active carts customers are building right now." />

      {error && <p className="mb-6 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      {carts === null && !error && <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>}

      {carts !== null && <AdminCartsTable carts={carts} emptyMessage="No one has an active cart right now." />}
    </div>
  )
}

export default AdminCarts
