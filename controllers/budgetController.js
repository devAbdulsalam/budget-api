const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const Task = require('../models/Task');
const Image = require('../models/Image');

// @desc      Get all budgets for user
// @route     GET /api/budgets
// @access    Private
exports.getBudgets = async (req, res) => {
	try {
		const budgets = await Budget.find({ userId: req.user.id })
			.populate('expenses')
			.populate('tasks')
			.populate('images');

		res.status(200).json({
			success: true,
			count: budgets.length,
			data: budgets,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Get single budget
// @route     GET /api/budgets/:id
// @access    Private
exports.getBudget = async (req, res) => {
	try {
		const budget = await Budget.findById(req.params.id)
			.populate('expenses')
			.populate('tasks')
			.populate('images');

		if (!budget) {
			return res
				.status(404)
				.json({ success: false, message: 'Budget not found' });
		}

		// Check ownership
		if (budget.userId.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ success: false, message: 'Not authorized' });
		}

		res.status(200).json({
			success: true,
			data: budget,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Create budget
// @route     POST /api/budgets
// @access    Private
exports.createBudget = async (req, res) => {
	try {
		const { projectName, description, totalBudget, startDate, endDate } =
			req.body;

		const budget = await Budget.create({
			projectName,
			description,
			totalBudget,
			userId: req.user.id,
			startDate,
			endDate,
		});

		res.status(201).json({
			success: true,
			data: budget,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Update budget
// @route     PUT /api/budgets/:id
// @access    Private
exports.updateBudget = async (req, res) => {
	try {
		let budget = await Budget.findById(req.params.id);

		if (!budget) {
			return res
				.status(404)
				.json({ success: false, message: 'Budget not found' });
		}

		// Check ownership
		if (budget.userId.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ success: false, message: 'Not authorized' });
		}

		budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			data: budget,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Delete budget
// @route     DELETE /api/budgets/:id
// @access    Private
exports.deleteBudget = async (req, res) => {
	try {
		const budget = await Budget.findById(req.params.id);

		if (!budget) {
			return res
				.status(404)
				.json({ success: false, message: 'Budget not found' });
		}

		// Check ownership
		if (budget.userId.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ success: false, message: 'Not authorized' });
		}

		await Budget.findByIdAndDelete(req.params.id);
		await Expense.deleteMany({ budgetId: req.params.id });
		await Task.deleteMany({ budgetId: req.params.id });
		await Image.deleteMany({ budgetId: req.params.id });

		res.status(200).json({
			success: true,
			message: 'Budget deleted',
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
