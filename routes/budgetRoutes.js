const express = require('express');
const {
	getBudgets,
	getBudget,
	createBudget,
	updateBudget,
	deleteBudget,
} = require('../controllers/budgetController');
const {
	getExpenses,
	createExpense,
	updateExpense,
	deleteExpense,
} = require('../controllers/expenseController');
const {
	getTasks,
	createTask,
	updateTask,
	deleteTask,
} = require('../controllers/taskController');
const {
	getImages,
	createImage,
	deleteImage,
} = require('../controllers/imageController');
// multer upload middleware configured to store file in memory
const upload = require('../middleware/multer');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Budget routes
router.get('/', getBudgets);
router.post('/', createBudget);
router.get('/:id', getBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

// Expense routes
router.get('/:budgetId/expenses', getExpenses);
router.post('/:budgetId/expenses', createExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

// Task routes
router.get('/:budgetId/tasks', getTasks);
router.post('/:budgetId/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

// Image routes
router.get('/:budgetId/images', getImages);
// use multer memory-storage middleware to handle file upload; field name is "image"
router.post('/:budgetId/images', upload.single('image'), createImage);
router.delete('/images/:id', deleteImage);

module.exports = router;
