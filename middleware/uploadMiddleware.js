// middleware/uploadMiddleware.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Setup Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'staff-images',         // Cloudinary folder
    allowed_formats: ['jpg', 'png', 'jpeg']
  },
});

const upload = multer({ storage });

module.exports = upload;
