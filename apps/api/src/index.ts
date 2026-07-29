import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'

import { sessionRouter } from './routes/session'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Feature routers
app.use('/api/session', sessionRouter)
// app.use('/api/register', registerRouter)   // Day 2
// app.use('/api/game',     gameRouter)        // Day 3
// app.use('/api/result',   resultRouter)      // Day 4
// app.use('/api/card',     cardRouter)        // Day 4

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[unhandled]', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`)
})

export default app
