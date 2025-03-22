const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    refreshAccessToken, 
    requestPasswordReset,
    resetPassword         
  } = require('../controllers/authController');

// Register Clients route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Refresh Token route
router.post('/auth/refresh-token', refreshAccessToken);

// Password Reset Routes
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword); // Must come accompanied by a token

module.exports = router;
