import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getSessionStatus, Step } from './api'

interface Props {
  children: React.ReactNode
}

export const SessionGuard: React.FC<Props> = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    async function checkState() {
      const token = localStorage.getItem('ves_session_token')
      
      // If no token, only Landing page (/) is allowed
      if (!token) {
        if (location.pathname !== '/') {
          navigate('/', { replace: true })
        }
        setLoading(false)
        return
      }

      try {
        const status = await getSessionStatus(token)
        
        const allowedRoutes: Record<Step, string> = {
          FOLLOWED: '/register',
          REGISTERED: '/game',
          PLAYING: '/game',
          COMPLETED: '/result',
        }

        const targetRoute = allowedRoutes[status.step]

        if (location.pathname !== targetRoute) {
          navigate(targetRoute, { replace: true })
        }
      } catch (err) {
        console.error('Session guard error:', err)
        localStorage.removeItem('ves_session_token')
        if (location.pathname !== '/') {
          navigate('/', { replace: true })
        }
      } finally {
        setLoading(false)
      }
    }

    checkState()
  }, [navigate, location.pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-yellow-400 font-bold text-xl tracking-widest uppercase">Loading Clash...</div>
      </div>
    )
  }

  return <>{children}</>
}
