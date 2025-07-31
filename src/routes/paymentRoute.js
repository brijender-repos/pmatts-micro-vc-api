const express = require('express');
const { initiatePayment } = require('../controllers/initiatePayment.js');
const { verifyPayment } = require('../controllers/verifyPayment.js');
const { payuWebhook } = require('../controllers/webhook.js');
const {
  syncPayuTransactions,
} = require('../controllers/syncPayuTransactions.js');

const router = express.Router();

router.post('/payu-payment', initiatePayment);
router.post('/payment/verify/:txnid', verifyPayment);
router.post('/payu-webhook', payuWebhook);
router.post('/payu-transactions', syncPayuTransactions);

module.exports = router;
