// api/geocode.tsです
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = process.env.LOCATIONIQ_KEY
  const q   = req.query.q as string
  if (!q || !key) {
    return res.status(400).json({ error: 'Missing query or key' })
  }
  const url = new URL('https://us1.locationiq.com/v1/search.php')
  url.searchParams.set('key', key)
  url.searchParams.set('q', q)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '5')
  url.searchParams.set('countrycodes','jp')

  // LocationIQ の利用規約として UA を設定
  const response = await fetch(url.toString(), {
    headers: { 'User-Agent': 'WeatherApp/1.0 (your-email@example.com)' }
  })
  if (!response.ok) {
    const text = await response.text()
    return res.status(response.status).send(text)
  }
  const data = await response.json()
  return res.status(200).json(data)
}
