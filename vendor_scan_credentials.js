const express = require('express');
const router = express.Router();
const sql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Souvik@0606', // Change if needed
  database: 'bottleback_system',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// POST /api/bottle/scan
router.post('/scan', async (req, res) => {
  const { code, vendor_id, userId } = req.body;
  if (!code || (!vendor_id && !userId)) {
    return res.status(400).json({ error: 'Missing code or user/vendor id.' });
  }
  try {
    const connection = await sql.createConnection(dbConfig);
    // Check if QR exists
    const [qrRows] = await connection.execute(
      'SELECT * FROM qr_code_data WHERE qr_code_value = ?',
      [code]
    );
    if (qrRows.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'QR code not found in system.' });
    }
    const qr = qrRows[0];
    // Vendor scan logic
    if (vendor_id) {
      if (qr.status === 'used') {
        await connection.end();
        return res.status(409).json({ error: 'QR already approved by vendor.' });
      }
      if (qr.status !== 'pending') {
        await connection.end();
        return res.status(409).json({ error: 'QR must be pending for vendor approval.' });
      }
      await connection.execute(
        'UPDATE qr_code_data SET status = ?, used_at = NOW() WHERE qr_code_value = ?',
        ['used', code]
      );
      await connection.end();
      return res.json({ success: true, message: 'Vendor approved' });
    }
    // User scan logic
    if (userId) {
      if (qr.status === 'pending') {
        await connection.end();
        return res.status(409).json({ error: 'QR already scanned and pending vendor approval.' });
      }
      if (qr.status === 'used') {
        await connection.end();
        return res.status(409).json({ error: 'QR already approved by vendor.' });
      }
      // Only allow scan if unused
      if (qr.status !== 'unused') {
        await connection.end();
        return res.status(409).json({ error: 'QR cannot be scanned in its current state.' });
      }
      await connection.execute(
        'UPDATE qr_code_data SET status = ? WHERE qr_code_value = ?',
        ['pending', code]
      );
      await connection.end();
      return res.json({ success: true, message: 'Scan sent for vendor verification. Money will be added after approval.' });
    }
    await connection.end();
    res.status(400).json({ error: 'Invalid scan request.' });
  } catch (err) {
    console.error('Bottle Scan Error:', err);
    res.status(500).json({ error: 'Failed to process QR scan.' });
  }
});

module.exports = router;
