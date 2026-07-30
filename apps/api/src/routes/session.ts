import { Router, Request, Response } from 'express'
import { randomBytes } from 'crypto'
import { prisma } from '../lib/prisma'
import { sessionAuth } from '../middleware/sessionAuth'
import { registerSchema } from '../lib/schemas'

export const sessionRouter = Router()

sessionRouter.post('/follow', async (_req: Request, res: Response) => {
  try {
    const token = randomBytes(32).toString('hex')

    const session = await prisma.session.create({
      data: { token },
    })

    res.status(201).json({ token: session.token, step: session.step })
  } catch (err) {
    console.error('[POST /session/follow]', err)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

sessionRouter.post('/register', sessionAuth, async (req: Request, res: Response) => {
  const session = req.session!

  if (session.step !== 'FOLLOWED') {
    res.status(403).json({ error: 'Session is not in FOLLOWED state' })
    return
  }

  try {
    const validatedData = registerSchema.parse(req.body)

    let player = await prisma.player.findFirst({
      where: { igHandle: validatedData.igHandle }
    })

    if (player) {
      player = await prisma.player.update({
        where: { id: player.id },
        data: validatedData,
      })
    } else {
      player = await prisma.player.create({
        data: validatedData,
      })
    }

    await prisma.session.update({
      where: { id: session.id },
      data: {
        step: 'REGISTERED',
        playerId: player.id,
      },
    })

    res.status(200).json({ success: true, step: 'REGISTERED' })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors })
      return
    }
    console.error('[POST /session/register]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

sessionRouter.get('/:token/status', async (req: Request, res: Response) => {
  const { token } = req.params

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        player: {
          select: { name: true, igHandle: true },
        },
      },
    })

    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }

    res.status(200).json({
      token: session.token,
      step: session.step,
      currentQuestion: session.currentQuestion,
      // Populated after registration
      playerName: session.player?.name ?? null,
      igHandle: session.player?.igHandle ?? null,
      // Populated after game completes
      score: session.score ?? null,
      completedAt: session.completedAt ?? null,
    })
  } catch (err) {
    console.error('[GET /session/:token/status]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})


sessionRouter.get('/me', sessionAuth, (req: Request, res: Response) => {
  const s = req.session!
  res.status(200).json({
    token: s.token,
    step: s.step,
    currentQuestion: s.currentQuestion,
    score: s.score ?? null,
    completedAt: s.completedAt ?? null,
  })
})
