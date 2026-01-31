const mongoose = require('mongoose');

const LOCAL_URI = "mongodb://localhost:27017/ethree_pos";
const CLOUD_URI = "mongodb+srv://Vercel-Admin-EFOUR:52sxxM83PIPKobvk@efour.ojwn6t6.mongodb.net/?retryWrites=true&w=majority";

const schema = new mongoose.Schema({}, { strict: false });

async function migrate() {
    console.log('🚀 Starting Local-to-Cloud Migration...');

    try {
        console.log('Connecting to LOCAL Database...');
        const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log('✅ Connected to LOCAL Database');

        console.log('Connecting to CLOUD Cluster...');
        const cloudConn = await mongoose.createConnection(CLOUD_URI).asPromise();
        console.log('✅ Connected to CLOUD Cluster');

        const collections = ['products', 'users', 'tickets', 'customers', 'orders', 'bookings'];

        for (const colName of collections) {
            console.log(`\n📦 Migrating: ${colName}...`);
            const LocalModel = localConn.model(colName, schema, colName);
            const CloudModel = cloudConn.model(colName, schema, colName);

            const data = await LocalModel.find({});
            console.log(`Found ${data.length} records in LOCAL database.`);

            if (data.length > 0) {
                // Clear cloud collection first to avoid duplicates
                await CloudModel.deleteMany({});

                // Insert data
                const batchSize = 100;
                for (let i = 0; i < data.length; i += batchSize) {
                    const batch = data.slice(i, i + batchSize).map(doc => doc.toObject());
                    await CloudModel.insertMany(batch);
                    process.stdout.write('.');
                }
                console.log(`\n✅ Successfully migrated ${data.length} records to ${colName}`);
            } else {
                console.log(`Skipped ${colName} (no data)`);
            }
        }

        console.log('\n\n🎉 Migration Complete!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration Failed:', error.message);
        process.exit(1);
    }
}

migrate();
