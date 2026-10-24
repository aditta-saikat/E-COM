import { Link } from 'react-router-dom'
import { ArrowRight, Package, ShieldCheck, Sparkles, Store } from 'lucide-react'

const FEATURES = [
  { icon: Package, text: 'Browse a growing catalog of real shops' },
  { icon: Store, text: 'Open your own shop in minutes' },
  { icon: ShieldCheck, text: 'Verified sellers, reviewed by admins' },
]

const Landing = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-10">
  <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
    <div className="relative flex flex-col justify-center overflow-hidden bg-linear-to-br from-indigo-100 via-sky-100 to-cyan-100 px-8 py-14 text-slate-900 sm:px-12 dark:from-indigo-950 dark:via-slate-900 dark:to-cyan-950 dark:text-slate-100">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-500/10" />
      <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/10" />
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative animate-fade-in-up">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200 dark:bg-white/10 dark:text-indigo-200 dark:ring-white/10">
          <Sparkles size={13} />
          The marketplace, rebuilt
        </span>

        <h1 className="font-display mt-5 max-w-md text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
          Everything you need, one platform away.
        </h1>
        <p className="mt-4 max-w-md text-slate-600 dark:text-slate-300">
          Browse products, list your own, and manage it all from one place. Sign in to get to
          your dashboard.
        </p>

        <ul className="mt-8 space-y-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 text-indigo-600 ring-1 ring-indigo-200 dark:bg-white/10 dark:text-indigo-300 dark:ring-white/10">
                <Icon size={14} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="flex flex-col items-center justify-center px-8 py-14 sm:px-12">
      <div className="w-full max-w-sm animate-fade-in-up text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Sign in to your account or create a new one.</p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/login"
            className="group flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 dark:bg-indigo-500/90 dark:hover:bg-indigo-500"
          >
            Sign in
            <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/signup"
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            Create an account
          </Link>
        </div>

        <Link
          to="/products"
          className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Browse products as a guest →
        </Link>
      </div>
    </div>
  </div>
  </div>
)

export default Landing
