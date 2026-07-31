// api.ts — typed fetch wrappers

export type Step = 'FOLLOWED' | 'REGISTERED' | 'PLAYING' | 'COMPLETED'

export interface SessionStatus {
  token: string
  step: Step
  currentQuestion: number
  playerName: string | null
  igHandle: string | null
  score: number | null
  completedAt: string | null
}

const API_BASE = import.meta.env.VITE_API_URL;

export async function postFollow(): Promise<{ token: string; step: Step }> {
  const res = await fetch(`${API_BASE}/api/session/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  
  if (!res.ok) {
    throw new Error('Failed to create session')
  }
  
  return res.json()
}

export async function postRegister(token: string, data: any): Promise<{ success: boolean; step: Step }> {
  const res = await fetch(`${API_BASE}/api/session/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.error || 'Registration failed')
  }

  return res.json()
}

export async function getSessionStatus(token: string): Promise<SessionStatus> {
  const res = await fetch(`${API_BASE}/api/session/${token}/status`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Session not found')
    }
    throw new Error('Failed to fetch session status')
  }
  
  return res.json()
}

export interface GameStartResponse {
  success: boolean
  step: Step
  question: string
  questionIndex: number
}

export async function postGameStart(token: string): Promise<GameStartResponse> {
  const res = await fetch(`${API_BASE}/api/game/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to start game')
  return res.json()
}

export interface GameAnswerResponse {
  success: boolean
  step: Step
  earned: number
  totalScore: number
  question?: string
  questionIndex?: number
  gameOver: boolean
}

export async function postGameAnswer(token: string, answer: number, questionIndex: number): Promise<GameAnswerResponse> {
  const res = await fetch(`${API_BASE}/api/game/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ answer, questionIndex })
  })
  if (!res.ok) throw new Error('Failed to submit answer')
  return res.json()
}
