const mongoose = require('mongoose');
const dns = require('dns');
// Corporate DNS (10.60.10.177) blocks SRV for Atlas — use public DNS for MongoSRV
try { dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']); } catch {}

let cached = global._mongooseCached;
if (!cached) {
  cached = global._mongooseCached = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set — refusing to boot without DB');

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set('strictQuery', false);
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  console.log(`✅ MongoDB Connected: ${cached.conn.connection.host}`);
  return cached.conn;
};

module.exports = connectDB;
