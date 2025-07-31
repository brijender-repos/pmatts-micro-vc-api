const axios = require('axios');

const BASE_URL = 'https://api.pmatts.com';

async function testAPI() {
  console.log('🧪 Testing PMatts API endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`, {
      timeout: 10000,
    });
    console.log(
      '✅ Health Check:',
      healthResponse.status,
      healthResponse.data.success
    );

    // Test 2: Payment Routes Test
    console.log('\n2. Testing Payment Routes...');
    try {
      const paymentResponse = await axios.get(`${BASE_URL}/payment/test`, {
        timeout: 10000,
      });
      console.log('✅ Payment Routes:', paymentResponse.status);
    } catch (error) {
      console.log(
        '⚠️  Payment Routes Test Endpoint not available (this is normal)'
      );
    }

    // Test 3: PayU Transactions (without actual data)
    console.log('\n3. Testing PayU Transactions endpoint...');
    try {
      const payuResponse = await axios.post(
        `${BASE_URL}/payment/payu-transactions`,
        {},
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(
        '✅ PayU Transactions:',
        payuResponse.status,
        payuResponse.data.success
      );
    } catch (error) {
      if (error.response) {
        console.log(
          '⚠️  PayU Transactions:',
          error.response.status,
          error.response.data.error || 'Error occurred'
        );
      } else {
        console.log('❌ PayU Transactions: Network error or timeout');
      }
    }

    console.log('\n🎉 API testing completed!');
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

// Run the test
testAPI();
