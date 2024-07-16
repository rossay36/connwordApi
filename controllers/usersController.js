const cron = require("node-cron");
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
		userId,
		username,
		firstname,
		lastname,
		profilePicture,
		bio,
		coverPicture,
		education,
		address,
		job,
		workAt,
		hobbies,
		relationship,
	} = req.body;

	try {
		// Check if required fields are present
		if (!userId) {
			return res.status(400).json({ message: "User ID is required" });
		}

		// Verify permissions
		if (
			req.userId !== userId &&
			!req.roles.includes("Admin") &&
			!req.roles.includes("Manager")
		) {
			return res
				.status(403)
				.json({ message: "Forbidden: You can only update your own account" });
		}

		// Find the user by ID
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Store previous profile and cover picture URLs for comparison
		const previousProfilePicture = user.profilePicture;
		const previousCoverPicture = user.coverPicture;

		// Update user fields
		user.username = username;
		user.firstname = firstname;
		user.lastname = lastname;
		user.profilePicture = profilePicture;
		user.bio = bio;
		user.coverPicture = coverPicture;
		user.job = job;
		user.workAt = workAt;
		user.hobbies = hobbies;
		user.relationship = relationship;

		// Update education fields (assuming education is an array of objects)
		if (education) {
			user.education = {
				school: education.school,
				degree: education.degree,
				fieldOfStudy: education.fieldOfStudy,
				startYear: education.startYear,
				endYear: education.endYear,
			};
		}

		// Update address fields
		if (address) {
			user.address = {
				street: address.street,
				city: address.city,
				state: address.state,
				country: address.country,
				postalCode: address.postalCode,
			};
		}

		// Save updated user
		const updatedUser = await user.save();

		// Create a new post if profile picture or cover picture has changed
		if (profilePicture !== previousProfilePicture) {
			const profilePicturePost = await Post.create({
				user: userId,
				text: `${user.username} updated their profile picture.`,
				image: [profilePicture],
			});
		}

		if (coverPicture !== previousCoverPicture) {
			const coverPicturePost = await Post.create({
				user: userId,
				text: `${user.username} updated their cover picture.`,
				image: [coverPicture],
			});
		}

		// Return response
		res.json({ message: `${updatedUser.username} updated`, user: updatedUser });
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ message: "Server Error" });
	}
};

// Update profile picture controller
const updateProfilePicture = async (req, res) => {
	const { userId, profilePicture } = req.body;

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Update profilePicture field
		user.profilePicture = profilePicture;

		// Update lastPictureUpdate field
		user.lastPictureUpdate = new Date();

		// Save updated user
		const updatedUser = await user.save();

		return res.json({
			message: "Profile picture updated",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Error updating profile picture:", error);
		return res.status(500).json({ message: "Server error" });
	}
};

// Update cover picture controller (similar structure)
const updateCoverPicture = async (req, res) => {
	const { userId, coverPicture } = req.body;

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Update coverPicture field
		user.coverPicture = coverPicture;

		// Update lastPictureUpdate field
		user.lastPictureUpdate = new Date();

		// Save updated user
		const updatedUser = await user.save();

		return res.json({
			message: "Cover picture updated",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Error updating cover picture:", error);
		return res.status(500).json({ message: "Server error" });
	}
};

// Function to create a new post
const createPost = async (userId, imageUrl, type) => {
	try {
		const newPost = new Post({
			user: userId,
			title: `${type} updated`,
			text: `Updated ${type}`,
			image: [imageUrl], // Assuming imageUrl is a string
		});

		const savedPost = await newPost.save();

		// Directly push the post ID into user's posts array
		const user = await User.findById(userId);
		if (!user) {
			throw new Error(`User with id ${userId} not found`);
		}

		user.posts.push(savedPost._id);
		await user.save();

		console.log(`Created ${type} post for user ${userId}`);

		return savedPost;
	} catch (error) {
		console.error(`Error creating ${type} post:`, error);
		throw error;
	}
};

// Schedule a task to check for delayed posts every minute
cron.schedule("* * * * *", async () => {
	try {
		// Get users who have updated their profile/cover picture more than 30 minutes ago
		const usersToUpdate = await User.find({
			$or: [
				{
					profilePicture: {
						$exists: true,
						lastPictureUpdate: { $lte: new Date(Date.now() - 1 * 60 * 1000) },
					},
				},
				{
					coverPicture: {
						$exists: true,
						lastPictureUpdate: { $lte: new Date(Date.now() - 1 * 60 * 1000) },
					},
				},
			],
		});

		for (const user of usersToUpdate) {
			if (user.profilePicture) {
				await createPost(user._id, user.profilePicture, "Profile Picture");
			}
			if (user.coverPicture) {
				await createPost(user._id, user.coverPicture, "Cover Picture");
			}

			// Reset the lastPictureUpdate timestamp to prevent re-posting
			user.lastPictureUpdate = new Date();
			await user.save();
		}
	} catch (error) {
		console.error("Error processing delayed posts:", error);
	}
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
	const { id } = req.body;

	// Confirm data
	if (!id) {
		return res.status(400).json({ message: "User ID Required" });
	}

	try {
		// Verify permissions
		if (
			req.userId === id ||
			req.roles.includes("Admin") ||
			req.roles.includes("Manager")
		) {
			// Find the user to delete
			const user = await User.findById(id);

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			// Delete posts by the user
			await Post.deleteMany({ user: id });

			// Delete comments made by the user
			await Comment.deleteMany({ user: id });

			// Remove user from friend lists of other users
			await User.updateMany(
				{ $or: [{ friends: id }, { followers: id }, { following: id }] },
				{ $pull: { friends: id, followers: id, following: id } }
			);

			// Remove user from friendRequests and friendReceiver lists
			await User.updateMany(
				{ $or: [{ friendRequests: id }, { friendReceiver: id }] },
				{ $pull: { friendRequests: id, friendReceiver: id } }
			);

			// Update likes: Remove user ID from all likes arrays
			await Post.updateMany({ likes: id }, { $pull: { likes: id } });

			await Comment.updateMany({ likes: id }, { $pull: { likes: id } });

			// Delete the user document
			await user.delete();

			return res.json({
				message: `User ${user.username} deleted successfully`,
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

const sendFriendRequest = async (req, res) => {
	const { userId, friendId } = req.body;

	try {
		if (userId === friendId) {
			return res
				.status(400)
				.json({ message: "Cannot send friend request to yourself" });
		}

		const user = await User.findById(userId).exec();
		const friend = await User.findById(friendId).exec();

		if (!user || !friend) {
			return res.status(404).json({ message: "User or friend not found" });
		}

		// Check if friend request already sent
		if (friend.friendReceiver.includes(userId)) {
			return res.status(400).json({ message: "Friend request already sent" });
		}
		if (friend.friendRequests.includes(userId)) {
			return res.status(400).json({ message: "Friend request already sent" });
		}

		// Add friendId to user's friendReceiver
		friend.friendReceiver.push(userId);
		await friend.save();

		if (user.friendReceiver.includes(friendId)) {
			return res.status(400).json({ message: "Friend request already sent" });
		}

		// Add userId to friend's friendRequests (if needed)
		if (!user.friendRequests.includes(friendId)) {
			user.friendRequests.push(friendId);
			await user.save();
		}

		res.json({ message: "Friend request sent" });
	} catch (error) {
		console.error("Error sending friend request:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

const acceptFriendRequest = async (req, res) => {
	const { userId, friendId } = req.body;

	try {
		const user = await User.findById(userId).exec();
		const friend = await User.findById(friendId).exec();

		// Check if user or friend not found
		if (!user || !friend) {
			return res.status(404).json({ message: "User or friend not found" });
		}

		// Check if friend request exists
		if (!friend.friendReceiver.includes(userId)) {
			return res
				.status(400)
				.json({ message: "No friend request from this user" });
		}

		// Remove friendId from user's friend requests
		friend.friendReceiver = friend.friendReceiver.filter(
			(id) => id.toString() !== userId
		);

		// Add friendId to user's friends and following
		friend.friends.push(userId);
		friend.followers.push(userId);

		await friend.save();

		// Remove userId from friend's friend requests
		user.friendRequests = user.friendRequests.filter(
			(id) => id.toString() !== friendId
		);

		// Add userId to friend's friends and followers
		user.friends.push(friendId);
		user.following.push(friendId);

		await user.save();

		res.json({ message: "Friend request accepted" });
	} catch (error) {
		console.error("Error accepting friend request:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

const rejectFriendRequest = async (req, res) => {
	const { userId, friendId } = req.body;

	try {
		const user = await User.findById(userId).exec();
		const friend = await User.findById(friendId).exec();

		if (!user || !friend) {
			return res.status(404).json({ message: "User or friend not found" });
		}

		// Check if friend request exists
		if (!friend.friendReceiver.includes(userId)) {
			return res
				.status(400)
				.json({ message: "No friend request from this user" });
		}

		// Remove friendId from user's friend requests
		friend.friendReceiver = friend.friendReceiver.filter(
			(id) => id.toString() !== userId
		);
		await friend.save();

		user.friendRequests = user.friendRequests.filter(
			(id) => id.toString() !== friendId
		);
		await user.save();

		res.json({ message: "Friend request rejected" });
	} catch (error) {
		console.error("Error rejecting friend request:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

const cancelFriendRequest = async (req, res) => {
	const { userId, friendId } = req.body;

	try {
		const user = await User.findById(userId).exec();
		const friend = await User.findById(friendId).exec();

		if (!friend) {
			return res.status(404).json({ message: "User not found" });
		}

		// Remove friendId from user's friend requests
		friend.friendReceiver = friend.friendReceiver.filter(
			(id) => id.toString() !== userId
		);
		await friend.save();

		// Remove friendId from user's friend requests
		user.friendRequests = user.friendRequests.filter(
			(id) => id.toString() !== friendId
		);
		await user.save();

		res.json({ message: "Friend request canceled" });
	} catch (error) {
		console.error("Error canceling friend request:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

const unfriendUser = async (req, res) => {
	const { userId, friendId } = req.body;

	try {
		const user = await User.findById(userId).exec();
		const friend = await User.findById(friendId).exec();

		if (!user || !friend) {
			return res.status(404).json({ message: "User or friend not found" });
		}

		// Remove friendId from user's friends, following, and followers arrays
		if (user.friends.includes(friendId)) {
			user.friends = user.friends.filter((id) => id.toString() !== friendId);
		}

		if (user.following.includes(friendId)) {
			user.following = user.following.filter(
				(id) => id.toString() !== friendId
			);
		}

		if (user.followers.includes(friendId)) {
			user.followers = user.followers.filter(
				(id) => id.toString() !== friendId
			);
		}

		// Save the updated user document
		await user.save();

		// Remove userId from friend's friends, followers, and following arrays
		if (friend.friends.includes(userId)) {
			friend.friends = friend.friends.filter((id) => id.toString() !== userId);
		}

		if (friend.followers.includes(userId)) {
			friend.followers = friend.followers.filter(
				(id) => id.toString() !== userId
			);
		}

		if (friend.following.includes(userId)) {
			friend.following = friend.following.filter(
				(id) => id.toString() !== userId
			);
		}

		// Save the updated friend document
		await friend.save();

		res.json({ message: "User unfriended and unfollowed successfully" });
	} catch (error) {
		console.error("Error unfriending user:", error);
		res.status(500).json({ message: "Server Error" });
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
	updateUser,
	deleteUser,
	sendFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	cancelFriendRequest,
	unfriendUser,
	updateIsActiveSlide,
	updateProfilePicture,
	updateCoverPicture,
};
