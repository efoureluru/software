const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 */
// Initial Seeding Logic (Run on request to ensure serverless execution)
// Initial Seeding Logic (Run on request to ensure serverless execution)
const seedInitialData = async () => {
    try {
        const count = await Product.countDocuments();
        if (count > 0) {
            console.log('✅ Products already exist. Skipping seed.');
            return;
        }

        console.log('🚀 SEEDING v3.8: Injecting fresh ride data...');
        const initialRides = [
            { id: '19', name: 'Combo Adult (6 Rides)', price: 500, description: '6 Rides for Adults.', image: 'combo adult/E4LOGO.jpeg', category: 'play', version: '3.8' },
            { id: '20', name: 'Combo Child (6 Rides)', price: 500, description: '6 Rides for Children.', image: 'combo child/E4LOGO.jpeg', category: 'play', version: '3.8' },
            { id: '1', name: 'Balloon Shooting', price: 100, description: 'Aim and fire to win prizes.', image: 'baloon shooting/IMG_8435.jpg', category: 'play', version: '3.8' },
            { id: '2', name: 'Bouncy', price: 100, description: 'Safe inflatable fun for kids.', image: 'bouncy/WhatsApp_Image_2025-06-14_at_4.02.45_PM.jpeg', category: 'play', version: '3.8' },
            { id: '3', name: 'Bull Ride', price: 100, description: 'Test your strength and balance.', image: 'bull ride/IMG_8384.jpg', category: 'play', version: '3.8' },
            { id: '4', name: 'Bumping Cars Double', price: 100, description: 'Classic favorite for two players.', image: 'bumping cars double/Bumper_Cars_9944_14762891777.jpg', category: 'play', version: '3.8' },
            { id: '5', name: 'Bumping Cars Single', price: 150, description: 'Fun-filled solo driving experience.', image: 'bumping cars single/IMG_8417.jpg', category: 'play', version: '3.8' },
            { id: '6', name: 'Columbus Mini', price: 100, description: 'Mini swinging adventure boat.', image: 'columbus mini/IMG_8407.jpg', category: 'play', version: '3.8' },
            { id: '7', name: 'Free Fall', price: 100, description: 'Thrilling vertical drop experience.', image: 'free fall/IMG_8381.jpg', category: 'play', version: '3.8' },
            { id: '8', name: 'Joker Ride', price: 100, description: 'Fun and laughter on this kid-friendly ride.', image: 'joker ride/IMG_8400.jpg', category: 'play', version: '3.8' },
            { id: '9', name: 'Paddle Boat', price: 100, description: 'Relaxing water adventure.', image: 'paddle boat/paddle-boat.webp', category: 'play', version: '3.8' },
            { id: '10', name: 'Soft Play', price: 100, description: 'Colorful indoor play area for toddlers.', image: 'soft play/WhatsApp_Image_2025-06-14_at_4.04.52_PM_1.jpeg', category: 'play', version: '3.8' },
            { id: '11', name: 'Sun & Moon', price: 100, description: 'Magical rotating sky adventure.', image: 'sun & moon/IMG_8389.jpg', category: 'play', version: '3.8' },
            { id: '12', name: 'Kids Train', price: 100, description: 'A delightful journey for the little ones.', image: 'train ticket/IMG_8410.jpg', category: 'play', version: '3.8' },
            { id: '13', name: 'Trampoline', price: 100, description: 'Bounce away all your energy.', image: 'trampoline/trampoline.webp', category: 'play', version: '3.8' },
            { id: '14', name: '360 Cycle', price: 150, description: 'Thrilling 360-degree cycling experience.', image: '360 cycle/360-degree-cycle-500x500.webp', category: 'play', version: '3.8' },
            { id: '15', name: 'Basket Ball', price: 100, description: 'Shoot hoops and win scores.', image: 'basket ball/images.jpg', category: 'play', version: '3.8' },
            { id: '16', name: 'Bungee Jump', price: 150, description: 'Bungee jumping trampoline for kids.', image: 'Bungee jump/bungee-jumping-trampoline.jpeg', category: 'play', version: '3.8' },
            { id: '17', name: 'Free Ride', price: 0, description: 'Complimentary ride experience.', image: 'free ride/images (1).jpg', category: 'play', version: '3.8' },
            { id: '18', name: 'Mini Wheel Ride', price: 100, description: 'Small ferris wheel for younger kids.', image: 'mini wheel ride/1.avif', category: 'play', version: '3.8' }
        ];

        await Product.insertMany(initialRides);
        console.log('Successfully seeded default ride data.');
    } catch (e) {
        console.error('Failed to seed rides', e);
    }
};

router.get('/', async (req, res) => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log('Database empty, triggering seed...');
            await seedInitialData();
        }
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product (Admin only)
 *     tags: [Products]
 */
router.post('/', auth, admin, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/products/force-reset:
 *   get:
 *     summary: Manually force database re-seeding (Nuclear Option)
 *     tags: [Products]
 */
router.get('/force-reset', auth, admin, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    try {
        console.log('Force Reset Triggered');
        await Product.deleteMany({});
        await seedInitialData();
        const count = await Product.countDocuments();
        res.json({ message: 'Database forcefully reset to defaults.', productCount: count });
    } catch (err) {
        console.error('Reset Failed:', err);
        res.status(500).json({ message: err.message });
    }
});

router.get('/debug-db', async (req, res) => {
    try {
        const count = await Product.countDocuments();
        res.json({ status: 'Connected', productCount: count, time: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/products/:id:
 *   put:
 *     summary: Update a product (Admin only)
 *     tags: [Products]
 */
router.put('/:id', auth, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/products/:id:
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
 */
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const success = await Product.findByIdAndDelete(req.params.id);
        if (!success) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
