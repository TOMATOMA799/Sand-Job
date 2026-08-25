const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

function getUserPassword(username) {
  const key = `USER_${username.trim().toUpperCase()}_PASSWORD`;
  return process.env[key];
}

router.post('/api/signin', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const expectedPassword = getUserPassword(username);

  if (!expectedPassword || expectedPassword !== password) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '12h' });

  return res.json({ success: true, token });
});

module.exports = router;
