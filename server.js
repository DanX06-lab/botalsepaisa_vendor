const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const signupRouter = require('./vendor_signup_credentials');
const loginRouter = require('./vendor_login_credentials');
const payoutRouter = require('./vendor_payout_credentials');
const pickupRouter = require('./vendor_pickup_credentials');
const scanRouter = require('./vendor_scan_credentials');


const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL,
    'https://danx06-lab.github.io'
  ],
  credentials: true
}));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Redirect root to index.html
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Mount API routers
app.use('/api/vendor', signupRouter);   // POST /api/vendor/register
app.use('/api/auth', loginRouter);      // POST /api/auth/login
app.use('/api/vendor/payout', payoutRouter); // Payout endpoints
app.use('/api/pickup', pickupRouter); // Pickup request endpoints
app.use('/api/bottle', scanRouter); // Bottle scan endpoints

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
