/**
 * Vercel / Netlify / Node Serverless Function handler for GraphQL proxy
 */
import https from 'https';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-device-id');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const postBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  const targetOptions = {
    hostname: 'internal.nbn23.app',
    port: 443,
    path: '/graphql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postBody),
      'Authorization': req.headers['authorization'] || '',
      'x-device-id': req.headers['x-device-id'] || 'fip-web-app',
      'x-package-name': 'com.nbn23.fipapp',
      'x-package-version': '2.13.0',
      'User-Agent': 'okhttp/4.12.0'
    }
  };

  return new Promise((resolve) => {
    const proxyReq = https.request(targetOptions, proxyRes => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      proxyRes.pipe(res);
      proxyRes.on('end', () => resolve());
    });

    proxyReq.on('error', err => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ errors: [{ message: 'Proxy Error: ' + err.message }] }));
      resolve();
    });

    proxyReq.write(postBody);
    proxyReq.end();
  });
}
