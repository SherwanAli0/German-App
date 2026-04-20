const PROXY_BASE = 'http://localhost:3001'

// ── Health ────────────────────────────────────────────────────────────────────

export async function checkHealth() {
  try {
    const res = await fetch(`${PROXY_BASE}/health`)
    const json = await res.json()
    return json.error === false
  } catch {
    return false
  }
}

// ── Streaming chat ────────────────────────────────────────────────────────────
//
// Calls /api/chat and invokes callbacks as SSE events arrive.
//
// onToken(token: string)   — called for each streamed text chunk
// onDone()                 — called when the stream ends cleanly
// onError({ code, message }) — called on proxy or network error
//
// Returns an AbortController so callers can cancel mid-stream.

export function streamChat({ systemPrompt, messages, maxTokens = 1024, onToken, onDone, onError }) {
  const controller = new AbortController()

  ;(async () => {
    let res
    try {
      res = await fetch(`${PROXY_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages, maxTokens }),
        signal: controller.signal,
      })
    } catch (err) {
      if (err.name === 'AbortError') return
      onError({ code: 'PROXY_UNAVAILABLE', message: 'Could not reach the proxy. Is it running?' })
      return
    }

    if (!res.ok) {
      onError({ code: 'PROXY_ERROR', message: `Proxy returned ${res.status}` })
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete last line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (!payload) continue

          let parsed
          try {
            parsed = JSON.parse(payload)
          } catch {
            continue
          }

          if (parsed.error) {
            onError({ code: parsed.code, message: parsed.message })
            return
          }
          if (parsed.done) {
            onDone()
            return
          }
          if (parsed.token !== undefined) {
            onToken(parsed.token)
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      onError({ code: 'STREAM_INTERRUPTED', message: 'Stream was interrupted. Please try again.' })
    }
  })()

  return controller
}

// ── Bulk generation ───────────────────────────────────────────────────────────

export async function generate({ systemPrompt = '', prompt, maxTokens = 4096 }) {
  let res
  try {
    res = await fetch(`${PROXY_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, prompt, maxTokens }),
    })
  } catch {
    throw { code: 'PROXY_UNAVAILABLE', message: 'Could not reach the proxy. Is it running?' }
  }

  const json = await res.json()

  if (json.error) {
    throw { code: json.code, message: json.message }
  }

  return json.data
}
