const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
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
			required: [true, 'Please provide a task title'],
			trim: true,
			maxlength: [100, 'Task title cannot be more than 100 characters'],
		},
		description: {
			type: String,
			maxlength: [500, 'Description cannot be more than 500 characters'],
		},
		status: {
			type: String,
			enum: ['pending', 'in-progress', 'completed', 'on-hold'],
			default: 'pending',
		},
		priority: {
			type: String,
			enum: ['low', 'medium', 'high'],
			default: 'medium',
		},
		dueDate: {
			type: Date,
		},
		assignedTo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		completedDate: {
			type: Date,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Task', taskSchema);
