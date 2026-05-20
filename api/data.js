const { list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  try {
    const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
    const csv = blobs.find(b => b.pathname === 'dashboard-data.csv');

    if (!csv) return res.status(404).end('no-data');

    const upstream = await fetch(csv.url);
    const text = await upstream.text();

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
