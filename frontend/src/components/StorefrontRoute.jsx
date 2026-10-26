import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'

// Shop owners manage their own listings; they do not browse or buy from the storefront.
const StorefrontRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (currentUser?.role === 'shop_admin') {
    return <Navigate to="/my-products" replace />
  }

  return children
}

export default StorefrontRoute
