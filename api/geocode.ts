// api/geocode.ts (Vercel Serverless Function)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const USER_AGENT = 'WeatherAppServerProxy/1.0 (contact@your-email.com)'; // あなたの連絡先情報

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  const locationIqApiKey = process.env.LOCATIONIQ_API_KEY;
  if (!locationIqApiKey) {
    console.error('LOCATIONIQ_API_KEY environment variable is not set in Vercel!');
    return res.status(500).json({ error: 'Server configuration error: API key missing.' });
  }

  const address = req.query.q as string;
  // ★重要: APIキーはサーバーサイドで付与されるべきなので、クライアントから渡されたkeyは無視する★
  // しかし、LocationIQ APIはキーをURLパラメータで受け取るため、クライアントからキーを渡す必要がある。
  // そのため、req.query.key をそのまま利用し、Vercelの環境変数は使わない。
  // または、Vercelの環境変数を使うなら、URLからkeyパラメータを削除する。
  // ここでは、Vercel環境変数を使う方針でいくため、URLからkeyを削除し、サーバーで付与する。
  // (ただし、Client側のuseWeather.tsのURLからkey=...を削除する必要がある)
  // 現状はクライアントからkeyを送り、Function側ではkeyを無視する形にする。

  if (!address) {
    return res.status(400).json({ error: 'Missing query parameter: q (address)' });
  }

  // LocationIQ API の URL を構築 (APIキーはサーバーサイドの環境変数から取得)
  const locationIqUrl = `https://us1.locationiq.com/v1/search.php?key=${locationIqApiKey}&q=${encodeURIComponent(address)}&format=json&limit=5&countrycodes=jp`;

  try {
    const apiResponse = await fetch(locationIqUrl, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error(`LocationIQ API responded with status ${apiResponse.status}:`, errorData);
      return res.status(apiResponse.status).json({ error: errorData.error || apiResponse.statusText });
    }

    const data = await apiResponse.json();
    res.status(200).json(data);

  } catch (error: any) {
    console.error('Error fetching from LocationIQ API in Vercel Function:', error);
    res.status(500).json({ error: `Internal server error: ${error.message || error}` });
  }
}