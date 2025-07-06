// api/geocode.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q, limit = '5', countrycodes = 'jp' } = req.query
  const key = process.env.LOCATIONIQ_KEY
  if (!key) {
    return res.status(500).send('LocationIQ API key is not configured.')
  }

  const url =
    `https://us1.locationiq.com/v1/search.php` +
    `?key=${key}` +
    `&q=${encodeURIComponent(String(q))}` +
    `&format=json` +
    `&limit=${limit}` +
    `&countrycodes=${countrycodes}`

  try {
    const apiRes = await fetch(url)
    const json = await apiRes.json()
    if (!apiRes.ok) {
      // API 側のエラーをそのまま返す
      return res.status(apiRes.status).json(json)
    }
    // CORS ヘッダーを付与
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json(json)
  } catch (e: any) {
    console.error('Geocode proxy error:', e)
    return res.status(502).send('Failed to proxy geocoding request.')
  }
}
