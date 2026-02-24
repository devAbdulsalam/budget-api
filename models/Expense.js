const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
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
		category: {
			type: String,
			enum: ['Materials', 'Labor', 'Tools', 'Transport', 'Permits', 'Other'],
			required: [true, 'Please provide an expense category'],
		},
		amount: {
			type: Number,
			required: [true, 'Please provide an amount'],
			min: [0, 'Amount cannot be negative'],
		},
		description: {
			type: String,
			maxlength: [300, 'Description cannot be more than 300 characters'],
		},
		vendor: {
			type: String,
			maxlength: [100, 'Vendor name cannot be more than 100 characters'],
		},
		paymentMethod: {
			type: String,
			enum: ['Cash', 'Credit Card', 'Bank Transfer', 'Check', 'Other'],
			default: 'Bank Transfer',
		},
		bank: {
			type: String,
		},
		receiptImage: {
			type: String,
		},
		expenseDate: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Expense', expenseSchema);
