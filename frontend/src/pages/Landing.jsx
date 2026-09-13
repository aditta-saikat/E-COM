import { Link } from 'react-router-dom'

const Landing = () => (
  <div className="grid flex-1 lg:grid-cols-2">
    <div className="relative flex flex-col justify-center overflow-hidden bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-600 px-8 py-16 text-white sm:px-16">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

      <p className="relative text-sm font-medium tracking-wide text-indigo-100 uppercase">
        The marketplace, rebuilt
      </p>
      <h1 className="relative mt-3 max-w-md text-4xl font-bold tracking-tight sm:text-5xl">
        Everything you need, one platform away.
      </h1>
      <p className="relative mt-4 max-w-md text-indigo-100">
        Browse products, list your own, and manage it all from one place. Sign in to get to
        your dashboard.
      </p>
    </div>

    <div className="flex flex-col items-center justify-center bg-slate-50 px-8 py-16 sm:px-16">
      <div className="w-full max-w-sm text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Welcome</h2>
        <p className="mt-2 text-slate-500">Sign in to your account or create a new one.</p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/login"
            className="rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            Sign in
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
