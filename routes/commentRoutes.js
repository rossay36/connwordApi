const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { verifyTokens } = require("../middleware/verifytoken");

router.use(verifyTokens);

router
	.route("/")
	.post(commentController.createNewComment)
	.get(commentController.getAllComments)
	.put(commentController.updateComment)
	.delete(commentController.deleteComment);

module.exports = router;
