require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require('./routes/authRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(mongoSanitize());

// Connect to MongoDB
const connectDB = async () => {
	try {
		const mongoUrl = process.env.MONGO_URL;
		if (!mongoUrl) {
			throw new Error('MONGO_URL is not defined in environment variables');
		}

		const conn = await mongoose.connect(mongoUrl, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		console.log(`MongoDB Connected: ${conn.connection.host}`);
		return conn;
	} catch (error) {
		console.error(`Error connecting to MongoDB: ${error.message}`);
		process.exit(1);
	}
};

// Connect to database
connectDB();

// Health check route
app.get('/health', (req, res) => {
	res.status(200).json({ success: true, message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/budgets', budgetRoutes);

// 404 handler
app.use((req, res) => {
	res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	// multer errors should return a 400 with a friendly message
	if (err.name === 'MulterError') {
		let message = err.message;
		if (err.code === 'LIMIT_FILE_SIZE') {
			message = 'File too large. Max size is 5MB.';
		} else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
			message = 'Only image files are allowed.';
		}
		return res.status(400).json({ success: false, message });
	}
	res.status(err.status || 500).json({
		success: false,
		message: err.message || 'Internal Server Error',
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`Budget Tracker Server running on http://localhost:${PORT}`);
});
