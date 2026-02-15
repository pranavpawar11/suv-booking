const User = require('../models/User.model');

const ADMIN_CREDENTIALS = {
  name: 'Admin',
  email: 'admin@gmail.com',
  phone: '9999999999',
  password: '123456',
  role: 'admin',
  isActive: true
};

/**
 * Seeds default admin user if it doesn't exist
 */
const seedDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findByEmail(ADMIN_CREDENTIALS.email);
    
    if (existingAdmin) {
      console.log('✅ Default admin user already exists');
      return;
    }

    // Create admin user
    const admin = await User.create(ADMIN_CREDENTIALS);
    console.log('');
    console.log('='.repeat(50));
    console.log('✅ Default Admin User Created');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: 123456`);
    console.log(`👤 Role: ${admin.role}`);
    console.log('='.repeat(50));
    console.log('');
  } catch (error) {
    // If error is due to phone number duplicate (admin might exist with different email)
    if (error.code === 11000 && error.keyPattern?.phone) {
      console.log('✅ Admin user already exists (phone number in use)');
      return;
    }
    console.error('❌ Error seeding default admin:', error.message);
  }
};

module.exports = { seedDefaultAdmin };