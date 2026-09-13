import { useEffect, useMemo, useState } from 'react'
import { ArrowDownAZ, ChevronDown, PackageSearch, Search, SlidersHorizontal } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { listProducts } from '../api/products'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

const selectClass = 'w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pr-9 pl-9 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-48'

const sortProducts = (items, sortBy) => {
  if (sortBy === 'price-asc') return [...items].sort((a, b) => a.price - b.price)
  if (sortBy === 'price-desc') return [...items].sort((a, b) => b.price - a.price)
  return items
}

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listProducts()
      .then((result) => {
        const unique = [...new Set(result.items.map((item) => item.category))].sort()
        setCategories(unique)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const result = await listProducts({ search, category: category || undefined })
        setProducts(result.items)
      } catch (err) {
        setError('Could not load products. Is product-catalog-service running?')
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, category])

  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy])

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-slate-900">Browse products</h1>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 pr-3 pl-9 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="relative">
          <SlidersHorizontal size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
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
            onChange={(event) => setSortBy(event.target.value)}
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
        <p className="mb-4 text-sm text-slate-500">
          {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="aspect-square bg-slate-100" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-3/4 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && !error && sortedProducts.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <PackageSearch size={32} className="text-slate-300" />
          <p className="text-sm text-slate-500">No products found.</p>
        </div>
      )}

      {!loading && !error && sortedProducts.length > 0 && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Products
