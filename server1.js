const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Secret key for signing tokens
const JWT_SECRET = 'myjwtsecretkey';

// Hardcoded user credentials
const USER = { username: 'user123', password: 'bank@123' };

// Simulated user balance
let balance = 5000;

// ==============================
// Middleware: Verify JWT Token
// ==============================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Bearer token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded; // store decoded info
    next();
  });
};

// ==============================
// Route: Login
// ==============================
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate user credentials
  if (username === USER.username && password === USER.password) {
    // Generate token (expires in 1 hour)
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// ==============================
// Protected Routes
// ==============================

// View balance
app.get('/balance', verifyToken, (req, res) => {
  res.json({ username: req.user.username, balance });
});

// Deposit money
app.post('/deposit', verifyToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid deposit amount' });
  }

  balance += amount;
  res.json({ message: `Deposited ₹${amount} successfully`, newBalance: balance });
});

// Withdraw money
app.post('/withdraw', verifyToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid withdrawal amount' });
  }

  if (amount > balance) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  balance -= amount;
  res.json({ message: `Withdrawn ₹${amount} successfully`, newBalance: balance });
});

// ==============================
// Start Server
// ==============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🏦 Banking API running on http://localhost:${PORT}`);
});
