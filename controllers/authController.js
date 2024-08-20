const { User } = require("../models/usersSchemas");
const bcrypt = require("bcrypt");
const { id } = require("date-fns/locale");
const jwt = require("jsonwebtoken");

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {
	const { username, firstname, lastname, email, password, gender } = req.body;

	// Validate incoming data
	if (!username || !firstname || !lastname || !email || !password || !gender) {
		return res.status(400).json({ message: "All fields are required" });
	}

	try {
		console.log("Received user data:", req.body);
		// Check for duplicate username
		const existingUsername = await User.findOne({ username }).lean().exec();
		if (existingUsername) {
			return res.status(409).json({
				message: "Username already exists. Please choose a different username.",
			});
		}

		// Check for duplicate email
		const existingEmail = await User.findOne({ email }).lean().exec();
		if (existingEmail) {
			return res.status(409).json({
				message:
					"Email address already registered. Please use a different email.",
			});
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10); // Using bcrypt for hashing with salt rounds

		// Create new user object
		const newUser = new User({
			username,
			firstname,
			lastname,
			email,
			gender,
			password: hashedPassword,
		});

		// Push email to contacts.emailAdress array
		newUser.contacts.emailAdress.push(email);

		// Save user to database
		const savedUser = await newUser.save();

		if (savedUser) {
			// Strip password from response
			const { password, ...userWithoutPassword } = savedUser._doc;
			return res.status(201).json(userWithoutPassword);
		} else {
			return res
				.status(400)
				.json({ message: "Failed to create user. Please try again later." });
		}
	} catch (error) {
		console.error("Error creating user:", error);
		return res.status(500).json({ message: "Server Error" });
	}
};

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ message: "All fields are required" });
	}

	const foundUser = await User.findOne({ username }).exec();

	if (!foundUser) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const match = await bcrypt.compare(password, foundUser.password);

	if (!match) return res.status(401).json({ message: "Unauthorized" });

	const accessToken = jwt.sign(
		{
			UserInfo: {
				userId: foundUser._id, // Add the user ID here
				username: foundUser.username,
				roles: foundUser.roles,
			},
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: "15m" }
	);

	const refreshToken = jwt.sign(
		{ username: foundUser.username },
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: "7d" }
	);

	// Create secure cookie with refresh token
	res.cookie("jwt", refreshToken, {
		httpOnly: true, //accessible only by web server
		secure: true, //https
		sameSite: "None", //cross-site cookie
		maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
	});

	// Send accessToken containing username, roles and id
	res.json({ accessToken });
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
	const cookies = req.cookies;

	if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

	const refreshToken = cookies.jwt;

	jwt.verify(
		refreshToken,
		process.env.REFRESH_TOKEN_SECRET,
		async (err, decoded) => {
			if (err) return res.status(403).json({ message: "Forbidden" });

			const foundUser = await User.findOne({
				username: decoded.username,
			}).exec();

			if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

			const accessToken = jwt.sign(
				{
					UserInfo: {
						username: foundUser.username,
						roles: foundUser.roles,
						userId: foundUser._id,
					},
				},
				process.env.ACCESS_TOKEN_SECRET,
				{ expiresIn: "15m" }
			);

			res.json({ accessToken });
		}
	);
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
	const cookies = req.cookies;
	if (!cookies?.jwt) return res.sendStatus(204); //No content
	res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
	res.json({ message: "Cookie cleared" });
};

module.exports = {
	createNewUser,
	login,
	refresh,
	logout,
};
