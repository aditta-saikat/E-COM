import { useEffect, useState } from 'react'
import { createProduct, deleteProduct, listProducts, updateProduct } from '../api/products'
import { useAuth } from '../context/AuthContext'
import ProductsManager from '../components/ProductsManager'

const MyProducts = () => {
  const { currentUser } = useAuth()
  const [products, setProducts] = useState([])

  const load = async () => {
    const result = await listProducts()
    setProducts(result.items.filter((product) => product.createdBy === currentUser._id))
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (payload) => {
    await createProduct(payload)
    await load()
  }

  const handleUpdate = async (id, payload) => {
    await updateProduct(id, payload)
    await load()
  }

  const handleDelete = async (id) => {
    await deleteProduct(id)
    await load()
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">My products</h1>

      <ProductsManager
        products={products}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        emptyMessage="You haven't added any products yet."
      />
    </div>
  )
}

export default MyProducts
