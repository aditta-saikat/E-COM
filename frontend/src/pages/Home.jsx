import { lazy, Suspense } from 'react'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'

const Dashboard = lazy(() => import('./Dashboard'))
const Landing = lazy(() => import('./Landing'))

const Home = () => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {currentUser ? <Dashboard /> : <Landing />}
    </Suspense>
  )
}

export default Home
