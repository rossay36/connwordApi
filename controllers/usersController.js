const { User, Post } = require("../models/usersSchemas");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res) => {
	// Get all users from MongoDB
	const users = await User.find().select("-password").lean();

	// If no users
	if (!users?.length) {
		return res.status(400).json({ message: "No users found" });
	}

	res.json(users);
};

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
	const {
		id,
		username,
		firstname,
		lastname,
		profilePicture,
		bio,
		coverPicture,
		education,
		address,
	} = req.body;

	// Confirm data
	if (!id) {
		return res
			.status(400)
			.json({ message: "All fields except password are required" });
	}

	if (
		req.userId === id ||
		req.roles.includes("Admin") ||
		req.roles.includes("Manager")
	) {
		// Check for duplicate
		const duplicate = await User.findOne({ username })
			.collation({ locale: "en", strength: 2 })
			.lean()
			.exec();

		// Allow updates to the original user
		if (duplicate && duplicate?._id.toString() !== id) {
			return res.status(409).json({ message: "Duplicate username" });
		}
		const user = await User.findById(id).exec();

		// Allow updates to the original user
		if (user?._id.toString() !== id) {
			return res
				.status(409)
				.json({ message: " You are not allowed for this operation " });
		}

		// Does the user exist to update?
		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		user.username = username;
		user.firstname = firstname;
		user.lastname = lastname;
		user.profilePicture = profilePicture;
		user.bio = bio;
		user.coverPicture = coverPicture;
		user.education = education;
		user.address = address;

		const updatedUser = await user.save();

		res.json({ message: `${updatedUser.username} updated` });
	} else {
		return res
			.status(409)
			.json({ message: "forbided, you can only update your account" });
	}
};

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
	const { id } = req.body;

	// Confirm data
	if (!id) {
		return res.status(400).json({ message: "User ID Required" });
	}

	if (
		req.userId === id ||
		req.roles.includes("Admin") ||
		req.roles.includes("Manager")
	) {
		// Does the user exist to delete?
		const user = await User.findById(id).exec();

		if (user?._id.toString() !== id) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		const result = await user.deleteOne();

		const reply = `Username ${user?.username} with ID ${user?._id} deleted`;

		res.json(reply);
	} else {
		return res
			.status(409)
			.json({ message: "forbided, you can only update your account" });
	}
};

module.exports = {
	getAllUsers,
	updateUser,
	deleteUser,
};
