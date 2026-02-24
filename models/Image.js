const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
	{
		budgetId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Budget',
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		title: {
			type: String,
			required: [true, 'Please provide an image title'],
			trim: true,
			maxlength: [100, 'Title cannot be more than 100 characters'],
		},
		description: {
			type: String,
			maxlength: [500, 'Description cannot be more than 500 characters'],
		},
		imageUrl: {
			type: String,
			required: [true, 'Please provide an image URL'],
		},
		publicId: {
			type: String,
		},
		category: {
			type: String,
			enum: ['General', 'Progress', 'Before', 'After', 'Issues'],
			default: 'General',
		},
		tags: [String],
		photoDate: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Image', imageSchema);
