// api/geocode.ts
export default async function handler(req: any, res: any) {
  const key = process.env.LOCATIONIQ_KEY
  if (!key) {
    return res.status(500).json({ error: 'LOCATIONIQ_KEY not set.' })
  }

  const q = String(req.query.q || '')
  const limit = String(req.query.limit || '5')
  const countrycodes = String(req.query.countrycodes || 'jp')

  const url = new URL('https://us1.locationiq.com/v1/search.php')
  url.searchParams.set('key', key)
  url.searchParams.set('q', q)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', limit)
  url.searchParams.set('countrycodes', countrycodes)

  try {
    const apiRes = await fetch(url.toString())
    const json = await apiRes.json()
    // LocationIQ 側で 200 以外を返していたらそのままクライアントへ
    if (!apiRes.ok) {
      return res.status(apiRes.status).json(json)
    }
    // CORS ヘッダー
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json(json)
  } catch (e: any) {
    console.error('Proxy error:', e)
    return res.status(502).json({ error: 'Proxy failed.' })
  }
}
