const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const uploadFile = async (file, folder = 'general') => {
  // 1) Fallback if Cloudinary is not configured (Multer diskStorage was used)
  if (!isCloudinaryConfigured) {
    logger.info(`Cloudinary not configured. Using local file path: /uploads/${file.filename}`);
    return `/uploads/${file.filename}`;
  }

  // 2) Upload file buffer to Cloudinary
  try {
    let resourceType = 'auto'; // 'image', 'video', 'raw' (for documents)
    
    // Determine resource type by mime type
    if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (
      !file.mimetype.startsWith('image/') && 
      (file.mimetype.includes('pdf') || file.mimetype.includes('word') || file.mimetype.includes('excel'))
    ) {
      resourceType = 'raw';
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `property_dealer_crm/${folder}`,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            logger.error(`Cloudinary Upload Stream Error: ${error.message}`);
            return reject(error);
          }
          resolve(result.secure_url);
        }
      );
      
      uploadStream.end(file.buffer);
    });
  } catch (error) {
    logger.error(`Upload service error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  uploadFile,
  isCloudinaryConfigured,
};
