import mongoose from 'mongoose';

// Connection caching: Isse Vercel har request pe naya connection nahi banayega
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
  // Agar pehle se connected hai toh wahi return karo
  if (cached.conn) {
    return cached.conn;
  }

  // Agar connection process mein hai toh wait karo
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // SABSE IMPORTANT: Buffering band karega taaki timeout na ho
      serverSelectionTimeoutMS: 10000, // 10 sec wait karega connection ke liye
    };

    cached.promise = mongoose.connect(process.env.Mongo_URI, opts).then((mongoose) => {
      console.log("New MongoDB connection established");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.log("DB Error:", e.message);
    throw e;
  }

  return cached.conn;
};

export default connectDb;