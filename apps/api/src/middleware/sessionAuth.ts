import { Request, Response, NextFunction } from 'express'
import { Session } from '@prisma/client'
import { prisma } from '../lib/prisma'

declare global {
  namespace Express {
    interface Request {
      session?: Session
    }
  }
}


export async function sessionAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractToken(req)

  if (!token) {
    res.status(401).json({ error: 'Missing session token' })
    return
  }

  try {
    const session = await prisma.session.findUnique({ where: { token } })

    if (!session) {
      res.status(401).json({ error: 'Invalid session token' })
      return
    }

    req.session = session
    next()
  } catch (err) {
    console.error('[sessionAuth] DB error', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

function extractToken(req: Request): string | null {
  // 1. Authorization: Bearer <token>
  const auth = req.headers['authorization']
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7).trim() || null
  }

  // 2. Cookie: session=<token>
  const cookieHeader = req.headers['cookie'] ?? ''
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/)
  if (match) {
    return match[1].trim() || null
  }

  return null
}
