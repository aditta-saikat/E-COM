import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, CreditCard, Loader2, MapPin, Phone, ShieldCheck, ShoppingCart, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { createOrder } from '../api/orders'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import OrderSummary from '../components/OrderSummary'
import PageHeader from '../components/PageHeader'

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
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is empty"
        description="Add something to your cart before checking out."
        action={{ to: '/products', label: 'Browse products' }}
      />
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const order = await createOrder({ fullName: fullName.trim(), phone: phone.trim(), address: address.trim() })

      // Redirect gateways (SSLCommerz): the customer pays on the gateway's page and returns to the order page.
      if (order.paymentUrl) {
        window.location.assign(order.paymentUrl)
        return
      }

      await refresh()
      navigate(`/orders/${order._id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place your order')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Link
        to="/cart"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ChevronLeft size={15} />
        Back to cart
      </Link>

      <PageHeader icon={CreditCard} title="Checkout" subtitle="Tell us where to send your order." />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Shipping details</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">We will use these details to deliver your order.</p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <FormField
              label="Full name"
              icon={User}
              required
              autoComplete="name"
              placeholder="Your full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
            <FormField
              label="Phone number"
              icon={Phone}
              type="tel"
              required
              autoComplete="tel"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <div className="sm:col-span-2">
              <FormField
                label="Shipping address"
                icon={MapPin}
                multiline
                rows={3}
                required
                autoComplete="street-address"
                placeholder="House, road, area, city"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-5 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </p>
          )}
        </div>

        <OrderSummary items={items} subtotal={cart.subtotal}>
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-indigo-500/90 dark:hover:bg-indigo-500"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            You may be redirected to our payment partner to complete your payment securely.
          </p>
        </OrderSummary>
      </form>
    </div>
  )
}

export default Checkout
