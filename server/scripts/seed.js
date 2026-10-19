const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/datadrix');
    console.log('[Seed] Connected to MongoDB');

    const adminEmail = 'admin@datadrix.com';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: adminEmail,
        password: 'adminpassword123',
        role: 'admin',
        isActive: true
      });
      console.log(`[Seed] Created default admin: ${adminEmail} (password: adminpassword123)`);
    } else {
      console.log(`[Seed] Admin already exists: ${adminEmail}`);
    }

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error:', err.message);
    process.exit(1);
  }
}

seed();
