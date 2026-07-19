const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorMiddleware');
const adminRouter = require('./routes/adminRoutes');
const ownerRouter = require('./routes/ownerRoutes');
const propertyRouter = require('./routes/propertyRoutes');
const uploadRouter = require('./routes/uploadRoutes');
const inquiryRouter = require('./routes/inquiryRoutes');
const visitRouter = require('./routes/visitRoutes');
const noteRouter = require('./routes/noteRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');
const seoRouter = require('./routes/seoRoutes');

const mongoSanitize = require('express-mongo-sanitize');
const { sanitizeInput } = require('./middleware/sanitizeMiddleware');

const app = express();

// 1) MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API (rate limiting)
const limiter = rateLimit({
  max: 10000, // Limit each IP to 10000 requests per windowMs (relaxed for testing/dev)
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!',
});
app.use('/api', limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true, // Allow all origins or specify in .env
    credentials: true,
  })
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use((req, res, next) => {
  if (req.query) {
    Object.defineProperty(req, 'query', {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
});
app.use(mongoSanitize());

// Data sanitization against XSS HTML injection
app.use(sanitizeInput);

// Data compression
app.use(compression());

// Serving static files (e.g. for uploads later)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2) ROUTES
app.use('/', seoRouter);
app.use('/api/admin', adminRouter);
app.use('/api/owners', ownerRouter);
app.use('/api/properties', propertyRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/inquiries', inquiryRouter);
app.use('/api/visits', visitRouter);
app.use('/api/properties/:propertyId', noteRouter);
app.use('/api/dashboard', dashboardRouter);

// 3) HANDLE UNHANDLED ROUTES
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4) GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
