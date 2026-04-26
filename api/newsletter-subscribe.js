// Vercel serverless function: proxies newsletter signups to Buttondown.
// Keeps the API key server-side. Returns user-friendly errors.
// Env required (Vercel Project Settings → Environment Variables): BUTTONDOWN_API_KEY

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALLOWED_SOURCES = new Set(['inline', 'exit_intent', 'unknown'])
const BUTTONDOWN_URL = 'https://api.buttondown.email/v1/subscribers'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  // Vercel auto-parses JSON when Content-Type is application/json.
  // Be defensive: also accept a string body.
  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  body = body || {}

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const sourceInput = typeof body.source === 'string' ? body.source : 'unknown'
  const source = ALLOWED_SOURCES.has(sourceInput) ? sourceInput : 'unknown'

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email address' })
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY
  if (!apiKey) {
    console.error('[newsletter-subscribe] BUTTONDOWN_API_KEY missing')
    return res.status(503).json({ ok: false, error: 'Newsletter service not configured' })
  }

  try {
    const upstream = await fetch(BUTTONDOWN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        tags: ['dhm-calculator'],
        metadata: { source },
      }),
    })

    if (upstream.status === 201 || upstream.status === 200) {
      return res.status(200).json({ ok: true, status: 'subscribed' })
    }

    // Buttondown returns 400 with a code/message when the email is already on the list.
    // Treat that as success from the user's POV.
    if (upstream.status === 400) {
      const text = await upstream.text()
      if (/already|exists|duplicate/i.test(text)) {
        return res.status(200).json({ ok: true, status: 'already_subscribed' })
      }
      return res.status(400).json({ ok: false, error: 'Invalid request' })
    }

    if (upstream.status >= 500) {
      const text = await upstream.text().catch(() => '')
      console.error('[newsletter-subscribe] Buttondown 5xx', upstream.status, text)
      return res.status(502).json({ ok: false, error: 'Newsletter service unavailable' })
    }

    // 401/403/etc — auth/key problem. Don't leak details to the client.
    const text = await upstream.text().catch(() => '')
    console.error('[newsletter-subscribe] Buttondown unexpected', upstream.status, text)
    return res.status(502).json({ ok: false, error: 'Newsletter service unavailable' })
  } catch (err) {
    console.error('[newsletter-subscribe] fetch threw', err)
    return res.status(502).json({ ok: false, error: 'Newsletter service unavailable' })
  }
}
