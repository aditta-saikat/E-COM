import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'

const RoleRoute = ({ roles, children }) => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RoleRoute
