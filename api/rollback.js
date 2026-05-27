const { put, list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
    const backup = blobs.find(b => b.pathname === 'dashboard-data-backup.csv');
    if (!backup) return res.status(404).json({ error: '백업 없음' });

    const cur = await fetch(backup.url);
    const buf = Buffer.from(await cur.arrayBuffer());

    await put('dashboard-data.csv', buf, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
