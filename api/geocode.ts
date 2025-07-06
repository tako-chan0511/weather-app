// api/geocode.ts
// Vercel Serverless Function (Node.js/TypeScript)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch'; // Vercel Functions は node-fetch をサポート

// Serverless Function のUser-Agentを定義 (APIの利用規約遵守のため)
const USER_AGENT = 'WeatherAppServerProxy/1.0 (harakeisuke7@gmail.com)'; // ★あなたの連絡先情報に置き換えてください★

export default async function (req: VercelRequest, res: VercelResponse) {
  // HTTP GET リクエストのみを受け付ける
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  // クエリパラメータから 'q' (住所) を取得
  const address = req.query.q as string;
  if (!address) {
    return res.status(400).json({ error: 'Missing query parameter: q (address)' });
  }

  // LocationIQ API キーを Vercel の環境変数から取得
  const locationIqApiKey = process.env.LOCATIONIQ_API_KEY;
  if (!locationIqApiKey) {
    console.error('LOCATIONIQ_API_KEY environment variable is not set!');
    return res.status(500).json({ error: 'Server configuration error: API key missing.' });
  }

  // LocationIQ API の URL を構築
  const locationIqUrl = `https://us1.locationiq.com/v1/search.php?key=${locationIqApiKey}&q=${encodeURIComponent(address)}&format=json&limit=5&countrycodes=jp`;

  try {
    // LocationIQ APIにリクエストを送信 (Serverless Functionから)
    const apiResponse = await fetch(locationIqUrl, {
      headers: {
        'User-Agent': USER_AGENT, // ★User-Agentヘッダーを付与★
      },
    });

    // APIからのレスポンスが成功しなかった場合
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error(`LocationIQ API responded with status ${apiResponse.status}:`, errorData);
      // APIからのエラーレスポンスをクライアントにそのまま返す
      return res.status(apiResponse.status).json({ error: errorData.error || apiResponse.statusText });
    }

    const data = await apiResponse.json();
    // 成功したレスポンスをクライアントに返す
    res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching from LocationIQ API:', error);
    res.status(500).json({ error: 'Failed to fetch location data from external API.' });
  }
}