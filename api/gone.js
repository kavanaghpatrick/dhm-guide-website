// Vercel serverless function: 410 Gone for deliberately pruned posts.
// vercel.json rewrites each pruned /never-hungover/<slug> here (logged in docs/seo/reads-ledger.jsonl).
export default function handler(req, res) {
  res.setHeader('X-Robots-Tag', 'noindex')
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(410).send('<!doctype html><title>Gone</title><p>This article has been removed. <a href="/never-hungover">Browse all articles</a>.</p>')
}
