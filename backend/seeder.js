const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/news-portal');
    console.log('MongoDB Connected');

    const adminExists = await User.findOne({ email: 'admin@newsportal.com' });
    if (adminExists) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    await User.create({
      name: 'Super Admin',
      email: 'admin@newsportal.com',
      password: 'Admin@1234',
      role: 'Admin',
    });

    console.log('✅ Default Admin created:');
    console.log('   Email: admin@newsportal.com');
    console.log('   Password: Admin@1234');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
