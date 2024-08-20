const express = require("express");
const router = express.Router();
const {
	sendMessage,
	getMessages,
	deleteMessage,
	editMessage,
	clearChat,
} = require("../controllers/messengerController");
const { verifyTokens } = require("../middleware/verifytoken");

router.use(verifyTokens);

// @route POST /messages
// @desc Send a message
// @access Private
router.post("/", sendMessage);

// @route GET /messages
// @desc Get messages between two users
// @access Private
router.get("/:recipientId", getMessages);

// @route DELETE /messages
// @desc Delete a message
// @access Private
router.delete("/", deleteMessage);

// @route PATCH /messages
// @desc Edit a message
// @access Private
router.patch("/", editMessage);

// @route DELETE /messages/clear
// @desc Clear chat between two users
// @access Private
router.delete("/clear", clearChat);

module.exports = router;
