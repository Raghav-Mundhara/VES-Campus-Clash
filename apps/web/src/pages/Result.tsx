import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessionStatus, SessionStatus } from '../lib/api'
import html2canvas from 'html2canvas'

export default function Result() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<SessionStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem('ves_session_token')
      if (!token) return navigate('/')

      try {
        const currentStatus = await getSessionStatus(token)
        setStatus(currentStatus)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch result')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [navigate])

  const handleDownload = async () => {
    if (!cardRef.current || !status) return
    setIsDownloading(true)
    try {
      await document.fonts.ready
      await new Promise(resolve => setTimeout(resolve, 100))

      const canvas = await html2canvas(cardRef.current, {
        scale: 1,
        useCORS: true,
        backgroundColor: '#09090b',
        logging: false
      })
      
      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = `ves-campus-clash-${status.igHandle || 'score'}.png`
      link.click()
    } catch (err) {
      console.error('Failed to generate card:', err)
      alert('Failed to generate story card. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white animate-pulse">Loading Result...</div>
  }

  if (error || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6">
        <div className="text-red-500 bg-red-500/10 p-4 rounded-xl">{error || 'Unknown error'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 overflow-hidden">

      {/* Main UI */}
      <div className="max-w-md w-full space-y-8 bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-800 text-center relative z-10">
        <h1 className="text-4xl font-extrabold text-yellow-400">
          Game Over!
        </h1>
        
        <div className="py-6 space-y-2">
          <p className="text-zinc-400 font-medium uppercase tracking-widest text-sm">Final Score</p>
          <div className="text-7xl font-black text-white font-mono drop-shadow-lg">
            {status.score ?? 0}
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-full py-4 rounded-xl font-bold text-lg text-black transition-all ${
              isDownloading
                ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 shadow-lg shadow-yellow-500/20'
            }`}
          >
            {isDownloading ? 'Generating Card...' : 'Download Story Card'}
          </button>
          
          <p className="text-sm text-zinc-400">
            Share this card on your Instagram Story and tag <strong className="text-white">@vescampusclash</strong> to enter the leaderboard!
          </p>
        </div>
      </div>

      <div className="absolute top-[9999px] left-[9999px]" style={{ zIndex: -9999 }}>
        <div 
          ref={cardRef} 
          className="w-[1080px] h-[1920px] flex flex-col items-center justify-center relative overflow-hidden"
          style={{ fontFamily: 'sans-serif', backgroundColor: '#09090b' }}
        >
          <div className="absolute top-0 left-0 w-full h-[600px]" style={{ background: 'linear-gradient(to bottom, rgba(239,68,68,0.2), transparent)' }} />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full" style={{ backgroundColor: 'rgba(250,204,21,0.1)', filter: 'blur(100px)' }} />
          <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.1)', filter: 'blur(100px)' }} />

          <div className="relative z-10 flex flex-col items-center space-y-16 mt-[-100px]">
            <h1 className="text-7xl font-black tracking-tighter uppercase" style={{ color: '#facc15' }}>
              VES Campus Clash
            </h1>
            
            <div className="border-4 p-16 rounded-[3rem] text-center w-[800px]" style={{ backgroundColor: '#18181b', borderColor: '#eab308' }}>
              <p className="text-4xl font-bold tracking-widest uppercase mb-2" style={{ color: '#d4d4d8' }}>I Scored</p>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: '12rem',
                  lineHeight: 1.05,
                  fontWeight: 900,
                  fontFamily: "'Courier New', monospace",
                  marginTop: '-0.4em',       
                  paddingBottom: '0.05em',   
                }}
              >
                {status.score ?? 0}
              </div>
            </div>

            <div className="text-center space-y-4 mt-12">
              <p className="text-5xl font-bold" style={{ color: '#ffffff' }}>{status.playerName}</p>
              <p className="text-4xl font-medium" style={{ color: '#facc15' }}>@{status.igHandle}</p>
            </div>
          </div>
          
          <div className="absolute bottom-20 text-center w-full">
             <p className="text-3xl tracking-widest uppercase" style={{ color: '#a1a1aa' }}>Can you beat my score?</p>
          </div>
        </div>
      </div>

    </div>
  )
}
