const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config();

// Models
const User = require('./models/User');
const Product = require('./models/Product');
const Ticket = require('./models/Ticket');
const Order = require('./models/Order');
const Booking = require('./models/Booking');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Vercel-Admin-EFOUR:52sxxM83PIPKobvk@efour.ojwn6t6.mongodb.net/ethree?retryWrites=true&w=majority";

async function migrate() {
    try {
        console.log('--- STARTING FINAL MIGRATION ---');
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const dataDir = path.join(__dirname, 'data');

        // 1. MIGRATE USERS
        console.log('Migrating USERS...');
        await User.deleteMany({});
        const usersToCreate = [
            { email: 'admin@ethree.com', name: 'Ethree Admin', password: '123456', role: 'admin' },
            { email: 'pos@ethree.com', name: 'POS Terminal 1', password: '123456', role: 'pos' },
            { email: 'pos1@efour.com', name: 'Sales Staff 1', password: '123456', role: 'pos' },
            { email: 'pos2@efour.com', name: 'Sales Staff 2', password: '123456', role: 'pos' },
            { email: 'pos3@efour.com', name: 'Sales Staff 3', password: '123456', role: 'pos' }
        ];

        const createdUsers = [];
        for (const u of usersToCreate) {
            const newUser = await User.create(u);
            createdUsers.push(newUser);
        }

        const userEmailToId = {};
        createdUsers.forEach(u => userEmailToId[u.email] = u._id);

        // Manual mapping for old JSON IDs (found in User.json and Order.json)
        const oldUserIdMap = {
            "1768115107036": userEmailToId['admin@ethree.com'],
            "1769497887771": userEmailToId['pos@ethree.com']
        };

        console.log(`- Inserted ${createdUsers.length} users`);

        // 2. MIGRATE PRODUCTS
        console.log('Migrating PRODUCTS...');
        const productsJson = await fs.readJson(path.join(dataDir, 'Product.json'));
        await Product.deleteMany({});

        const sanitizedProducts = productsJson.map(p => {
            const newP = { ...p };
            delete newP._id;
            if (!newP.category) newP.category = 'play';
            if (newP.name.includes('5 Rides')) newP.name = newP.name.replace('5 Rides', '6 Rides');
            if (newP.description && newP.description.includes('5 Rides')) newP.description = newP.description.replace('5 Rides', '6 Rides');
            return newP;
        });

        const createdProducts = await Product.insertMany(sanitizedProducts);
        const productIdToId = {};
        createdProducts.forEach(p => productIdToId[p.id] = p._id);

        console.log(`- Inserted ${createdProducts.length} products`);

        // 3. MIGRATE TICKETS
        console.log('Migrating TICKETS...');
        const ticketsJson = await fs.readJson(path.join(dataDir, 'Ticket.json'));
        await Ticket.deleteMany({});
        const uniqueTickets = new Map();
        ticketsJson.forEach(t => { if (!uniqueTickets.has(t.id)) uniqueTickets.set(t.id, t); });

        const sanitizedTickets = Array.from(uniqueTickets.values()).map(t => {
            const newT = { ...t };
            delete newT._id;
            return newT;
        });
        await Ticket.insertMany(sanitizedTickets);
        console.log(`- Inserted ${sanitizedTickets.length} tickets`);

        // 4. MIGRATE ORDERS
        console.log('Migrating ORDERS...');
        const ordersJson = await fs.readJson(path.join(dataDir, 'Order.json'));
        await Order.deleteMany({});
        const sanitizedOrders = ordersJson.map(o => {
            const newO = { ...o };
            delete newO._id;
            newO.user = oldUserIdMap[o.user] || null;
            newO.items = o.items.map(item => ({
                ...item,
                product: productIdToId[item.product.toString()] || null
            }));
            return newO;
        });
        await Order.insertMany(sanitizedOrders);
        console.log(`- Inserted ${sanitizedOrders.length} orders`);

        // 5. MIGRATE BOOKINGS
        console.log('Migrating BOOKINGS...');
        const bookingsJson = await fs.readJson(path.join(dataDir, 'Booking.json'));
        await Booking.deleteMany({});
        if (bookingsJson && bookingsJson.length > 0) {
            const sanitizedBookings = bookingsJson.map(b => {
                const newB = { ...b };
                delete newB._id;
                newB.user = oldUserIdMap[b.user] || null;
                return newB;
            });
            await Booking.insertMany(sanitizedBookings);
            console.log(`- Inserted ${sanitizedBookings.length} bookings`);
        } else {
            console.log('- No bookings to migrate');
        }

        console.log('--- MIGRATION COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (err) {
        console.error('--- MIGRATION FAILED ---');
        console.error(err);
        process.exit(1);
    }
}

migrate();
