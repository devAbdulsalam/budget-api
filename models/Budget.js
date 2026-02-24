const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
	{
		projectName: {
			type: String,
			required: [true, 'Please provide a project name'],
			trim: true,
			maxlength: [100, 'Project name cannot be more than 100 characters'],
		},
		description: {
			type: String,
			maxlength: [500, 'Description cannot be more than 500 characters'],
		},
		totalBudget: {
			type: Number,
			required: [true, 'Please provide a total budget'],
			default: 0,
			min: [0, 'Budget cannot be negative'],
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		expenses: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Expense',
			},
		],
		tasks: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Task',
			},
		],
		images: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Image',
			},
		],
		status: {
			type: String,
			enum: ['planning', 'in-progress', 'completed', 'on-hold'],
			default: 'planning',
		},
		startDate: {
			type: Date,
		},
		endDate: {
			type: Date,
		},
	},
	{ timestamps: true },
);

// Middleware to calculate total spent
budgetSchema.virtual('totalSpent').get(function () {
	return this.expenses
		? this.expenses.reduce((sum, expense) => sum + expense.amount, 0)
		: 0;
});

// Middleware to calculate remaining budget
budgetSchema.virtual('remainingBudget').get(function () {
	return this.totalBudget - this.totalSpent;
});

budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);
