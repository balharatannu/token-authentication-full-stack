// Import Express
const express = require('express');
const app = express();

// ===========================
// Middleware 1: Request Logger
// ===========================
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next(); // Move to the next middleware or route
};

// Apply logging middleware globally
app.use(requestLogger);

// ===========================
// Middleware 2: Token Authentication
// ===========================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if header is provided
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  // Check if token starts with Bearer
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Bearer token missing' });
  }

  // Validate token
  if (token !== 'mysecrettoken') {
    return res.status(403).json({ error: 'Invalid token' });
  }

  // If valid, move to next middleware
  next();
};

// ===========================
// Routes
// ===========================

// Public route (no auth required)
app.get('/public', (req, res) => {
  res.json({ message: 'Welcome to the public route! No authentication required.' });
});

// Protected route (requires token)
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Access granted! You have a valid Bearer token.' });
});

// ===========================
// Server Start
// ===========================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
