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

export async function postFollow(): Promise<{ token: string; step: Step }> {
  const res = await fetch('/api/session/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  
  if (!res.ok) {
    throw new Error('Failed to create session')
  }
  
  return res.json()
}

export async function getSessionStatus(token: string): Promise<SessionStatus> {
  const res = await fetch(`/api/session/${token}/status`, {
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
