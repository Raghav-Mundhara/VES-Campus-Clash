import { Router, Request, Response } from 'express'
import { randomBytes } from 'crypto'
import { prisma } from '../lib/prisma'
import { sessionAuth } from '../middleware/sessionAuth'
import { generateQuestion, calculateScore } from '../services/gameService'

export const gameRouter = Router()

gameRouter.post('/start', sessionAuth, async (req: Request, res: Response) => {
  const session = req.session!

  if (session.step === 'PLAYING') {
    const q = generateQuestion(session.puzzleSeed!, session.currentQuestion)
    res.status(200).json({
      success: true,
      step: 'PLAYING',
      question: q.display,
      questionIndex: session.currentQuestion,
      startedAt: session.questionStartedAt
    })
    return
  }

  if (session.step !== 'REGISTERED') {
    res.status(403).json({ error: 'Session is not in REGISTERED state' })
    return
  }

  try {
    const puzzleSeed = `${session.token}-${randomBytes(4).toString('hex')}`
    const questionStartedAt = new Date()

    await prisma.session.update({
      where: { id: session.id },
      data: {
        step: 'PLAYING',
        puzzleSeed,
        questionStartedAt,
        currentQuestion: 0,
        score: 0,
      },
    })

    const q = generateQuestion(puzzleSeed, 0)

    res.status(200).json({
      success: true,
      step: 'PLAYING',
      question: q.display,
      questionIndex: 0,
      startedAt: questionStartedAt
    })
  } catch (err) {
    console.error('[POST /game/start]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

gameRouter.post('/answer', sessionAuth, async (req: Request, res: Response) => {
  const session = req.session!

  if (session.step !== 'PLAYING') {
    res.status(403).json({ error: 'Session is not in PLAYING state' })
    return
  }

  const { answer, questionIndex } = req.body
  if (answer === undefined || questionIndex === undefined) {
    res.status(400).json({ error: 'Answer and questionIndex are required' })
    return
  }

  if (questionIndex !== session.currentQuestion) {
    res.status(409).json({ error: 'Question index mismatch (already answered)' })
    return
  }

  try {
    const now = new Date()
    const startedAt = session.questionStartedAt || now
    const elapsedMs = now.getTime() - startedAt.getTime()

    const q = generateQuestion(session.puzzleSeed!, session.currentQuestion)
    
    let earned = 0
    const parsedAnswer = Number(answer)
    
    if (parsedAnswer === q.answer) {
      earned = calculateScore(session.currentQuestion, elapsedMs)
    }

    const nextQuestionIndex = session.currentQuestion + 1
    const newTotalScore = (session.score || 0) + earned
    const isGameOver = nextQuestionIndex >= 10

    await prisma.session.update({
      where: { id: session.id },
      data: {
        score: newTotalScore,
        currentQuestion: nextQuestionIndex,
        questionStartedAt: isGameOver ? null : now,
        step: isGameOver ? 'COMPLETED' : 'PLAYING',
        completedAt: isGameOver ? now : undefined
      },
    })

    if (isGameOver) {
      res.status(200).json({
        success: true,
        step: 'COMPLETED',
        earned,
        totalScore: newTotalScore,
        gameOver: true
      })
      return
    }

    const nextQ = generateQuestion(session.puzzleSeed!, nextQuestionIndex)

    res.status(200).json({
      success: true,
      step: 'PLAYING',
      earned,
      totalScore: newTotalScore,
      question: nextQ.display,
      questionIndex: nextQuestionIndex,
      gameOver: false
    })
  } catch (err) {
    console.error('[POST /game/answer]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})
