import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json())


app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

// app.use('/api/session', sessionRouter)
// app.use('/api/follow',  followRouter)
// app.use('/api/register', registerRouter)
// app.use('/api/game',    gameRouter)
// app.use('/api/result',  resultRouter)
// app.use('/api/card',    cardRouter)

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`)
})

export default app
