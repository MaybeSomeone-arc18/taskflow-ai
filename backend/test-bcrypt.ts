import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './src/models/User';

const runTest = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskflow');
  console.log('DB Connected.');

  const email = 'admin@gmail.com';
  const password = 'password123';
  
  const user = await User.findOne({ email });
  console.log('User found?:', user ? 'Yes' : 'No');
  
  if (user) {
    console.log('Password hash:', user.passwordHash);
    console.log('Hash rounds (extracted from hash):', user.passwordHash.split('$')[2]);
    
    const isMatchAsync = await bcrypt.compare(password, user.passwordHash);
    console.log('bcrypt.compare (async) result:', isMatchAsync);

    const isMatchSync = bcrypt.compareSync(password, user.passwordHash);
    console.log('bcrypt.compareSync result:', isMatchSync);

    const modelMatch = await user.comparePassword(password);
    console.log('User model comparePassword result:', modelMatch);
  }

  process.exit(0);
};

runTest().catch(console.error);
