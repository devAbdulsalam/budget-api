const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: [true, 'Please provide your full name'],
			trim: true,
			maxlength: [50, 'Name cannot be more than 50 characters'],
		},
		email: {
			type: String,
			required: [true, 'Please provide an email'],
			unique: true,
			lowercase: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				'Please provide a valid email',
			],
		},
		password: {
			type: String,
			required: [true, 'Please provide a password'],
			minlength: [6, 'Password should be minimum 6 characters'],
			select: false,
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		projects: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Budget',
			},
		],
	},
	{ timestamps: true },
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
userSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
	});
};

// Method to get refresh token
userSchema.methods.getRefreshToken = function () {
	return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
	});
};

module.exports = mongoose.model('User', userSchema);
