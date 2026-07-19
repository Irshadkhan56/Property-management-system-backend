const Admin = require('../models/adminModel');
const logger = require('../utils/logger');

const seedAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      logger.info('No admin accounts found. Creating default admin...');
      
      const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@propertydealer.com';
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456';
      const defaultName = process.env.DEFAULT_ADMIN_NAME || 'Default Admin';
      
      await Admin.create({
        name: defaultName,
        email: defaultEmail,
        password: defaultPassword,
        role: 'admin',
      });
      
      logger.info('Default admin created successfully!');
      logger.info(`Email: ${defaultEmail}`);
      logger.info(`Password: ${defaultPassword}`);
      logger.info('Please change these credentials after your first login!');
    } else {
      logger.info(`Database already has ${adminCount} admin account(s). Skipping seed.`);
    }
  } catch (error) {
    logger.error(`Error seeding admin: ${error.message}`);
  }
};

module.exports = seedAdmin;
