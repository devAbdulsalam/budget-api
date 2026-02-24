const Task = require('../models/Task');
const Budget = require('../models/Budget');

// @desc      Get all tasks for a budget
// @route     GET /api/budgets/:budgetId/tasks
// @access    Private
exports.getTasks = async (req, res) => {
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

		const tasks = await Task.find({ budgetId: req.params.budgetId });

		res.status(200).json({
			success: true,
			count: tasks.length,
			data: tasks,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Create task
// @route     POST /api/budgets/:budgetId/tasks
// @access    Private
exports.createTask = async (req, res) => {
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

		const task = await Task.create({
			...req.body,
			budgetId: req.params.budgetId,
			userId: req.user.id,
		});

		// Add task to budget
		budget.tasks.push(task._id);
		await budget.save();

		res.status(201).json({
			success: true,
			data: task,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Update task
// @route     PUT /api/tasks/:id
// @access    Private
exports.updateTask = async (req, res) => {
	try {
		let task = await Task.findById(req.params.id);

		if (!task) {
			return res
				.status(404)
				.json({ success: false, message: 'Task not found' });
		}

		if (task.userId.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ success: false, message: 'Not authorized' });
		}

		// If completing task, set completedDate
		if (req.body.status === 'completed' && task.status !== 'completed') {
			req.body.completedDate = new Date();
		}

		task = await Task.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			data: task,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Delete task
// @route     DELETE /api/tasks/:id
// @access    Private
exports.deleteTask = async (req, res) => {
	try {
		const task = await Task.findById(req.params.id);

		if (!task) {
			return res
				.status(404)
				.json({ success: false, message: 'Task not found' });
		}

		if (task.userId.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ success: false, message: 'Not authorized' });
		}

		await Task.findByIdAndDelete(req.params.id);

		// Remove from budget
		await Budget.findByIdAndUpdate(task.budgetId, {
			$pull: { tasks: req.params.id },
		});

		res.status(200).json({
			success: true,
			message: 'Task deleted',
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
