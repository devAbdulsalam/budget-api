const Image = require('../models/Image');
const Budget = require('../models/Budget');

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

		const image = await Image.create({
			...req.body,
			budgetId: req.params.budgetId,
			userId: req.user.id,
		});

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
