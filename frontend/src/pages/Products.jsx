import { useEffect, useState } from 'react'
import { ArrowDownAZ, ChevronDown, ChevronLeft, ChevronRight, PackageSearch, Search, SlidersHorizontal } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { listCategories, listProducts } from '../api/products'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

const selectClass = 'w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pr-9 pl-9 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-48 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const result = await listProducts({ search, category: category || undefined, sort: sortBy, page })
        if (!Array.isArray(result?.items)) {
          throw new Error('Unexpected response from product-catalog-service')
        }

        setProducts(result.items)
        setTotal(result.total)
        setPageSize(result.pageSize)
      } catch (err) {
        setError('Could not load products. Is product-catalog-service running?')
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, category, sortBy, page])

  const pageCount = Math.max(Math.ceil(total / pageSize), 1)

  const changeFilter = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Browse products</h1>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={changeFilter(setSearch)}
            className="w-full rounded-lg border border-slate-300 py-2.5 pr-3 pl-9 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
          />
        </div>

        <div className="relative">
          <SlidersHorizontal size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <select
            value={category}
            onChange={changeFilter(setCategory)}
            className={selectClass}
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value} className="capitalize">
                {value}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="relative">
          <ArrowDownAZ size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <select
            value={sortBy}
            onChange={changeFilter(setSortBy)}
            className={selectClass}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {!loading && !error && (
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {total} {total === 1 ? 'product' : 'products'} found
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="aspect-square bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <PackageSearch size={32} className="text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No products found.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {!loading && !error && pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((value) => value - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={15} />
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => value + 1)}
            disabled={page >= pageCount}
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Next
            <ChevronRight size={15} />
          </button>
        </nav>
      )}
    </div>
  )
}

export default Products
