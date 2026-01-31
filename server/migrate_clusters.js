const mongoose = require('mongoose');

const OLD_URI = "mongodb+srv://efoureluru_db_user:0yhiXcV0n38sBH64@cluster0.h9jkyka.mongodb.net/?retryWrites=true&w=majority";
const NEW_URI = "mongodb+srv://Vercel-Admin-EFOUR:52sxxM83PIPKobvk@efour.ojwn6t6.mongodb.net/?retryWrites=true&w=majority";

const schema = new mongoose.Schema({}, { strict: false });

async function migrate() {
    console.log('🚀 Starting Cluster-to-Cluster Migration...');

    try {
        console.log('Connecting to OLD Cluster...');
        const oldConn = await mongoose.createConnection(OLD_URI).asPromise();
        console.log('✅ Connected to OLD Cluster');

        console.log('Connecting to NEW Cluster...');
        const newConn = await mongoose.createConnection(NEW_URI).asPromise();
        console.log('✅ Connected to NEW Cluster');

        const collections = ['products', 'users', 'tickets', 'customers', 'orders', 'bookings'];

        for (const colName of collections) {
            console.log(`\n📦 Migrating: ${colName}...`);
            const OldModel = oldConn.model(colName, schema, colName);
            const NewModel = newConn.model(colName, schema, colName);

            const data = await OldModel.find({});
            console.log(`Found ${data.length} records in OLD cluster.`);

            if (data.length > 0) {
                // Clear new collection first to avoid duplicates if re-run
                await NewModel.deleteMany({});

                // Insert in batches of 100
                const batchSize = 100;
                for (let i = 0; i < data.length; i += batchSize) {
                    const batch = data.slice(i, i + batchSize).map(doc => doc.toObject());
                    await NewModel.insertMany(batch);
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
        console.error('\n❌ Migration Failed:', error);
        process.exit(1);
    }
}

migrate();
