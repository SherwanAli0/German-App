import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '.env') })
import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { corsGuard } from './middleware/corsGuard.js'

const app = express()
const PORT = process.env.PORT || 3001

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Security middleware
app.use(corsGuard)
app.use(express.json({ limit: '10kb' }))

// ── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok' }, error: false })
})

// ── Streaming conversation turn ───────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  const { systemPrompt, messages, maxTokens = 1024 } = req.body

  if (!systemPrompt || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: true, code: 'BAD_REQUEST', message: 'systemPrompt and messages are required' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  function sendToken(token) {
    res.write(`data: ${JSON.stringify({ token })}\n\n`)
  }

  function sendDone() {
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
  }

  function sendError(code, message) {
    res.write(`data: ${JSON.stringify({ error: true, code, message })}\n\n`)
    res.end()
  }

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        sendToken(event.delta.text)
      }
    }

    sendDone()
  } catch (err) {
    if (err.status === 429) {
      sendError('CLAUDE_RATE_LIMITED', 'Too many requests. Please wait a moment and try again.')
    } else if (err.name === 'AbortError' || err.code === 'ECONNRESET') {
      sendError('STREAM_INTERRUPTED', 'The connection was interrupted. Please try again.')
    } else {
      console.error('[/api/chat]', err)
      sendError('INTERNAL_ERROR', 'Something went wrong on the server.')
    }
  }
})

// ── Bulk content generation (non-streaming) ───────────────────────────────────

app.post('/api/generate', async (req, res) => {
  const { systemPrompt, prompt, maxTokens = 4096 } = req.body

  if (!prompt) {
    return res.status(400).json({ error: true, code: 'BAD_REQUEST', message: 'prompt is required' })
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt || '',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0]?.text ?? ''
    res.json({ data: { text }, error: false })
  } catch (err) {
    if (err.status === 429) {
      return res.status(429).json({ error: true, code: 'CLAUDE_RATE_LIMITED', message: 'Too many requests. Please wait a moment.' })
    }
    console.error('[/api/generate]', err)
    res.status(500).json({ error: true, code: 'INTERNAL_ERROR', message: 'Something went wrong on the server.' })
  }
})

// ── Error handler ─────────────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: true, code: 'FORBIDDEN', message: 'Origin not allowed' })
  }
  console.error(err)
  res.status(500).json({ error: true, code: 'INTERNAL_ERROR', message: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Proxy running on http://localhost:${PORT}`)
})
