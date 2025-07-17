const express = require('express');
const {
  validateRecaptchaToken,
} = require('../controllers/validateRecaptchaToken');

const router = express.Router();

router.post('/validate-token', validateRecaptchaToken);

module.exports = router;
