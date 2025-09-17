// Test script for syncPayuTransactions
require('dotenv').config();

// Set required environment variables for testing
process.env.PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || 'test_key';
process.env.PAYU_MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT || 'test_salt';
process.env.PAYU_ENVIRONMENT = process.env.PAYU_ENVIRONMENT || 'test';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const {
  syncPayuTransactions,
} = require('./src/controllers/syncPayuTransactions.js');
const express = require('express');
const app = express();
app.use(express.json());

async function testSync() {
  console.log('🧪 Testing syncPayuTransactions...\n');

  // Test with 19 Aug'25 (should include both 19 Aug and 20 Aug based on +7 days logic)
  const testReq = {
    body: { startDate: '19-aug-2025' },
    originalUrl: '/test',
    method: 'POST',
  };

  const testRes = {
    status: (code) => ({
      json: (data) => {
        console.log('Response Status:', code);
        console.log('Response Data:', JSON.stringify(data, null, 2));
      },
    }),
  };

  console.log('Testing syncPayuTransactions with startDate: 19-aug-2025');
  console.log('Expected date range: 2025-08-19 to 2025-08-26\n');

  try {
    await syncPayuTransactions(testReq, testRes);
  } catch (error) {
    console.error('Error during sync:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testSync();
