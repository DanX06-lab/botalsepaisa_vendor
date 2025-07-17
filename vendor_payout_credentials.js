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

// Get vendor payout summary and recent transactions
router.get('/summary/:vendor_id', async (req, res) => {
  const { vendor_id } = req.params;
  try {
    const connection = await sql.createConnection(dbConfig);
    // Get total earnings
    const [totalRows] = await connection.execute(
      'SELECT SUM(amount_credited) AS total_earnings FROM vendor_payouts WHERE vendor_id = ?',
      [vendor_id]
    );
    // Get recent transactions (last 10)
    const [transactions] = await connection.execute(
      'SELECT date, bottles_processed, amount_credited FROM vendor_payouts WHERE vendor_id = ? ORDER BY date DESC LIMIT 10',
      [vendor_id]
    );
    await connection.end();
    res.json({
      total_earnings: totalRows[0].total_earnings || 0,
      transactions
    });
  } catch (err) {
    console.error('Vendor Payout Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch payout summary.' });
  }
});

// Add new payout transaction
router.post('/add', async (req, res) => {
  const { vendor_id, date, bottles_processed, amount_credited } = req.body;
  if (!vendor_id || !date || !bottles_processed || !amount_credited) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const connection = await sql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO vendor_payouts (vendor_id, date, bottles_processed, amount_credited) VALUES (?, ?, ?, ?)',
      [vendor_id, date, bottles_processed, amount_credited]
    );
    await connection.end();
    res.status(201).json({ message: 'Payout added successfully!' });
  } catch (err) {
    console.error('Vendor Payout Insert Error:', err);
    res.status(500).json({ error: 'Failed to add payout.' });
  }
});

module.exports = router;
