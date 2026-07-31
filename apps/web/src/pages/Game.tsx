import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { postGameStart, postGameAnswer, getSessionStatus } from '../lib/api'

export default function Game() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [question, setQuestion] = useState<string>('')
  const [questionIndex, setQuestionIndex] = useState<number>(0)
  const questionIndexRef = useRef<number>(0) // always holds the latest questionIndex, avoids stale closures in timers

  const [answerInput, setAnswerInput] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState<number>(10)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)

  const [totalScore, setTotalScore] = useState<number>(0)
  const [lastEarned, setLastEarned] = useState<number | null>(null)

  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  // keeps state + ref in sync so both React renders and timer callbacks see the current value
  const updateQuestionIndex = (idx: number) => {
    questionIndexRef.current = idx
    setQuestionIndex(idx)
  }

  useEffect(() => {
    async function initGame() {
      const token = localStorage.getItem('ves_session_token')
      if (!token) return navigate('/')

      try {
        const status = await getSessionStatus(token)
        if (status.step === 'PLAYING' || status.step === 'REGISTERED') {
          setTotalScore((status as any).score ?? 0)
          const res = await postGameStart(token)
          setQuestion(res.question)
          updateQuestionIndex(res.questionIndex)

          if ((res as any).startedAt) {
            const serverStart = new Date((res as any).startedAt).getTime()
            startTimeRef.current = serverStart
          } else {
            startTimeRef.current = Date.now()
          }
          startTimer(true)
          setLoading(false)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to start game')
        setLoading(false)
      }
    }
    initGame()

    return () => stopTimer()
  }, [navigate])

  const startTimer = (resume = false) => {
    if (!resume) {
      startTimeRef.current = Date.now()
    }
    const initialElapsed = (Date.now() - startTimeRef.current) / 1000
    setTimeLeft(Math.max(0, 10 - initialElapsed))

    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const remaining = Math.max(0, 10 - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        stopTimer()
        handleSubmit(null) // timeout — no answer submitted
      }
    }, 100) // update every 100ms for smooth progress bar
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const handleSubmit = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    stopTimer()
    setIsSubmitting(true)

    const token = localStorage.getItem('ves_session_token')
    if (!token) return

    const submittedAnswer = answerInput.trim() !== '' ? Number(answerInput) : -999

    try {
      const res = await postGameAnswer(token, submittedAnswer, questionIndexRef.current)

      if (res.earned > 0) {
        setFeedback('correct')
      } else {
        setFeedback('incorrect')
      }
      setLastEarned(res.earned)
      setTotalScore(res.totalScore)

      setTimeout(() => {
        setFeedback(null)
        setAnswerInput('')

        if (res.gameOver) {
          navigate('/result', { replace: true })
        } else {
          setQuestion(res.question || '')
          updateQuestionIndex(res.questionIndex || 0)
          setIsSubmitting(false)
          startTimer()
        }
      }, 1000)

    } catch (err: any) {
      // Don't block the whole game on a failed submit — treat it as a missed
      // answer, log it, and keep the flow moving instead of showing an error page.
      console.error('Failed to submit answer:', err)
      setFeedback('incorrect')
      setLastEarned(0)

      setTimeout(() => {
        setFeedback(null)
        setAnswerInput('')
        setIsSubmitting(false)
        startTimer()
      }, 1000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-yellow-400 font-bold text-xl tracking-widest uppercase">Loading Clash...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center space-y-4">
          <h2 className="text-xl font-bold text-red-500">Error</h2>
          <p className="text-zinc-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">

        <div className="flex justify-between items-center text-sm font-medium text-zinc-400">
          <div>Question {questionIndex + 1} / 10</div>
          <div className="flex items-center gap-4">
            <div className="text-white font-mono text-base">
              Score: <span className="text-yellow-400 font-bold">{totalScore}</span>
            </div>
            <div className="text-yellow-400 font-mono text-base">{timeLeft.toFixed(1)}s</div>
          </div>
        </div>

        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear ${timeLeft > 3 ? 'bg-yellow-400' : 'bg-red-500'}`}
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>

        <div className={`
          bg-zinc-900 border-2 rounded-2xl p-8 shadow-2xl transition-colors duration-300 relative
          ${feedback === 'correct' ? 'border-green-500 bg-green-500/10' : ''}
          ${feedback === 'incorrect' ? 'border-red-500 bg-red-500/10' : ''}
          ${feedback === null ? 'border-zinc-800' : ''}
        `}>
          {feedback && lastEarned !== null && (
            <div className={`absolute -top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${
              feedback === 'correct' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
            }`}>
              {feedback === 'correct' ? `+${lastEarned}` : '+0'}
            </div>
          )}

          <div className="text-5xl font-black text-center mb-8 tracking-wider font-mono">
            {question}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="number"
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              disabled={isSubmitting || feedback !== null}
              autoFocus
              className="w-full text-center text-3xl font-bold px-4 py-4 bg-zinc-950 border-2 border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-400 transition-colors"
              placeholder="?"
            />

            <button
              type="submit"
              disabled={isSubmitting || feedback !== null || answerInput === ''}
              className={`w-full py-4 rounded-xl font-bold text-lg text-black transition-all ${
                isSubmitting || feedback !== null || answerInput === ''
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 shadow-lg shadow-yellow-500/20'
              }`}
            >
              Submit Answer
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}