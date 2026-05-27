const { put, list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  // 업로드 전 현재 데이터를 백업으로 저장
  try {
    const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
    const current = blobs.find(b => b.pathname === 'dashboard-data.csv');
    if (current) {
      const cur = await fetch(current.url);
      const curBuf = Buffer.from(await cur.arrayBuffer());
      await put('dashboard-data-backup.csv', curBuf, {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    }
  } catch(_) {}

  await put('dashboard-data.csv', buffer, {
    access: 'public',
    addRandomSuffix: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  res.status(200).json({ ok: true });
};
