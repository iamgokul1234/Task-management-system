import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User';

dotenv.config();

const testDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    const users = await User.find({}).select('+password');
    for (const u of users) {
      const match = await bcrypt.compare(u.role === 'admin' ? 'Admin@123' : 'password123', u.password as string);
      console.log(`${u.email} (${u.role}) match: ${match}`);
      console.log(`Stored hash: ${u.password}`);
      const freshHash = await bcrypt.hash(u.role === 'admin' ? 'Admin@123' : 'password123', 10);
      console.log(`Fresh hash for comparison: ${freshHash}`);
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testDb();
