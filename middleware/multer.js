const multer = require('multer');

// Use memory storage so that uploaded file is available as a buffer.
// We'll send the buffer directly to Cloudinary in the controller.
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
