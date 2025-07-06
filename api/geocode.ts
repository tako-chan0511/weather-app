// api/geocode.ts
// import type { VercelRequest, VercelResponse } from '@vercel/node'

// ↑ @vercel/node の型インポートは削除
export default async function handler(req: any, res: any) {
  const q = String(req.query.q || '')
  const limit = String(req.query.limit || '5')
  const countrycodes = String(req.query.countrycodes || 'jp')
  const key = process.env.LOCATIONIQ_KEY
  if (!key) {
    return res.status(500).send('LocationIQ API key is not configured.')
  }

  const url =
    `https://us1.locationiq.com/v1/search.php` +
    `?key=${key}` +
    `&q=${encodeURIComponent(q)}` +
    `&format=json` +
    `&limit=${limit}` +
    `&countrycodes=${countrycodes}`

  try {
    const apiRes = await fetch(url)
    const json = await apiRes.json()
    if (!apiRes.ok) {
      return res.status(apiRes.status).json(json)
    }
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json(json)
  } catch (e: any) {
    console.error('Geocode proxy error:', e)
    return res.status(502).send('Failed to proxy geocoding request.')
  }
}