import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, Lock, Mail, User } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'

const Signup = () => {
  const [displayName, setDisplayName] = useState('')
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
      await signup(email, password, displayName.trim())
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
    <AuthShell
      badge="Join E-COM"
      heading="Start buying and selling today."
      subheading="Create a free account to shop from verified sellers or open a shop of your own."
    >
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Create an account</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">It only takes a minute.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <FormField
          label="Display name"
          icon={User}
          autoComplete="name"
          placeholder="Your name (optional)"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
        <FormField
          label="Email"
          icon={Mail}
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormField
          label="Password"
          icon={Lock}
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Create a password"
          hint="At least 6 characters."
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-indigo-500/90 dark:hover:bg-indigo-500"
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
          Sign up
          {!submitting && <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}

export default Signup
