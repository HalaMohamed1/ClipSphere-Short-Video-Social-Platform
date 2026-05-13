import mongoose from 'mongoose';
import dns from 'dns';

// Force IPv4 DNS resolution — fixes querySrv ECONNREFUSED on Windows
dns.setDefaultResultOrder('ipv4first');

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: MongoDB is required in production.');
      process.exit(1);
    }
    console.warn('⚠️  Continuing without database connection. Start MongoDB: docker compose up -d database');
    return null;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error(`❌ Error disconnecting MongoDB: ${error.message}`);
  }
};
