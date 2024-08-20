const cron = require("node-cron");
const mongoose = require("mongoose");
const { User, Post, Comment } = require("../models/usersSchemas");

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

const updateProfilePicture = async (req, res) => {
	const { userId, image } = req.body;
	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Update profile picture
		user.profilePicture = image;
		await user.save();

		// Create a new post for profile picture update
		const sex =
			user.gender === "Male" ? "his" : user.gender === "Female" ? "her" : null;
		const newPost = await Post.create({
			user: userId, // Assuming 'user' field in Post model is a reference to User
			text: `${user.username} updated ${sex} profile picture.`,
			image: [image],
		});

		// Update user's posts array
		user.posts.push(newPost._id);
		await user.save();

		res.json({ message: "Profile picture updated successfully", user });
	} catch (error) {
		console.error("Error updating profile picture:", error.message);
		res.status(500).json({ message: "Server Error" });
	}
};

const updateCoverPicture = async (req, res) => {
	const { userId, image } = req.body;
	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Update cover picture
		user.coverPicture = image;
		await user.save();

		// Create a new post for cover picture update
		const sex =
			user.gender === "Male" ? "his" : user.gender === "Female" ? "her" : null;

		const newPost = await Post.create({
			user: userId, // Assuming 'user' field in Post model is a reference to User
			text: `${user.username} updated ${sex} cover picture.`,
			image: [image],
		});

		user.posts.push(newPost._id);
		await user.save();

		res.json({ message: "Cover picture updated successfully", user });
	} catch (error) {
		console.error("Error updating cover picture:", error.message);
		res.status(500).json({ message: "Server Error" });
	}
};

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
	const { userId } = req.body;

	// Confirm data
	if (!userId) {
		return res.status(400).json({ message: "User ID Required" });
	}

	try {
		// Verify permissions
		if (
			req.userId.toString() === userId ||
			req.roles.includes("Admin") ||
			req.roles.includes("Manager")
		) {
			// Delete posts by the user
			await Post.deleteMany({ user: userId });

			// Delete comments made by the user
			await Comment.deleteMany({ user: userId });

			// Remove user from friend lists of other users
			await User.updateMany(
				{
					$or: [
						{ friends: userId },
						{ followers: userId },
						{ following: userId },
					],
				},
				{ $pull: { friends: userId, followers: userId, following: userId } }
			);

			// Remove user from friendRequests and friendReceiver lists
			await User.updateMany(
				{ $or: [{ friendRequests: userId }, { friendReceiver: userId }] },
				{ $pull: { friendRequests: userId, friendReceiver: userId } }
			);

			// Update likes: Remove user ID from all likes arrays
			await Post.updateMany({ likes: userId }, { $pull: { likes: userId } });
			await Comment.updateMany({ likes: userId }, { $pull: { likes: userId } });

			// Delete the user document
			const deletedUser = await User.findByIdAndDelete(userId);

			if (!deletedUser) {
				return res.status(404).json({ message: "User not found" });
			}

			return res.status(200).json({
				message: `User ${deletedUser.username} deleted successfully`,
			});
		} else {
			return res.status(403).json({
				message:
					"Forbidden: You can only delete your own account or have sufficient permissions",
			});
		}
	} catch (error) {
		console.error("Error deleting user:", error);
		return res.status(500).json({ message: "Server Error" });
	}
};

const updateIsActiveSlide = async (req, res) => {
	const { userId, isActiveSlide } = req.body;

	try {
		const user = await User.findById(userId).exec();

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.isActiveSlide = isActiveSlide;
		await user.save();

		res.json({ message: "isActiveSlide updated successfully" });
	} catch (error) {
		console.error("Error updating isActiveSlide:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

module.exports = {
	getAllUsers,
	deleteUser,
	updateIsActiveSlide,
	updateProfilePicture,
	updateCoverPicture,
};
