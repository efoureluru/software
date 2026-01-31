const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Vercel-Admin-EFOUR:52sxxM83PIPKobvk@efour.ojwn6t6.mongodb.net/ethree?retryWrites=true&w=majority";

const usersToUpdate = [
    {
        email: 'admin@ethree.com',
        name: 'Ethree Admin',
        password: '123456',
        role: 'admin'
    },
    {
        email: 'pos@ethree.com',
        name: 'POS Terminal 1',
        password: '123456',
        role: 'pos'
    },
    {
        email: 'pos1@efour.com',
        name: 'Sales Staff 1',
        password: '123456',
        role: 'pos'
    },
    {
        email: 'pos2@efour.com',
        name: 'Sales Staff 2',
        password: '123456',
        role: 'pos'
    },
    {
        email: 'pos3@efour.com',
        name: 'Sales Staff 3',
        password: '123456',
        role: 'pos'
    }
];

async function updateUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        for (const userData of usersToUpdate) {
            const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
            if (existingUser) {
                console.log(`Updating password for existing user: ${userData.email}`);
                existingUser.password = userData.password; // pre-save hook will hash it
                await existingUser.save();
            } else {
                console.log(`Creating new user: ${userData.email}`);
                await User.create(userData);
            }
        }

        console.log('SUCCESS: Users updated and created.');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE:', err);
        process.exit(1);
    }
}

updateUsers();
