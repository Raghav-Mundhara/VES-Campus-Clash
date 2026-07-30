import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postFollow } from '../lib/api'

export default function Landing() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleFollowClick = async () => {
    setLoading(true)
    try {
      const data = await postFollow()
      localStorage.setItem('ves_session_token', data.token)
      navigate('/register')
    } catch (err) {
      console.error(err)
      alert('Failed to connect. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tight bg-gradient-to-br from-yellow-400 to-red-600 bg-clip-text text-transparent">
            VES Campus Clash
          </h1>
          <p className="text-zinc-400 text-lg">
            Scan. Follow. Register. Play. Score. Share.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6 shadow-xl shadow-red-900/10">
          <p className="text-zinc-300">
            To enter the clash, you must follow our official Instagram page.
          </p>
          
          <button
            onClick={handleFollowClick}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-lg bg-red-600 text-white hover:bg-red-500 active:bg-red-700 disabled:opacity-50 transition-colors shadow-lg shadow-red-600/20"
          >
            {loading ? 'Entering...' : "I've Followed"}
          </button>
        </div>
      </div>
    </div>
  )
}
