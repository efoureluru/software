const mongoose = require('mongoose');
const URI = "mongodb+srv://Vercel-Admin-EFOUR:52sxxM83PIPKobvk@efour.ojwn6t6.mongodb.net/ethree?retryWrites=true&w=majority";

async function test() {
    try {
        console.log('Connecting to:', URI);
        await mongoose.connect(URI, { serverSelectionTimeoutMS: 5000 });
        console.log('SUCCESS: Connected to MongoDB.');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Could not connect to MongoDB.');
        console.error(err);
        process.exit(1);
    }
}

test();
