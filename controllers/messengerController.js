const { Message, User } = require("../models/usersSchemas"); // Import Message schema
const mongoose = require("mongoose");

// @desc Send a message
// @route POST /messages
// @access Private
const sendMessage = async (req, res) => {
	const { recipient, text } = req.body;
	const sender = req.userId;

	// Validate input
	if (!recipient || !text) {
		console.error("Validation Error: Recipient or text is missing");
		return res.status(400).json({ message: "Recipient and text are required" });
	}

	// Validate ObjectId formats
	if (
		!mongoose.Types.ObjectId.isValid(recipient) ||
		!mongoose.Types.ObjectId.isValid(sender)
	) {
		console.error("Invalid ObjectId format");
		return res
			.status(400)
			.json({ message: "Invalid recipient or sender ID format" });
	}

	try {
		// Check if recipient exists
		const recipientUser = await User.findById(recipient).exec();
		if (!recipientUser) {
			console.error(`Recipient not found: ${recipient}`);
			return res.status(404).json({ message: "Recipient not found" });
		}

		// Create and save the new message
		const newMessage = new Message({ sender, recipient, text });
		const savedMessage = await newMessage.save();

		res.status(201).json(savedMessage);
	} catch (error) {
		console.error("Error sending message:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

// @desc Get messages between two users
// @route GET /messages
// @access Private
const getMessages = async (req, res) => {
	const { recipientId } = req.params;
	const sender = req.userId;

	if (!recipientId) {
		return res.status(400).json({ message: "Recipient is required" });
	}

	// Validate recipientId
	if (!mongoose.Types.ObjectId.isValid(recipientId)) {
		return res.status(400).json({ message: "Invalid recipient ID" });
	}

	try {
		// Fetch the recipient user to check if they exist
		const recipientUser = await User.findById(recipientId).exec();
		if (!recipientUser) {
			return res.status(404).json({ message: "Recipient not found" });
		}

		// Fetch messages between sender and recipient
		const messages = await Message.find({
			$or: [
				{ sender, recipient: recipientId },
				{ sender: recipientId, recipient: sender },
			],
		})
			.sort({ createdAt: 1 }) // Make sure you're sorting by the correct field
			.populate("sender", "profilePicture username firstname lastname") // Populate sender details
			.populate("recipient", "profilePicture username firstname lastname") // Populate recipient details
			.exec();

		// Send messages with user details
		res.json(messages);
	} catch (error) {
		console.error("Error getting messages:", error.message);
		res.status(500).json({ message: "Server Error" });
	}
};

// @desc Delete a message
// @route DELETE /messages
// @access Private
const deleteMessage = async (req, res) => {
	const { messageId, forBoth } = req.body;
	const userId = req.userId; // Assuming user ID is attached to request

	if (!messageId) {
		return res.status(400).json({ message: "Message ID is required" });
	}

	try {
		const message = await Message.findById(messageId).exec();
		if (!message) {
			return res.status(404).json({ message: "Message not found" });
		}

		// Check if user is authorized to delete the message
		if (
			message.sender.toString() !== userId &&
			message.recipient.toString() !== userId
		) {
			return res
				.status(403)
				.json({ message: "Forbidden: You can only delete your own messages" });
		}

		if (forBoth) {
			// Delete message for both users
			await Message.findByIdAndDelete(messageId);
			// Optionally, notify the other user or update their message view
		} else {
			// Delete only for the user who sent it
			if (message.sender.toString() === userId) {
				await Message.findByIdAndDelete(messageId);
			} else {
				// If the user is the recipient and wants to hide the message, we could mark it as deleted instead
				// For simplicity, let's just delete the message
				await Message.findByIdAndDelete(messageId);
			}
		}

		res.json({ message: "Message deleted successfully" });
	} catch (error) {
		console.error("Error deleting message:", error.message);
		res.status(500).json({ message: "Server Error" });
	}
};

// @desc Edit a message
// @route PATCH /messages
// @access Private
const editMessage = async (req, res) => {
	const { messageId, newText } = req.body;
	const userId = req.userId; // Assuming user ID is attached to request

	if (!messageId || !newText) {
		return res
			.status(400)
			.json({ message: "Message ID and new text are required" });
	}

	try {
		const message = await Message.findById(messageId).exec();
		if (!message) {
			return res.status(404).json({ message: "Message not found" });
		}

		if (message.sender.toString() !== userId) {
			return res
				.status(403)
				.json({ message: "Forbidden: You can only edit your own messages" });
		}

		message.text = newText;
		await message.save();

		res.json({
			message: "Message updated successfully",
			updatedMessage: message,
		});
	} catch (error) {
		console.error("Error updating message:", error.message);
		res.status(500).json({ message: "Server Error" });
	}
};

// @desc Clear chat between two users
// @route DELETE /messages/clear
// @access Private
const clearChat = async (req, res) => {
	const { recipient } = req.body;
	const sender = req.userId;

	if (!recipient) {
		return res.status(400).json({ message: "Recipient is required" });
	}

	try {
		const recipientUser = await User.findById(recipient).exec();
		if (!recipientUser) {
			return res.status(404).json({ message: "Recipient not found" });
		}

		// Delete all messages between the sender and recipient
		await Message.deleteMany({
			$or: [
				{ sender, recipient },
				{ sender: recipient, recipient: sender },
			],
		});

		res.json({ message: "Chat cleared successfully" });
	} catch (error) {
		console.error("Error clearing chat:", error.message);
		res.status(500).json({ message: "Server Error" });
	}
};

module.exports = {
	sendMessage,
	getMessages,
	deleteMessage,
	editMessage,
	clearChat,
};
