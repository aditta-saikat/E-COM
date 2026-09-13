import { Link } from 'react-router-dom'
import { ArrowRight, Package, ShieldCheck, Sparkles, Store } from 'lucide-react'

const FEATURES = [
  { icon: Package, text: 'Browse a growing catalog of real shops' },
  { icon: Store, text: 'Open your own shop in minutes' },
  { icon: ShieldCheck, text: 'Verified sellers, reviewed by admins' },
]

const Landing = () => (
  <div className="grid flex-1 lg:grid-cols-2">
    <div className="relative flex flex-col justify-center overflow-hidden bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-600 px-8 py-16 text-white sm:px-16">
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative animate-fade-in-up">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">
          <Sparkles size={13} />
          The marketplace, rebuilt
        </span>

        <h1 className="font-display mt-5 max-w-md text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
          Everything you need, one platform away.
        </h1>
        <p className="mt-4 max-w-md text-indigo-100">
          Browse products, list your own, and manage it all from one place. Sign in to get to
          your dashboard.
        </p>

        <ul className="mt-8 space-y-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-indigo-50">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                <Icon size={14} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="flex flex-col items-center justify-center bg-slate-50 px-8 py-16 sm:px-16">
      <div className="w-full max-w-sm animate-fade-in-up text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900">Welcome</h2>
        <p className="mt-2 text-slate-500">Sign in to your account or create a new one.</p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/login"
            className="group flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-600/40"
          >
            Sign in
            <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/signup"
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Create an account
          </Link>
        </div>

        <Link
          to="/products"
          className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Browse products as a guest →
        </Link>
      </div>
    </div>
  </div>
)

export default Landing
