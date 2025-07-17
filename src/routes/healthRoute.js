const express = require('express');
const healthCheck = require('../controllers/healthCheck');

const router = express.Router();

// Health check endpoint
router.get('/', healthCheck);

module.exports = router;
