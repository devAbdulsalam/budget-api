const User = require('../models/User');

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = async (req, res) => {
	try {
		const { fullName, email, password, passwordConfirm } = req.body;

		// Validate
		if (!fullName || !email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Please provide all required fields',
			});
		}

		if (password !== passwordConfirm) {
			return res
				.status(400)
				.json({ success: false, message: 'Passwords do not match' });
		}

		// Check if user exists
		let user = await User.findOne({ email });
		if (user) {
			return res
				.status(400)
				.json({ success: false, message: 'Email is already in use' });
		}

		// Create user
		user = await User.create({
			fullName,
			email,
			password,
		});

		// Generate token
		const token = user.getSignedJwtToken();
		const refreshToken = user.getRefreshToken();

		res.status(201).json({
			success: true,
			message: 'User registered successfully',
			token,
			refreshToken,
			user: {
				id: user._id,
				fullName: user.fullName,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Validate
		if (!email || !password) {
			return res
				.status(400)
				.json({ success: false, message: 'Please provide email and password' });
		}

		// Check for user
		const user = await User.findOne({ email }).select('+password');
		if (!user) {
			return res
				.status(401)
				.json({ success: false, message: 'Invalid credentials' });
		}

		// Check if password matches
		const isMatch = await user.matchPassword(password);
		if (!isMatch) {
			return res
				.status(401)
				.json({ success: false, message: 'Invalid credentials' });
		}

		// Create token
		const token = user.getSignedJwtToken();
		const refreshToken = user.getRefreshToken();

		res.status(200).json({
			success: true,
			message: 'Login successful',
			token,
			refreshToken,
			user: {
				id: user._id,
				fullName: user.fullName,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Refresh token
// @route     POST /api/auth/refresh
// @access    Private
exports.refreshToken = async (req, res) => {
	try {
		const token = req.user.getSignedJwtToken();
		const refreshToken = req.user.getRefreshToken();

		res.status(200).json({
			success: true,
			token,
			refreshToken,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).populate('projects');

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Update profile (name, email)
// @route     PUT /api/auth/me
// @access    Private
exports.updateProfile = async (req, res) => {
	try {
		const { fullName, email } = req.body;
		const user = await User.findById(req.user.id);
		if (!user)
			return res
				.status(404)
				.json({ success: false, message: 'User not found' });

		if (email && email !== user.email) {
			const exists = await User.findOne({ email });
			if (exists)
				return res
					.status(400)
					.json({ success: false, message: 'Email already in use' });
			user.email = email;
		}
		if (fullName) user.fullName = fullName;

		await user.save();

		res.status(200).json({
			success: true,
			data: { id: user._id, fullName: user.fullName, email: user.email },
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @desc      Change password
// @route     PUT /api/auth/me/password
// @access    Private
exports.updatePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword, newPasswordConfirm } = req.body;
		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				success: false,
				message: 'Please provide current and new passwords',
			});
		}
		if (newPassword !== newPasswordConfirm) {
			return res
				.status(400)
				.json({ success: false, message: 'New passwords do not match' });
		}

		const user = await User.findById(req.user.id).select('+password');
		if (!user)
			return res
				.status(404)
				.json({ success: false, message: 'User not found' });

		const isMatch = await user.matchPassword(currentPassword);
		if (!isMatch)
			return res
				.status(401)
				.json({ success: false, message: 'Current password is incorrect' });

		user.password = newPassword;
		await user.save();

		res.status(200).json({ success: true, message: 'Password updated' });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
