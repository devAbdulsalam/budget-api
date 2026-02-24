const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// @desc      Get all expenses for a budget
// @route     GET /api/budgets/:budgetId/expenses
// @access    Private
exports.getExpenses = async (req, res) => {
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

		const expenses = await Expense.find({ budgetId: req.params.budgetId });

		const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
		const remaining = budget.totalBudget - totalSpent;

		res.status(200).json({
			success: true,
			count: expenses.length,
			totalSpent,
			remaining,
			data: expenses,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Create expense
// @route     POST /api/budgets/:budgetId/expenses
// @access    Private
exports.createExpense = async (req, res) => {
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

		const expense = await Expense.create({
			...req.body,
			budgetId: req.params.budgetId,
			userId: req.user.id,
		});

		// Add expense to budget
		budget.expenses.push(expense._id);
		await budget.save();

		res.status(201).json({
			success: true,
			data: expense,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Update expense
// @route     PUT /api/expenses/:id
// @access    Private
exports.updateExpense = async (req, res) => {
	try {
		let expense = await Expense.findById(req.params.id);

		if (!expense) {
			return res
				.status(404)
				.json({ success: false, message: 'Expense not found' });
		}

		if (expense.userId.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ success: false, message: 'Not authorized' });
		}

		expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			data: expense,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Delete expense
// @route     DELETE /api/expenses/:id
// @access    Private
exports.deleteExpense = async (req, res) => {
	try {
		const expense = await Expense.findById(req.params.id);

		if (!expense) {
			return res
				.status(404)
				.json({ success: false, message: 'Expense not found' });
		}

		if (expense.userId.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ success: false, message: 'Not authorized' });
		}

		await Expense.findByIdAndDelete(req.params.id);

		// Remove from budget
		await Budget.findByIdAndUpdate(expense.budgetId, {
			$pull: { expenses: req.params.id },
		});

		res.status(200).json({
			success: true,
			message: 'Expense deleted',
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
