const axios = require('axios');

async function testLogin() {
    const url = 'http://localhost:5001/api/auth/login';
    const payload = {
        email: 'admin@ethree.com',
        password: 'admin123'
    };

    console.log(`Testing login at: ${url}`);
    console.log(`Payload: ${JSON.stringify(payload)}`);

    try {
        const response = await axios.post(url, payload);
        console.log('Login Success!');
        console.log('Response Status:', response.status);
        console.log('Token/User:', JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error('Login Failed!');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error Message:', err.message);
        }
    }
}

testLogin();
