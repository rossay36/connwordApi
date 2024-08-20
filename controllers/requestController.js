const mongoose = require("mongoose");
const { User, Post, Comment } = require("../models/usersSchemas");

// Send Friend Request Controller
const sendFriendRequest = async (req, res) => {
	const { userId, friendId } = req.body;

	try {
		// Check if userId and friendId are valid
		const user = await User.findById(userId).exec();
		const friend = await User.findById(friendId).exec();

		if (!user || !friend) {
			return res.status(404).json({ message: "User or friend not found" });
		}

		// Check if friend request already sent
		if (
			friend.friendReceiver.includes(userId) ||
			friend.friendRequests.includes(userId)
		) {
			return res.status(400).json({ message: "Friend request already sent" });
		}

		// Start a MongoDB session and transaction
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Send friend request
			await User.findOneAndUpdate(
				{ _id: userId },
				{ $addToSet: { friendRequests: friendId } },
				{ session }
			).exec();

			await User.findOneAndUpdate(
				{ _id: friendId },
				{ $addToSet: { friendReceiver: userId } },
				{ session }
			).exec();

			// Commit the transaction
			await session.commitTransaction();
			session.endSession();

			res.json({ message: "Friend request sent" });
		} catch (error) {
			// Abort transaction on error
			await session.abortTransaction();
			session.endSession();
			throw error;
		}
	} catch (error) {
		console.error("Error sending friend request:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

// Cancel Friend Request Controller
const cancelFriendRequest = async (req, res) => {
	const { userId, friendId } = req.body;

	try {
		// Check if userId and friendId are valid
		const user = await User.findById(userId).exec();
		const friend = await User.findById(friendId).exec();

		if (!user || !friend) {
			return res.status(404).json({ message: "User or friend not found" });
		}

		// Start a MongoDB session and transaction
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Cancel friend request
			await User.findOneAndUpdate(
				{ _id: userId },
				{ $pull: { friendRequests: friendId } },
				{ session }
			).exec();

			await User.findOneAndUpdate(
				{ _id: friendId },
				{ $pull: { friendReceiver: userId } },
				{ session }
			).exec();

			// Commit the transaction
			await session.commitTransaction();
			session.endSession();

			res.json({ message: "Friend request canceled" });
		} catch (error) {
			// Abort transaction on error
			await session.abortTransaction();
			session.endSession();
			throw error;
		}
	} catch (error) {
		console.error("Error canceling friend request:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

const acceptFriendRequest = async (req, res) => {
	const { friendId } = req.body; // friendId is John’s ID
	const userId = req.userId; // Joe’s ID from the JWT

	if (!friendId) {
		return res.status(400).json({ message: "Friend ID is required" });
	}

	try {
		// Fetch Joe's and John's data
		const user = await User.findById(userId).exec(); // Joe's document
		const friend = await User.findById(friendId).exec(); // John's document

		if (!user || !friend) {
			return res.status(404).json({ message: "User or friend not found" });
		}

		// Check if there is a pending friend request from friendId to userId
		if (!user.friendReceiver.includes(friendId)) {
			// Verify if John’s ID is in Joe’s friendReceiver
			return res
				.status(400)
				.json({ message: "No pending friend request found" });
		}

		// Start a MongoDB session and transaction
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Accept the friend request
			await User.findOneAndUpdate(
				{ _id: userId }, // Joe’s ID
				{
					$pull: { friendReceiver: friendId },
					// $pull: { friendRequests: friendId },
					$addToSet: { friends: friendId, following: friendId },
				},
				{ session }
			).exec();

			await User.findOneAndUpdate(
				{ _id: friendId }, // John’s ID
				{
					$pull: { friendRequests: userId },
					// $pull: { friendReceiver: userId },
					$addToSet: { friends: userId, followers: userId },
				},
				{ session }
			).exec();

			// Commit the transaction
			await session.commitTransaction();
			session.endSession();

			res.json({ message: "Friend request accepted" });
		} catch (error) {
			// Abort transaction on error
			await session.abortTransaction();
			session.endSession();
			throw error;
		}
	} catch (error) {
		console.error("Error accepting friend request:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

const rejectFriendRequest = async (req, res) => {
	const { friendId } = req.body;
	const userId = req.userId; // Use authenticated user's ID

	if (!friendId) {
		return res.status(400).json({ message: "Friend ID is required" });
	}

	try {
		// Fetch user and friend documents
		const user = await User.findById(userId).exec(); // User is the one rejecting the request
		const friend = await User.findById(friendId).exec(); // Friend is the one who sent the request

		if (!user || !friend) {
			return res.status(404).json({ message: "User or friend not found" });
		}

		// Check if there is a pending friend request from friendId to userId
		if (!user.friendReceiver.includes(friendId)) {
			return res
				.status(400)
				.json({ message: "No pending friend request found" });
		}

		// Start a MongoDB session and transaction
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Reject friend request for the user
			await User.findOneAndUpdate(
				{ _id: userId },
				{ $pull: { friendReceiver: friendId } }, // Remove friend's ID from user's friendRequests
				{ session }
			).exec();

			// Reject friend request for the friend
			await User.findOneAndUpdate(
				{ _id: friendId },
				{ $pull: { friendRequests: userId } }, // Remove user's ID from friend's friendReceiver
				{ session }
			).exec();

			// Commit the transaction
			await session.commitTransaction();
			session.endSession();

			res.json({ message: "Friend request rejected" });
		} catch (error) {
			// Abort transaction on error
			await session.abortTransaction();
			session.endSession();
			throw error;
		}
	} catch (error) {
		console.error("Error rejecting friend request:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

const unfriendUser = async (req, res) => {
	const { userId, friendId } = req.body;

	try {
		// Check if userId and friendId are valid
		const user = await User.findById(userId).exec();
		const friend = await User.findById(friendId).exec();

		if (!user || !friend) {
			return res.status(404).json({ message: "User or friend not found" });
		}

		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Update user document
			await User.findOneAndUpdate(
				{ _id: userId },
				{
					$pull: {
						friends: friendId,
						following: friendId,
						followers: friendId,
					},
				},
				{ session }
			).exec();

			// Update friend document
			await User.findOneAndUpdate(
				{ _id: friendId },
				{
					$pull: { friends: userId, followers: userId, following: userId },
				},
				{ session }
			).exec();

			// Commit the transaction
			await session.commitTransaction();
			session.endSession();

			res.json({ message: "Unfollowed user successfully" });
		} catch (error) {
			// Abort transaction on error
			await session.abortTransaction();
			session.endSession();
			console.error("Error unfollowing user:", error);
			res.status(500).json({ message: "Server Error" });
		}
	} catch (error) {
		console.error("Error finding user or friend:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

module.exports = {
	sendFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	cancelFriendRequest,
	unfriendUser,
};
