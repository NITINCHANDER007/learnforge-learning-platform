const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let currentUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/datadrix';

const connectDB = async (customUri) => {
  const uri = customUri || currentUri;
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    currentUri = uri;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return { success: true, host: conn.connection.host, name: conn.connection.name, uri };
  } catch (err) {
    console.error(`[MongoDB] Connection error: ${err.message}`);
    // If not default and failed, fallback to local default
    if (customUri && customUri !== 'mongodb://127.0.0.1:27017/datadrix') {
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/datadrix');
        currentUri = 'mongodb://127.0.0.1:27017/datadrix';
      } catch (fallbackErr) {}
    }
    throw err;
  }
};

const testConnection = async (testUri) => {
  const testConn = mongoose.createConnection(testUri, {
    serverSelectionTimeoutMS: 5000
  });

  try {
    await testConn.asPromise();
    const t0 = Date.now();
    await testConn.db.admin().ping();
    const pingMs = Date.now() - t0;
    const collections = await testConn.db.listCollections().toArray();
    const host = testConn.host;
    const dbName = testConn.name;
    await testConn.close();

    return {
      success: true,
      host,
      name: dbName,
      pingMs,
      collectionsCount: collections.length,
      collections: collections.map(c => c.name)
    };
  } catch (err) {
    try { await testConn.close(); } catch (e) {}
    throw new Error(`Connection test failed: ${err.message}`);
  }
};

const reconnect = async (newUri) => {
  if (!newUri || !newUri.trim()) {
    throw new Error('MongoDB URI is required');
  }
  const cleanUri = newUri.trim();

  // Test first
  const testResult = await testConnection(cleanUri);

  // Reconnect default mongoose
  await connectDB(cleanUri);

  // Update .env file so it persists
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('MONGODB_URI=')) {
        envContent = envContent.replace(/MONGODB_URI=.*/, `MONGODB_URI=${cleanUri}`);
      } else {
        envContent = `MONGODB_URI=${cleanUri}\n` + envContent;
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
    }
  } catch (envErr) {
    console.warn('Could not update .env file:', envErr.message);
  }

  // Ensure default admin user exists in new database so admin can still log in
  try {
    const User = require('../models/User');
    const admin = await User.findOne({ email: 'admin@datadrix.com' });
    if (!admin) {
      await User.create({
        name: 'Admin',
        email: 'admin@datadrix.com',
        password: 'adminpassword123',
        role: 'admin',
        isActive: true,
        isBlocked: false
      });
      console.log('[DataDrix] Seeded admin in new MongoDB database');
    }
  } catch (seedErr) {
    console.warn('Seed admin error in new database:', seedErr.message);
  }

  return {
    success: true,
    message: `Successfully connected to MongoDB: ${testResult.host}/${testResult.name}`,
    details: testResult
  };
};

const getCurrentUri = () => currentUri;

connectDB.connectDB = connectDB;
connectDB.getCurrentUri = getCurrentUri;
connectDB.testConnection = testConnection;
connectDB.reconnect = reconnect;

module.exports = connectDB;
