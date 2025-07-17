const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
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

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Vendor Login Endpoint
router.post('/login', async (req, res) => {
  const { contact_number, password } = req.body;
  if (!contact_number || !password) {
    return res.status(400).json({ error: 'Contact number and password are required.' });
  }
  try {
    const connection = await sql.createConnection(dbConfig);
    // Find vendor by contact_number
    const [rows] = await connection.execute(
      'SELECT * FROM vendors WHERE contact_number = ?',
      [contact_number]
    );
    await connection.end();
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid contact number or password.' });
    }
    const vendor = rows[0];
    if (!vendor.password) {
      return res.status(500).json({ error: 'Password not set for this vendor.' });
    }
    const match = await bcrypt.compare(password, vendor.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid contact number or password.' });
    }
    // Generate JWT token
    const token = jwt.sign({ vendor_id: vendor.vendor_id, name: vendor.name, contact_number: vendor.contact_number }, JWT_SECRET, {
      expiresIn: '2h'
    });
    res.json({ token, vendor_id: vendor.vendor_id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

module.exports = router;
