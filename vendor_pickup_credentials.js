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

// 1. Submit a new pickup request
router.post('/request', async (req, res) => {
  const { vendor_id, vendor_name, pickup_location, approximate_bottles, contact_number } = req.body;
  if (!vendor_id || !vendor_name || !pickup_location || !approximate_bottles || !contact_number) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const connection = await sql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO vendor_pickup_requests (vendor_id, vendor_name, pickup_location, approximate_bottles, contact_number, status) VALUES (?, ?, ?, ?, ?, ?)',
      [vendor_id, vendor_name, pickup_location, approximate_bottles, contact_number, 'pending']
    );
    await connection.end();
    res.status(201).json({ message: 'Pickup request submitted successfully!' });
  } catch (err) {
    console.error('Pickup Request Insert Error:', err);
    res.status(500).json({ error: 'Failed to submit pickup request.' });
  }
});

// 2. Get all pickup requests (for admin panel)
router.get('/all', async (req, res) => {
  try {
    const connection = await sql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM vendor_pickup_requests ORDER BY request_date DESC'
    );
    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error('Pickup Requests Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch pickup requests.' });
  }
});

// 3. (Optional) Update request status (e.g., accepted, completed)
router.post('/update-status', async (req, res) => {
  const { request_id, status } = req.body;
  if (!request_id || !status) {
    return res.status(400).json({ error: 'Request ID and new status are required.' });
  }
  try {
    const connection = await sql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE vendor_pickup_requests SET status = ? WHERE request_id = ?',
      [status, request_id]
    );
    await connection.end();
    res.json({ message: 'Request status updated.' });
  } catch (err) {
    console.error('Pickup Request Status Update Error:', err);
    res.status(500).json({ error: 'Failed to update request status.' });
  }
});

module.exports = router;
