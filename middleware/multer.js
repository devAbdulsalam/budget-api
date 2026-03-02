const multer = require('multer');

// Use memory storage so that uploaded file is available as a buffer.
// We'll send the buffer directly to Cloudinary in the controller.
const storage = multer.memoryStorage();

// only accept images and enforce size limit (5 MB)
const fileFilter = (req, file, cb) => {
	if (file.mimetype && file.mimetype.startsWith('image/')) {
		cb(null, true);
	} else {
		cb(
			new multer.MulterError(
				'LIMIT_UNEXPECTED_FILE',
				'Only image files are allowed',
			),
			false,
		);
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
