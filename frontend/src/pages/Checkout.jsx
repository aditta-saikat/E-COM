import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ShieldCheck } from 'lucide-react'
import { formatPrice } from '../lib/formatPrice'
import { useCart } from '../context/CartContext'
import { createOrder } from '../api/orders'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500'

const Checkout = () => {
  const { cart, refresh } = useCart()
  const navigate = useNavigate()
  const items = cart.items || []

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Your cart is empty.</p>
      </div>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const order = await createOrder({ fullName, phone, address })
      await refresh()
      navigate(`/orders/${order._id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place your order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Checkout</h1>

      <div className="grid gap-6 sm:grid-cols-5">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:col-span-3 dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="font-medium text-slate-900 dark:text-slate-100">Shipping details</h2>

          <input
            required
            placeholder="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={inputClass}
          />
          <input
            required
            placeholder="Phone number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClass}
          />
          <textarea
            required
            placeholder="Shipping address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            rows={3}
            className={inputClass}
          />

          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </form>

        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-medium text-slate-900 dark:text-slate-100">Order summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formatPrice(item.price * item.quantity, item.currency)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
            <span className="font-medium text-slate-900 dark:text-slate-100">Total</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {formatPrice(cart.subtotal, items[0]?.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
