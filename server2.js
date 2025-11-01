const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// ========================================
// MongoDB Connection
// ========================================
mongoose
  .connect('mongodb://127.0.0.1:27017/bankDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ========================================
// Schema and Model
// ========================================
const userSchema = new mongoose.Schema({
  name: String,
  balance: Number,
});

const User = mongoose.model('User', userSchema);

// ========================================
// Helper: Create Sample Users (Optional)
// ========================================
app.post('/create-user', async (req, res) => {
  try {
    const { name, balance } = req.body;
    const user = new User({ name, balance });
    await user.save();
    res.json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user', details: error.message });
  }
});

// ========================================
// API: Transfer Money
// ========================================
app.post('/transfer', async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid transfer details' });
    }

    // Fetch sender and receiver
    const sender = await User.findOne({ name: from });
    const receiver = await User.findOne({ name: to });

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    // Validate sender's balance
    if (sender.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Sequential updates (no transactions used)
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.json({
      message: `₹${amount} transferred successfully from ${from} to ${to}`,
      sender: { name: sender.name, balance: sender.balance },
      receiver: { name: receiver.name, balance: receiver.balance },
    });
  } catch (error) {
    res.status(500).json({ error: 'Transfer failed', details: error.message });
  }
});

// ========================================
// Get All Users (For Testing)
// ========================================
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// ========================================
// Start Server
// ========================================
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
