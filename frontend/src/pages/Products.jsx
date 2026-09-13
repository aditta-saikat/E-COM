import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { listProducts } from '../api/products'

const Products = () => {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const result = await listProducts({ search })
        setProducts(result.items)
      } catch (err) {
        setError('Could not load products. Is product-catalog-service running?')
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search])

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Browse products</h1>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-6 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="text-sm text-slate-500">No products found.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default Products
