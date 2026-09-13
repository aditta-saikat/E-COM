import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import LoadingScreen from './components/LoadingScreen'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const MyProducts = lazy(() => import('./pages/MyProducts'))
const MyShop = lazy(() => import('./pages/MyShop'))
const AdminShops = lazy(() => import('./pages/AdminShops'))

const App = () => (
  <div className="flex min-h-screen flex-col bg-slate-50">
    <Navbar />

    <main className="flex flex-1 flex-col">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-shop"
            element={
              <RoleRoute roles={['customer', 'shop_admin']}>
                <MyShop />
              </RoleRoute>
            }
          />
          <Route
            path="/my-products"
            element={
              <RoleRoute roles={['shop_admin', 'admin']}>
                <MyProducts />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/shops"
            element={
              <RoleRoute roles={['admin']}>
                <AdminShops />
              </RoleRoute>
            }
          />
        </Routes>
      </Suspense>
    </main>
  </div>
)

export default App
