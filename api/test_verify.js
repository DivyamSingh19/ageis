const axios = require('axios');

async function testVerification() {
    try {
        const response = await axios.post('http://localhost:4000/api/farmer/verify-product', {
            productId: '0cc1426e-4f9d-4982-8c74-a0bf6e8fe501'
        });
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testVerification();
