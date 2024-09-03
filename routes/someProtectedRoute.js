const express = require('express');
const router = express.Router();
const { sessionAuth } = require('../middleware/auth');

router.get('/protected', sessionAuth, (req, res) => {
  res.json({ message: 'This is a protected route' });
});
