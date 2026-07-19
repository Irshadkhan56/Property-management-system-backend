// Handle uncaught exceptions before loading other modules
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const dotenv = require('dotenv');
// Load env varsx
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const seedAdmin = require('./config/seedAdmin');
const logger = require('./utils/logger');

const port = process.env.PORT || 5000;
let server;

const startServer = async () => {
  await connectDB();
  await seedAdmin();
  
  server = app.listen(port, () => {
    logger.info(`App running on port ${port} in ${process.env.NODE_ENV} mode...`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
