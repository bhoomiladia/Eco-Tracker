const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username,email, password } = req.body;
    const UsedUsername = await User.findOne({ username });
    if (UsedUsername) {
      return res.status(400).json({ message: 'Username already used' });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
  
    // Hash the password before saving it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    // Create the new user
    const newUser = new User({
    username,
      email,
      password: hashedPassword,
    });
  
    try {
      const savedUser = await newUser.save();
      res.status(201).json({ message: 'User registered successfully', user: savedUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

// POST /login - Authenticate and return JWT token
router.post('/login', async (req, res) => {
  const { username, email,password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if the password matches (you may need to use bcrypt.compare here)
    const isValidPassword = await user.isPasswordValid(password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = user.generateAuthToken();
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
