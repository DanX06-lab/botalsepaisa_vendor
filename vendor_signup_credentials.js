const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Vendor Registration Endpoint
router.post('/register', async (req, res) => {
  const { name, contact_number, email, address, city, state, pincode, password } = req.body;
  if (!name || !contact_number || !email || !address || !city || !state || !pincode || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const connection = await sql.createConnection(dbConfig);
    // Check if vendors already exists (by email or contact_number)
    const [existing] = await connection.execute(
      'SELECT * FROM vendors WHERE email = ? OR contact_number = ?',
      [email, contact_number]
    );
    if (existing.length > 0) {
      await connection.end();
      return res.status(409).json({ error: 'Vendor already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert new vendors
    await connection.execute(
      `INSERT INTO vendors (name, contact_number, email, address, city, state, pincode, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, contact_number, email, address, city, state, pincode, hashedPassword]
    );
    await connection.end();
    res.status(201).json({ message: 'Vendor registered successfully!' });
  } catch (err) {
    console.error('Vendor Registration Error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

module.exports = router;
