import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    const conn = await mongoose.connect(mongoUri);
    console.log(`[INFO] Database successfully connected to: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[CRITICAL] Database connection failed: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
