const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const AppError = require('../utils/appError');
const { isCloudinaryConfigured } = require('../services/uploadService');

let storage;

if (isCloudinaryConfigured) {
  // Use memory storage for direct Cloudinary stream uploading
  storage = multer.memoryStorage();
} else {
  // Ensure local uploads directory exists
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Use disk storage fallback
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Create a unique name to prevent collisions
      const uniqueSuffix = crypto.randomBytes(16).toString('hex');
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
    },
  });
}

// File extension filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    // Images
    '.jpg', '.jpeg', '.png', '.webp', '.gif',
    // Videos
    '.mp4', '.mov', '.avi', '.mkv',
    // Documents
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError(`Unsupported file format: ${ext}. Supported formats are images, videos, and documents.`, 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    // Set 50MB max file size limit to accommodate videos
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = upload;
