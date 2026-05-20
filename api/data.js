import { list } from '@vercel/blob';

export default async function handler(req, res) {
  const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
  const csv = blobs.find(b => b.pathname === 'dashboard-data.csv');

  if (!csv) return res.status(404).end('no-data');

  // Blob은 공개 URL이지만 CORS를 위해 서버에서 프록시
  const upstream = await fetch(csv.url);
  const text = await upstream.text();

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(text);
}
