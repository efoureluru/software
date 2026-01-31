const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Ticket = require('./models/Ticket');
const Order = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Vercel-Admin-EFOUR:52sxxM83PIPKobvk@efour.ojwn6t6.mongodb.net/ethree?retryWrites=true&w=majority";

async function verify() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('--- VERIFICATION REPORT ---');

        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const ticketCount = await Ticket.countDocuments();
        const orderCount = await Order.countDocuments();

        console.log(`Users in DB: ${userCount}`);
        console.log(`Products in DB: ${productCount}`);
        console.log(`Tickets in DB: ${ticketCount}`);
        console.log(`Orders in DB: ${orderCount}`);

        const combo = await Product.findOne({ name: /Combo/ });
        if (combo) {
            console.log(`Sample Combo: ${combo.name}, Desc: ${combo.description}`);
        }

        const staff = await User.findOne({ email: 'pos1@efour.com' });
        console.log(`Staff User Found: ${staff ? 'YES' : 'NO'}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
