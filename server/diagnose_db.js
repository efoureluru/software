const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Vercel-Admin-EFOUR:52sxxM83PIPKobvk@efour.ojwn6t6.mongodb.net/ethree?retryWrites=true&w=majority";

async function runDiagnostics() {
    console.log('Connecting to:', MONGO_URI);
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const User = require('./models/User');
        const count = await User.countDocuments();
        console.log('User count:', count);

        if (count > 0) {
            const users = await User.find({}, { password: 0 }).limit(5);
            console.log('Sample users:', JSON.stringify(users, null, 2));
        } else {
            console.log('No users found in database.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Diagnostics failed:', err);
        process.exit(1);
    }
}

runDiagnostics();
