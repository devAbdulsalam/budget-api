const Image = require('../models/Image');
const Budget = require('../models/Budget');
const cloudinary = require('../config/cloudinary'); // configured instance

// @desc      Get all images for a budget
// @route     GET /api/budgets/:budgetId/images
// @access    Private
exports.getImages = async (req, res) => {
	try {
		const budget = await Budget.findById(req.params.budgetId);

		if (!budget) {
			return res
				.status(404)
				.json({ success: false, message: 'Budget not found' });
		}

		if (budget.userId.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ success: false, message: 'Not authorized' });
		}

		const images = await Image.find({ budgetId: req.params.budgetId });

		res.status(200).json({
			success: true,
			count: images.length,
			data: images,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Create image
// @route     POST /api/budgets/:budgetId/images
// @access    Private
exports.createImage = async (req, res) => {
	try {
		const budget = await Budget.findById(req.params.budgetId);

		if (!budget) {
			return res
				.status(404)
				.json({ success: false, message: 'Budget not found' });
		}

		if (budget.userId.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ success: false, message: 'Not authorized' });
		}

		// ensure a file was uploaded by multer
		if (!req.file) {
			return res
				.status(400)
				.json({ success: false, message: 'No file uploaded' });
		}

		// upload buffer to Cloudinary
		const uploadResult = await new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream({ folder: 'budget_images' }, (err, result) => {
					if (err) return reject(err);
					resolve(result);
				})
				.end(req.file.buffer);
		});

		const imageData = {
			budgetId: req.params.budgetId,
			userId: req.user.id,
			...req.body,
			// ensure cloudinary-generated fields override anything in the body
			imageUrl: uploadResult.secure_url,
			publicId: uploadResult.public_id,
		};

		const image = await Image.create(imageData);

		// Add image to budget
		budget.images.push(image._id);
		await budget.save();

		res.status(201).json({
			success: true,
			data: image,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Delete image
// @route     DELETE /api/images/:id
// @access    Private
exports.deleteImage = async (req, res) => {
	try {
		const image = await Image.findById(req.params.id);

		if (!image) {
			return res
				.status(404)
				.json({ success: false, message: 'Image not found' });
		}

		if (image.userId.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ success: false, message: 'Not authorized' });
		}

		// remove from cloudinary if we have a publicId
		if (image.publicId) {
			try {
				await cloudinary.uploader.destroy(image.publicId);
			} catch (err) {
				console.warn('Cloudinary deletion failed', err.message);
			}
		}

		await Image.findByIdAndDelete(req.params.id);

		// Remove from budget
		await Budget.findByIdAndUpdate(image.budgetId, {
			$pull: { images: req.params.id },
		});

		res.status(200).json({
			success: true,
			message: 'Image deleted',
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
