import { useEffect, useState } from 'react'
import { createProduct, deleteProduct, listProducts, updateProduct } from '../api/products'
import { useAuth } from '../context/AuthContext'
import { Package } from 'lucide-react'
import PageHeader from '../components/PageHeader'
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
    <div className="mx-auto max-w-6xl animate-fade-in-up px-6 py-8">
      <PageHeader
        icon={Package}
        title="My products"
        subtitle={`${products.length} ${products.length === 1 ? 'listing' : 'listings'} in your shop. Click the pencil to edit one.`}
      />

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
