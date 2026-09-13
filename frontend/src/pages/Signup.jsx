import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Lock, Mail, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await signup(email, password)
      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.error
          || err.response?.data?.errors?.[0]?.msg
          || 'Could not create account',
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-cyan-600 text-white shadow-sm shadow-indigo-600/30">
          <UserPlus size={19} />
        </div>
        <h1 className="font-display text-xl font-bold text-slate-900">Create an account</h1>
        <p className="mt-1 text-sm text-slate-500">Join E-COM to start buying and selling.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2.5 pr-3 pl-9 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2.5 pr-3 pl-9 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Sign up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
